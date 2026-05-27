import { practiceBlueprints } from '../data/practice-blueprints'
import { fetchSchoolExamQuestionBank, fetchSchoolExamQuestionSummary } from './school-exam-service'
import { normalizeSchoolExamMarkdown } from '../utils/school-exam-content'
import type {
  PracticeBlueprint,
  PracticeExamCatalogItem,
  PracticeQuestion,
  PracticeSearchFilters,
} from '../types/practice-types'
import type { ExamDraftSession } from '../../exam/store/exam-draft-store'

type QuestionBankOverview = {
  totalQuestions: number
  typeCounts: Record<string, number>
  levelCounts: Record<number, number>
  schools: number
}

type SelectionContext = {
  preferredSchoolName?: string
  usedQuestionIds: Set<string>
  perExamCount: Map<string, number>
  perTopicCount: Map<string, number>
}

const SUBJECT_ID_TO_CODE: Record<string, string> = {
  TOAN: 'TOAN',
}

const SOFT_MAX_QUESTIONS_PER_SOURCE_EXAM = 3
const SOFT_MAX_QUESTIONS_PER_TOPIC = 2

let questionBankCache: PracticeQuestion[] | null = null

export function searchPracticeExamCatalog(
  catalog: PracticeExamCatalogItem[],
  filters: PracticeSearchFilters,
): PracticeExamCatalogItem[] {
  const keyword = normalize(filters.keyword)

  return catalog.filter((exam) => {
    const matchesSubject = !filters.subjectId || exam.subjectId === filters.subjectId
    const matchesYear = filters.year === 'all' || exam.year === filters.year
    const haystack = normalize(
      [exam.examTitle, exam.schoolName, exam.city, exam.tags.join(' ')].join(' '),
    )
    const matchesKeyword = !keyword || haystack.includes(keyword)

    return matchesSubject && matchesYear && matchesKeyword
  })
}

export function getPracticeBlueprints(): PracticeBlueprint[] {
  return practiceBlueprints
}

export async function getPracticeQuestionBankOverview(subjectId = 'TOAN'): Promise<QuestionBankOverview> {
  const questionBankSummary = await fetchSchoolExamQuestionSummary(SUBJECT_ID_TO_CODE[subjectId] ?? subjectId)

  const typeCounts = questionBankSummary.reduce<Record<string, number>>((acc, question) => {
    acc[question.questionType] = (acc[question.questionType] ?? 0) + 1
    return acc
  }, {})

  const levelCounts = questionBankSummary.reduce<Record<number, number>>((acc, question) => {
    acc[question.difficultyLevel] = (acc[question.difficultyLevel] ?? 0) + 1
    return acc
  }, {})

  return {
    totalQuestions: questionBankSummary.length,
    typeCounts,
    levelCounts,
    schools: Array.from(new Set(questionBankSummary.map((question) => question.schoolName))).length,
  }
}

export async function createPracticeExamSession(input: {
  blueprintId: string
  subjectId: string
  subjectName: string
  preferredSchoolName?: string
}): Promise<ExamDraftSession> {
  const blueprint = practiceBlueprints.find((item) => item.blueprintId === input.blueprintId)
  if (!blueprint) {
    throw new Error('Không tìm thấy blueprint đề thi thử.')
  }

  const questionBank = await loadPracticeQuestionBank(input.subjectId)
  const selectedQuestions = buildBlueprintQuestions({
    blueprint,
    preferredSchoolName: input.preferredSchoolName,
    questionBank,
  })

  const dominantLevel = resolveDominantLevel(blueprint)
  const sessionId = crypto.randomUUID()
  const preferredSchoolLabel = input.preferredSchoolName?.trim() || 'tổng hợp nhieu truong'

  return {
    sessionId,
    title: `${blueprint.name} | ${preferredSchoolLabel}`,
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    topicId: 'practice-mock',
    topicName: 'Thi thử tổng hợp',
    difficultyLevel: dominantLevel,
    difficultyLabel: 'Phan bo 4 muc theo blueprint',
    durationMinutes: blueprint.durationMinutes,
    questions: selectedQuestions,
    deliveryMode: 'local_mock',
    blueprintId: blueprint.blueprintId,
    createdAt: Date.now(),
  }
}

async function loadPracticeQuestionBank(subjectId: string): Promise<PracticeQuestion[]> {
  if (questionBankCache) {
    return filterQuestionBankBySubject(questionBankCache, subjectId)
  }

  const subjectCode = SUBJECT_ID_TO_CODE[subjectId] ?? subjectId
  const remoteBank = await fetchSchoolExamQuestionBank(subjectCode)
  if (remoteBank.length > 0) {
    questionBankCache = remoteBank.map((question) => mapSchoolExamQuestionToPracticeQuestion(question, subjectId))
    return filterQuestionBankBySubject(questionBankCache, subjectId)
  }

  questionBankCache = await loadMockQuestionBank()
  return filterQuestionBankBySubject(questionBankCache, subjectId)
}

