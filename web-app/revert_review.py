import re

current_file = 'c:/Users/ADMIIN/VScode/final-project/web-app/src/pages/practice/SchoolExamPage.tsx'
old_file = 'c:/Users/ADMIIN/VScode/final-project/web-app/temp_old_school.tsx'

with open(current_file, 'r', encoding='utf-8') as f:
    current = f.read()

with open(old_file, 'r', encoding='utf-8') as f:
    old = f.read()

# 1. Re-add state variables
if 'const [selectedReviewQuestionNumber, setSelectedReviewQuestionNumber]' not in current:
    state_to_add = """  const [selectedReviewQuestionNumber, setSelectedReviewQuestionNumber] = useState<number | null>(null)
  const [selectedReviewChatInput, setSelectedReviewChatInput] = useState('')"""
    current = current.replace('const [chatInputsByQuestion, setChatInputsByQuestion] = useState<Record<number, string>>({})', state_to_add + '\n  const [chatInputsByQuestion, setChatInputsByQuestion] = useState<Record<number, string>>({})')

if 'const reviewItemsByPart = useMemo(' not in current:
    memo_to_add = """  const reviewItemsByPart = useMemo(
    () => ({
      multipleChoice: reviewItems.filter((item) => item.partCode === 'multiple_choice'),
      trueFalse: reviewItems.filter((item) => item.partCode === 'true_false'),
      shortAnswer: reviewItems.filter((item) => item.partCode === 'short_answer'),
    }),
    [reviewItems],
  )

  const selectedReviewItem = useMemo(() => {
    if (selectedReviewQuestionNumber === null) {
      return null
    }
    return reviewItems.find((item) => item.questionNumber === selectedReviewQuestionNumber) ?? null
  }, [reviewItems, selectedReviewQuestionNumber])"""
    # Insert after `const wrongReviewItems = useMemo(`
    wrong_items = r'const wrongReviewItems = useMemo\(\n.*?\[reviewItems\],\n  \)'
    current = re.sub(wrong_items, r'\g<0>\n\n' + memo_to_add, current, flags=re.DOTALL)

# 2. Extract ReviewItemSection from old
review_item_section = re.search(r'function ReviewItemSection.*?^}\n', old, re.MULTILINE | re.DOTALL).group(0)

# Add ReviewItemSection at the bottom, just before formatDuration
current = current.replace('function formatDuration', review_item_section + '\nfunction formatDuration')

# 3. Add SummaryTile back
summary_tile = re.search(r'function SummaryTile.*?^}\n', old, re.MULTILINE | re.DOTALL).group(0)
current = current.replace('function formatDuration', summary_tile + '\nfunction formatDuration')

# 4. Extract OLD review rendering
old_review_rendering = re.search(r'if \(submitted && summary\) \{\n.*?return \(\n\s*<section.*?^    \)\n  \}', old, re.MULTILINE | re.DOTALL).group(0)

# 5. Extract CURRENT review rendering
current_review_rendering_pattern = re.compile(r'if \(submitted && summary\) \{\n.*?return \(\n\s*<section.*?^    \)\n  \}', re.MULTILINE | re.DOTALL)
current = re.sub(current_review_rendering_pattern, old_review_rendering, current)

# 6. Restore handleSendReviewChat
old_handle_chat = re.search(r'async function handleSendReviewChat.*?^\s*\}', old, re.MULTILINE | re.DOTALL).group(0)
current_handle_chat = re.compile(r'async function handleSendReviewChat.*?^\s*\}', re.MULTILINE | re.DOTALL)
current = re.sub(current_handle_chat, old_handle_chat, current)

with open(current_file, 'w', encoding='utf-8') as f:
    f.write(current)
print("Reverted review changes successfully.")
