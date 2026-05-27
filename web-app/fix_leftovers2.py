import sys
import re

file_path = 'c:/Users/ADMIIN/VScode/final-project/web-app/src/pages/practice/SchoolExamPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f: current = f.read()

current = current.replace('setChatInputsByQuestion({})', "setSelectedReviewQuestionNumber(null)\n        setSelectedReviewChatInput('')")

start_str = 'async function handleSendReviewChat('
end_str = '  }'
start = current.find(start_str)
end = current.find('  }', current.find('catch (error: unknown)', start)) + 3

old_func = '''  async function handleSendReviewChat(item: ReviewItem) {
    const trimmed = selectedReviewChatInput.trim()
    if (!trimmed) {
      return
    }

    setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: true }))
    setAiErrorByQuestion((state) => ({ ...state, [item.questionNumber]: '' }))
    setAiChatHistoryByQuestion((state) => ({
      ...state,
      [item.questionNumber]: [
        ...(state[item.questionNumber] ?? []),
        { role: 'user', content: trimmed },
      ],
    }))
    setSelectedReviewChatInput('')

    try {
      const priorMessages = aiChatHistoryByQuestion[item.questionNumber] ?? []
      const messagesToSave = [...priorMessages, { role: 'user' as const, content: trimmed }]

      const reply = await sendExamChatMessage({
        examId,
        questionId: String(item.questionNumber),
        messages: buildPersistableAiMessages({ [item.questionNumber]: messagesToSave }),
        questionContent: item.questionContent,
        selectedAnswer: item.selectedAnswer,
        correctAnswer: item.correctAnswer,
        obsidianSourcePath: item.obsidianSourcePath,
        topic: item.topic,
      })

      setAiChatHistoryByQuestion((state) => ({
        ...state,
        [item.questionNumber]: [
          ...(state[item.questionNumber] ?? []),
          { role: 'ai', content: reply },
        ],
      }))

      if (schoolAttemptId) {
        void saveSchoolExamAiMessages(
          schoolAttemptId,
          buildPersistableAiMessages({
            [item.questionNumber]: [...messagesToSave, { role: 'assistant', content: reply }],
          }),
        )
      }
    } catch (error: unknown) {
      setAiErrorByQuestion((state) => ({
        ...state,
        [item.questionNumber]: error instanceof Error ? error.message : 'Lỗi từ AI.',
      }))
    } finally {
      setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: false }))
    }
  }'''

current = current[:start] + old_func + current[end:]

# Wait, we also need to remove chatInputsByQuestion state since it's no longer used!
current = re.sub(r'\s*const \[chatInputsByQuestion, setChatInputsByQuestion\] = useState<Record<number, string>>\(\{\}\)\n', '\n', current)

with open(file_path, 'w', encoding='utf-8') as f: f.write(current)
print('Fixed!')