async function loadMockQuestionBank() {
  return (await import('../data/mock-question-bank')).mockQuestionBank
}

function filterQuestionBankBySubject(questionBank: PracticeQuestion[], subjectId: string) {
  return questionBank.filter((question) => question.subjectId === subjectId)
}

function buildBlueprintQuestions(input: {
  blueprint: PracticeBlueprint
  preferredSchoolName?: string
  questionBank: PracticeQuestion[]
}) {
  const selectionContext: SelectionContext = {
    preferredSchoolName: input.preferredSchoolName,
    usedQuestionIds: new Set<string>(),
    perExamCount: new Map<string, number>(),
    perTopicCount: new Map<string, number>(),
  }

  const assembledBySection = input.blueprint.sections.map((section) => {
    const sectionQuestions: PracticeQuestion[] = []

    for (const levelKey of [1, 2, 3, 4] as const) {
      const neededCount = section.levelCounts[levelKey]
      if (neededCount <= 0) {
        continue
      }

      const picked = pickQuestionsForLevel({
        questionBank: input.questionBank,
        questionType: section.questionType,
        preferredLevel: levelKey,
        neededCount,
        selectionContext,
      })

      if (picked.length < neededCount) {
        throw new Error(
          `Kho câu hỏi hien chi co ${picked.length}/${neededCount} câu ${section.questionType} cho muc ${levelKey}.`,
        )
      }

      sectionQuestions.push(...picked)
    }

    return shuffle(sectionQuestions)
  })

  return assembledBySection.flat()
}

function pickQuestionsForLevel(input: {
  questionBank: PracticeQuestion[]
  questionType: PracticeQuestion['questionType']
  preferredLevel: 1 | 2 | 3 | 4
  neededCount: number
  selectionContext: SelectionContext
}) {
  const picked: PracticeQuestion[] = []
  const levelPriority = buildLevelPriority(input.preferredLevel)

  for (const level of levelPriority) {
    const remaining = input.neededCount - picked.length
    if (remaining <= 0) {
      break
    }

    const candidates = buildQuestionPool({
      questionBank: input.questionBank,
      questionType: input.questionType,
      level,
      selectionContext: input.selectionContext,
    })

    const relaxedByTopic = takeCandidates(candidates, remaining, input.selectionContext, {
      respectExamCap: true,
      respectTopicCap: true,
    })
    picked.push(...relaxedByTopic)

    if (picked.length >= input.neededCount) {
      break
    }

    const stillNeeded = input.neededCount - picked.length
    const relaxedByExam = takeCandidates(candidates, stillNeeded, input.selectionContext, {
      respectExamCap: false,
      respectTopicCap: true,
    })
    picked.push(...relaxedByExam)

    if (picked.length >= input.neededCount) {
      break
    }

    const finalNeeded = input.neededCount - picked.length
    const fullyRelaxed = takeCandidates(candidates, finalNeeded, input.selectionContext, {
      respectExamCap: false,
      respectTopicCap: false,
    })
    picked.push(...fullyRelaxed)
  }

  return picked
}

function buildQuestionPool(input: {
  questionBank: PracticeQuestion[]
  questionType: PracticeQuestion['questionType']
  level: 1 | 2 | 3 | 4
  selectionContext: SelectionContext
}) {
  const preferredSchoolName = normalize(input.selectionContext.preferredSchoolName ?? '')
  const basePool = input.questionBank.filter(
    (question) =>
      question.questionType === input.questionType &&
      question.level === input.level &&
      !input.selectionContext.usedQuestionIds.has(question.questionId),
  )

  const prioritized = basePool.filter(
    (question) => preferredSchoolName && normalize(question.schoolName) === preferredSchoolName,
  )
  const fallback = basePool.filter(
    (question) => !preferredSchoolName || normalize(question.schoolName) !== preferredSchoolName,
  )

  return [...shuffle(prioritized), ...shuffle(fallback)]
}

function takeCandidates(
  candidates: PracticeQuestion[],
  neededCount: number,
  selectionContext: SelectionContext,
  options: {
    respectExamCap: boolean
    respectTopicCap: boolean
  },
) {
  const selected: PracticeQuestion[] = []

  for (const candidate of candidates) {
    if (selected.length >= neededCount) {
      break
    }

    if (selectionContext.usedQuestionIds.has(candidate.questionId)) {
      continue
    }

    const sourceExamCount = selectionContext.perExamCount.get(candidate.sourceExamId) ?? 0
    if (options.respectExamCap && sourceExamCount >= SOFT_MAX_QUESTIONS_PER_SOURCE_EXAM) {
      continue
    }

    const topicKey = normalize(candidate.topicId || candidate.content.slice(0, 80))
    const topicCount = selectionContext.perTopicCount.get(topicKey) ?? 0
    if (options.respectTopicCap && topicCount >= SOFT_MAX_QUESTIONS_PER_TOPIC) {
      continue
    }

    selectionContext.usedQuestionIds.add(candidate.questionId)
    selectionContext.perExamCount.set(candidate.sourceExamId, sourceExamCount + 1)
    selectionContext.perTopicCount.set(topicKey, topicCount + 1)
    selected.push(candidate)
  }

  return selected
}

