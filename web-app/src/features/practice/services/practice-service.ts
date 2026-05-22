import { mockExamCatalog } from '../data/mock-exam-catalog'
import { mockQuestionBank } from '../data/mock-question-bank'
import { practiceBlueprints } from '../data/practice-blueprints'
import type {
  PracticeBlueprint,
  PracticeExamCatalogItem,
  PracticeQuestion,
  PracticeSearchFilters,
} from '../types/practice-types'
import type { ExamDraftSession } from '../../exam/store/exam-draft-store'

export function searchPracticeExamCatalog(
  filters: PracticeSearchFilters,
): PracticeExamCatalogItem[] {
  const keyword = normalize(filters.keyword)

  return mockExamCatalog.filter((exam) => {
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

export function getPracticeQuestionBankOverview() {
  const typeCounts = mockQuestionBank.reduce<Record<string, number>>((acc, question) => {
    acc[question.questionType] = (acc[question.questionType] ?? 0) + 1
    return acc
  }, {})

  const levelCounts = mockQuestionBank.reduce<Record<number, number>>((acc, question) => {
    acc[question.level] = (acc[question.level] ?? 0) + 1
    return acc
  }, {})

  return {
    totalQuestions: mockQuestionBank.length,
    typeCounts,
    levelCounts,
    schools: Array.from(new Set(mockQuestionBank.map((question) => question.schoolName))).length,
  }
}

export function createPracticeExamSession(input: {
  blueprintId: string
  subjectId: string
  subjectName: string
  preferredSchoolName?: string
}): ExamDraftSession {
  const blueprint = practiceBlueprints.find((item) => item.blueprintId === input.blueprintId)
  if (!blueprint) {
    throw new Error('Khong tim thay blueprint de thi thu.')
  }

  const selectedQuestions = buildBlueprintQuestions({
    blueprint,
    subjectId: input.subjectId,
    preferredSchoolName: input.preferredSchoolName,
  })

  const dominantLevel = resolveDominantLevel(blueprint)
  const sessionId = crypto.randomUUID()
  const preferredSchoolLabel = input.preferredSchoolName?.trim() || 'tong hop nhieu truong'

  return {
    sessionId,
    title: `${blueprint.name} | ${preferredSchoolLabel}`,
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    topicId: 'practice-mock',
    topicName: 'Thi thu tong hop',
    difficultyLevel: dominantLevel,
    difficultyLabel: 'Phan bo 4 muc theo blueprint',
    durationMinutes: blueprint.durationMinutes,
    questions: selectedQuestions,
    deliveryMode: 'local_mock',
    blueprintId: blueprint.blueprintId,
    createdAt: Date.now(),
  }
}

function buildBlueprintQuestions(input: {
  blueprint: PracticeBlueprint
  subjectId: string
  preferredSchoolName?: string
}) {
  const usedQuestionIds = new Set<string>()
  const assembled: PracticeQuestion[] = []

  for (const section of input.blueprint.sections) {
    for (const levelKey of [1, 2, 3, 4] as const) {
      const neededCount = section.levelCounts[levelKey]
      if (neededCount <= 0) {
        continue
      }

      const questionPool = buildQuestionPool({
        questionType: section.questionType,
        level: levelKey,
        subjectId: input.subjectId,
        preferredSchoolName: input.preferredSchoolName,
        usedQuestionIds,
      })

      if (questionPool.length < neededCount) {
        throw new Error(
          `Kho cau hoi hien chi co ${questionPool.length} cau ${section.questionType} muc ${levelKey}, khong du cho blueprint.`,
        )
      }

      pickRandom(questionPool, neededCount).forEach((question) => {
        usedQuestionIds.add(question.questionId)
        assembled.push(question)
      })
    }
  }

  return assembled
}

function buildQuestionPool(input: {
  questionType: PracticeQuestion['questionType']
  level: 1 | 2 | 3 | 4
  subjectId: string
  preferredSchoolName?: string
  usedQuestionIds: Set<string>
}) {
  const prioritized = mockQuestionBank.filter(
    (question) =>
      question.subjectId === input.subjectId &&
      question.questionType === input.questionType &&
      question.level === input.level &&
      !input.usedQuestionIds.has(question.questionId) &&
      (!input.preferredSchoolName || question.schoolName === input.preferredSchoolName),
  )

  if (prioritized.length > 0) {
    return prioritized
  }

  return mockQuestionBank.filter(
    (question) =>
      question.subjectId === input.subjectId &&
      question.questionType === input.questionType &&
      question.level === input.level &&
      !input.usedQuestionIds.has(question.questionId),
  )
}

function pickRandom<T>(items: T[], count: number) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled.slice(0, count)
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
