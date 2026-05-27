import sys

file_path = 'c:/Users/ADMIIN/VScode/final-project/web-app/src/pages/practice/SchoolExamPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f: current = f.read()

current = current.replace('const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false)  const startedAtRef = useRef(Date.now())', 'const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false)\n  const startedAtRef = useRef(Date.now())')
current = current.replace('</div>Mở lại PDF', 'Mở lại PDF')

timer_block = '''          <section className="sticky top-6 rounded-[28px] bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">Thời gian</h2>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 font-mono text-2xl font-bold text-rose-600">
              ⏱️ {formatDuration(remainingSeconds)}
            </div>
          </section>'''
current = current.replace(timer_block, '')

with open(file_path, 'w', encoding='utf-8') as f: f.write(current)
print('Fixed!')
