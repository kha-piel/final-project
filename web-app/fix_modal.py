import sys
import re

file_path = 'c:/Users/ADMIIN/VScode/final-project/web-app/src/pages/practice/SchoolExamPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f: current = f.read()

# First let's remove the badly placed confirm modal (if it exists)
modal_regex = re.compile(r'      \{isConfirmSubmitOpen && \(\n        <div className=\"fixed inset-0.*?Nộp bài ngay\n              </button>\n            </div>\n          </div>\n        </div>\n      \)\}\n    </>\n  \)\n\}', re.DOTALL)
current = re.sub(modal_regex, '    </>\n  )\n}', current)

# Also remove the `}` that I appended at the very end
if current.endswith('\n}\n'):
    current = current[:-3]

# Now inject it at the correct place, right before `function buildPersistableAiMessages`
modal_code = '''
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-slate-900">Xác nhận nộp bài</h3>
            <p className="mb-8 text-slate-600">
              Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi đáp án được nữa.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                onClick={() => setIsConfirmSubmitOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                onClick={() => {
                  setIsConfirmSubmitOpen(false)
                  void handleSubmitSchoolExam()
                }}
                type="button"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
'''
current = current.replace('    </section>\n  )\n}\n\nfunction buildPersistableAiMessages', modal_code + '\nfunction buildPersistableAiMessages')

with open(file_path, 'w', encoding='utf-8') as f: f.write(current)
print('Fixed!')