function mapSchoolExamQuestionToPracticeQuestion(
  question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number],
  subjectId: string,
): PracticeQuestion {
  return {
    questionId: question.questionId,
    topicId: buildTopicId(question),
    subjectId,
    subjectName: 'Toán học',
    level: question.difficultyLevel,
    questionType: question.questionType,
    explanation: null,
    obsidianSourcePath: question.obsidianSourcePath,
    answers: question.options.map((option) => ({
      answerId: `${question.questionId}-opt-${option.optionLabel.toLowerCase()}`,
      optionLabel: option.optionLabel,
      content: normalizeSchoolExamMarkdown(option.optionText),
      isCorrect: question.questionType === 'multiple_choice'
        ? option.optionLabel === resolveCorrectOptionLabel(question)
        : false,
      explanation: null,
      displayOrder: option.displayOrder,
    })),
    statements:
      question.questionType === 'true_false'
        ? question.statements.map((statement, index) => ({
            statementId: `${question.questionId}-stmt-${statement.label || index + 1}`,
            content: normalizeSchoolExamMarkdown(statement.text),
            isCorrect: resolveTrueFalseAnswer(question, index),
          }))
        : undefined,
    acceptedResponses:
      question.questionType === 'short_answer'
        ? splitAcceptedResponses(resolveShortAnswerValue(question))
        : undefined,
    content: normalizeSchoolExamMarkdown(question.questionText),
    assetUrls: buildAssetUrls(question),
    sourceMeta: {
      examId: question.examId,
      schoolName: question.schoolName,
      examTitle: question.examTitle,
      year: question.year,
      sourceQuestionNumber: question.sourceQuestionNumber,
      sourceSectionNumber: question.sourceSectionNumber,
    },
    sourceExamId: question.examId,
    schoolName: question.schoolName ?? '',
    year: question.year ?? 0,
    tags: question.tags ?? [],
  }
}

function resolveCorrectOptionLabel(question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number]) {
  return question.answerValue?.toUpperCase() ?? ''
}

function resolveTrueFalseAnswer(
  question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number],
  index: number,
) {
  const value = question.answerValue?.replace(/\s+/g, '').toUpperCase() ?? ''
  return value[index] === 'D'
}

function resolveShortAnswerValue(question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number]) {
  return question.answerValue ?? ''
}

function splitAcceptedResponses(input: string) {
  return input
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildAssetUrls(question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number]) {
  if (!question.pdfUrl) {
    return []
  }

  const examSlug = question.pdfUrl.split('/').pop()?.replace(/\.pdf$/i, '') ?? ''
  const renderableAssets = question.assets && question.assets.length > 0
    ? question.assets
      .filter((asset) => asset.assetType === 'figure')
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((asset) => asset.assetPath)
    : (question.assetPaths ?? []).filter((assetPath) => /_hinh\d+\./i.test(assetPath))

  return renderableAssets.map((assetPath) => `/school-exam-assets/${examSlug}/${assetPath}`)
}

function buildTopicId(question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number]) {
  const sourcePath = question.obsidianSourcePath?.trim()
  if (sourcePath) {
    return sourcePath.replace(/[^\w/-]+/g, '-')
  }

  const normalizedTopic = normalize(question.topic)
  if (normalizedTopic) {
    return `school-exam/${normalizedTopic.replace(/\s+/g, '-')}`
  }

  return `school-exam/${question.questionType}`
}

function buildLevelPriority(level: 1 | 2 | 3 | 4) {
  const sequences: Record<1 | 2 | 3 | 4, Array<1 | 2 | 3 | 4>> = {
    1: [1, 2, 3, 4],
    2: [2, 1, 3, 4],
    3: [3, 4, 2, 1],
    4: [4, 3, 2, 1],
  }
  return sequences[level]
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

function resolveDominantLevel(blueprint: PracticeBlueprint): 1 | 2 | 3 | 4 {
  const levelTotals: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
  blueprint.sections.forEach((section) => {
    ;([1, 2, 3, 4] as const).forEach((level) => {
      levelTotals[level] += section.levelCounts[level]
    })
  })

  return ([1, 2, 3, 4] as const).reduce((bestLevel, currentLevel) =>
    levelTotals[currentLevel] > levelTotals[bestLevel] ? currentLevel : bestLevel,
  )
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}
