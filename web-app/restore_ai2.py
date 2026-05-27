import sys
import re

current_file = 'src/pages/practice/SchoolExamPage.tsx'

with open(current_file, 'r', encoding='utf-8') as f:
    current = f.read()

# 1. Restore imports
# I need to add requestWeaknessAnalysis to exam-ai-service
current = current.replace(
    "  requestAutoExplanation,\n  sendExamChatMessage,\n} from '../../features/exam/services/exam-ai-service'",
    "  requestAutoExplanation,\n  sendExamChatMessage,\n  requestWeaknessAnalysis,\n} from '../../features/exam/services/exam-ai-service'"
)
# Add RecommendedReviewLinks and inferKnowledgeReviewTopics
imports_to_add = '''import { RecommendedReviewLinks } from '../../features/review/components/RecommendedReviewLinks'
import {
  inferKnowledgeReviewTopics,
  type KnowledgeReviewTopic,
} from '../../features/review/knowledge-review-topics'
'''
current = current.replace(
    "import {\n  persistCompletedSchoolExamAttempt,",
    imports_to_add + "import {\n  persistCompletedSchoolExamAttempt,"
)

# 2. Restore state variables
state_to_add = '''  const [isAnalyzingWeaknesses, setIsAnalyzingWeaknesses] = useState(false)
  const [weaknessAnalysis, setWeaknessAnalysis] = useState('')
  const [recommendedTopics, setRecommendedTopics] = useState<KnowledgeReviewTopic[]>([])
  const [weaknessAnalysisError, setWeaknessAnalysisError] = useState('')
'''
current = current.replace(
    "  const [aiErrorByQuestion, setAiErrorByQuestion] = useState<Record<number, string>>({})",
    "  const [aiErrorByQuestion, setAiErrorByQuestion] = useState<Record<number, string>>({})\n" + state_to_add
)

# 3. Restore resets
reset_to_add = '''        setWeaknessAnalysis('')
        setRecommendedTopics([])
        setWeaknessAnalysisError('')
'''
current = current.replace(
    "        setAiErrorByQuestion({})\n\n        setSelectedReviewQuestionNumber",
    "        setAiErrorByQuestion({})\n" + reset_to_add + "        setSelectedReviewQuestionNumber"
)

# 4. Restore handleAnalyzeWeaknesses
handle_analyze = '''  async function handleAnalyzeWeaknesses() {
    if (wrongReviewItems.length === 0) {
      setWeaknessAnalysis('Bạn không có câu sai nào trong bài này.')
      setRecommendedTopics([])
      setWeaknessAnalysisError('')
      return
    }

    setIsAnalyzingWeaknesses(true)
    setWeaknessAnalysisError('')

    try {
      const result = await requestWeaknessAnalysis(
        wrongReviewItems.map((item) => ({
          questionId: String(item.questionNumber),
          questionContent: item.questionContent || item.displayQuestionLabel,
          topic: item.topic || exam?.subjectName || 'Chưa xác định chuyên đề',
          userAnswer: item.selectedAnswer,
          correctAnswer: item.correctAnswer,
        })),
      )
      setWeaknessAnalysis(result)
      setRecommendedTopics(
        inferKnowledgeReviewTopics(
          wrongReviewItems.flatMap((item) => [
            item.topic,
            item.obsidianSourcePath,
            item.questionContent,
            result,
          ]),
        ),
      )
    } catch (error) {
      setWeaknessAnalysisError(
        error instanceof Error ? error.message : 'Không thể lấy phân tích tổng quan lúc này.',
      )
    } finally {
      setIsAnalyzingWeaknesses(false)
    }
  }
'''
current = current.replace(
    "    )\n  }\n\n  if (isLoadingExam) {",
    "    )\n  }\n\n" + handle_analyze + "\n  if (isLoadingExam) {"
)

# 5. Restore UI
ui_to_add = '''            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">
                Ghi chú AI
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                AI có thể giải thích từng câu sai và phân tích tổng quan điểm yếu dựa trên nội dung câu hỏi,
                topic va obsidian source path da lưu trong database.
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
              <button
                className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isAnalyzingWeaknesses}
                onClick={() => void handleAnalyzeWeaknesses()}
                type="button"
              >
                {isAnalyzingWeaknesses ? 'AI đang phân tích...' : 'AI phân tích tổng quan điểm yếu'}
              </button>
              {weaknessAnalysis ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <MarkdownContent content={weaknessAnalysis} />
                  <RecommendedReviewLinks topics={recommendedTopics} />
                </div>
              ) : null}
              {weaknessAnalysisError ? (
                <p className="mt-4 text-sm font-medium text-rose-700">{weaknessAnalysisError}</p>
              ) : null}
            </div>

'''
current = current.replace(
    '              <SummaryTile label="Mã đề" value={selectedVariant?.variantCode ?? \'--\'} tone="sky" />\n            </div>\n\n            <div className="mt-6 flex flex-wrap gap-3">',
    '              <SummaryTile label="Mã đề" value={selectedVariant?.variantCode ?? \'--\'} tone="sky" />\n            </div>\n\n' + ui_to_add + '            <div className="mt-6 flex flex-wrap gap-3">'
)

with open(current_file, 'w', encoding='utf-8') as f:
    f.write(current)

print("Restored AI feature using simple replaces!")
