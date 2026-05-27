import sys
import re

file_path = 'c:/Users/ADMIIN/VScode/final-project/web-app/src/pages/practice/SchoolExamPage.tsx'
old_file = 'c:/Users/ADMIIN/VScode/final-project/web-app/temp_old_school.tsx'

with open(file_path, 'r', encoding='utf-8') as f: current = f.read()
with open(old_file, 'r', encoding='utf-16') as f: old = f.read()

# 1. Replace setChatInputsByQuestion({}) back
current = current.replace('setChatInputsByQuestion({})', "setSelectedReviewQuestionNumber(null)\n        setSelectedReviewChatInput('')")

# 2. Extract handleSendReviewChat from old
old_lines = old.split('\n')
start = -1
end = -1
for i, line in enumerate(old_lines):
    if 'async function handleSendReviewChat(item: ReviewItem) {' in line:
        start = i
    if start != -1 and '  }' in line and i > start + 30:
        if 'catch' in ''.join(old_lines[start:i]) and 'finally' in ''.join(old_lines[start:i]):
            if old_lines[i] == '  }':
                end = i
                break
                
old_func = '\\n'.join(old_lines[start:end+1])

# Extract handleSendReviewChat from current
cur_lines = current.split('\n')
c_start = -1
c_end = -1
for i, line in enumerate(cur_lines):
    if 'async function handleSendReviewChat' in line:
        c_start = i
    if c_start != -1 and '  }' in line and i > c_start + 30:
        if 'catch' in ''.join(cur_lines[c_start:i]) and 'finally' in ''.join(cur_lines[c_start:i]):
            if cur_lines[i] == '  }':
                c_end = i
                break

cur_func = '\\n'.join(cur_lines[c_start:c_end+1])

current = current.replace(cur_func, old_func)

with open(file_path, 'w', encoding='utf-8') as f: f.write(current)
print('Fixed successfully')
