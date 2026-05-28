import { useEffect, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
  subjectOptions,
  type AdminImportStatement,
  type AdminQuestionType,
  type SubjectCode,
  type AdminImportAsset,
} from '../../features/admin-import/services/admin-import-service'
import {
  createEmptyReviewMetadata,
  getReviewQuestionValidationIssues,
  saveReviewQuestions,
  type ReviewImportMetadata,
  type ReviewQuestionDraft,
} from '../../features/admin-import/services/import-review-service'
import { fetchTopicsBySubjectId } from '../../features/dashboard/services/dashboard-service'

export function ImportReviewQuestionsPage() {
  const user = useAuthSessionStore((state) => state.user)
  const [metadata, setMetadata] = useState<ReviewImportMetadata>(createEmptyReviewMetadata())
  const [questions, setQuestions] = useState<ReviewQuestionDraft[]>([])
  const [newQuestionType, setNewQuestionType] = useState<AdminQuestionType>('multiple_choice')
  const [isSaving, setIsSaving] = useState(false)

  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true
    if (!metadata.subjectCode) {
      setTopicSuggestions([])
      return
    }

    void fetchTopicsBySubjectId(metadata.subjectCode)
      .then((rows) => {
        if (isMounted) {
          setTopicSuggestions(rows.map(t => t.topicName))
        }
      })
      .catch(() => {
        if (isMounted) {
          setTopicSuggestions([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [metadata.subjectCode])

  function updateMetadataField<Key extends keyof ReviewImportMetadata>(
    key: Key,
    value: ReviewImportMetadata[Key],
  ) {
    setMetadata((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updateSubject(subjectCode: SubjectCode) {
    const subject = subjectOptions.find((item) => item.code === subjectCode)
    setMetadata((current) => ({
      ...current,
      subjectCode,
      subjectName: subject?.name ?? current.subjectName,
      topicName: '', // Reset topic when subject changes
    }))
  }

  function handleAddQuestion() {
    if (!metadata.topicName.trim()) {
      toast.error('Hãy chọn chuyên đề trước khi thêm câu hỏi.')
      return
    }

    const newQuestionNumber = questions.length + 1

    let newQuestion: ReviewQuestionDraft = {
      questionNumber: newQuestionNumber,
      questionType: newQuestionType,
      questionText: '',
      obsidianSourcePath: '',
      options: [],
      statements: [],
      correctAnswer: '',
      assets: [],
    }

    if (newQuestionType === 'multiple_choice') {
      newQuestion.options = [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ]
    } else if (newQuestionType === 'true_false') {
      newQuestion.statements = [
        { label: 'a', text: '' },
        { label: 'b', text: '' },
        { label: 'c', text: '' },
        { label: 'd', text: '' },
      ]
    }

    setQuestions([...questions, newQuestion])
  }

  function handleDeleteQuestion(index: number) {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    // Re-assign numbers
    newQuestions.forEach((q, i) => {
      q.questionNumber = i + 1
    })
    setQuestions(newQuestions)
  }

  function updateQuestionField(index: number, patch: Partial<ReviewQuestionDraft>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              ...patch,
            }
          : question,
      ),
    )
  }

  function updateOption(index: number, label: 'A' | 'B' | 'C' | 'D', text: string) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              options: question.options.map((option) =>
                option.label === label ? { ...option, text } : option,
              ),
            }
          : question,
      ),
    )
  }

  function updateStatement(index: number, label: AdminImportStatement['label'], text: string) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              statements: question.statements.map((statement) =>
                statement.label === label ? { ...statement, text } : statement,
              ),
            }
          : question,
      ),
    )
  }

  async function addQuestionAsset(index: number, file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ file ảnh PNG/JPG/WebP.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setQuestions((current) =>
        current.map((question, questionIndex) => {
          if (questionIndex !== index) {
            return question
          }

          const nextAssetIndex = question.assets.length + 1
          const normalizedName = file.name
            .toLowerCase()
            .replace(/[^a-z0-9.]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
          const extension = normalizedName.split('.').pop() || 'png'
          const asset: AdminImportAsset = {
            assetType: 'figure',
            assetPath: `assets/q${String(question.questionNumber).padStart(2, '0')}-manual-${nextAssetIndex}.${extension}`,
            pageNumber: null,
            assetDataUrl: dataUrl,
          }

          return {
            ...question,
            assets: [...question.assets, asset],
          }
        }),
      )
      toast.success(`Đã thêm ảnh vào câu ${questions[index]?.questionNumber ?? index + 1}.`)
    } catch {
      toast.error('Không đọc được file ảnh vừa chọn.')
    }
  }

  function removeQuestionAsset(index: number, assetIndex: number) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              assets: question.assets.filter((_, currentAssetIndex) => currentAssetIndex !== assetIndex),
            }
          : question,
      ),
    )
  }

  async function handleSave() {
    if (questions.length === 0) {
      toast.error('Hãy thêm ít nhất một câu hỏi trước khi lưu.')
      return
    }

    if (!metadata.topicName.trim()) {
      toast.error('Hãy chọn chuyên đề.')
      return
    }

    // Validate all
    for (const question of questions) {
      const issues = getReviewQuestionValidationIssues({
        ...question,
        topic: metadata.topicName,
        isValid: true,
        warnings: [],
        changes: [],
      })
      if (issues.length > 0) {
        toast.error(`Câu ${question.questionNumber} chưa hợp lệ: ${issues[0]}`)
        return
      }
    }

    try {
      setIsSaving(true)
      const result = await saveReviewQuestions({
        metadata,
        questions,
      })
      toast.success(`Đã lưu ${result.questionCount} câu vào thư viện (ID: ${result.examId}).`)
      // Reset after success
      setQuestions([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu vào Supabase.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_52%,#111827_100%)] px-6 py-7 text-white md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100/90">
            <BookPlusIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
            Nhập câu ôn tập kiến thức
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="max-w-[14ch] text-3xl font-extrabold tracking-[-0.04em] text-white md:text-4xl">
                Tạo ngân hàng câu hỏi theo chuyên đề
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Thêm câu hỏi trực tiếp không cần tải PDF. Các câu hỏi này sẽ nằm trong hệ thống kiến thức ôn tập (Knowledge Review) mà không ảnh hưởng tới đề thi trường hiện có.
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <StatusPill label="Người thao tác" value={user?.fullName || user?.email || 'Teacher'} />
              <StatusPill label="Role" value={user?.role || 'teacher'} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Cấu hình chung</div>
              
              <SubjectField value={metadata.subjectCode} onChange={updateSubject} />
              
              <label className="block">
                <div className="mb-2 text-sm font-semibold text-slate-900">Chuyên đề (Topic)</div>
                <input
                  list="topic-suggestions-list"
                  className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300"
                  onChange={(event) => updateMetadataField('topicName', event.target.value)}
                  placeholder="Chọn hoặc nhập tên chuyên đề..."
                  value={metadata.topicName}
                />
                <datalist id="topic-suggestions-list">
                  {topicSuggestions.map((topic) => (
                    <option key={topic} value={topic} />
                  ))}
                </datalist>
              </label>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Thêm câu hỏi mới</div>
              
              <label className="block">
                <div className="mb-2 text-sm font-semibold text-slate-900">Dạng câu hỏi sắp thêm</div>
                <select
                  className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300"
                  onChange={(event) => setNewQuestionType(event.target.value as AdminQuestionType)}
                  value={newQuestionType}
                >
                  <option value="multiple_choice">Trắc nghiệm</option>
                  <option value="true_false">Đúng / Sai</option>
                  <option value="short_answer">Trả lời ngắn</option>
                </select>
              </label>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 active:translate-y-px"
                onClick={handleAddQuestion}
                type="button"
                disabled={!metadata.topicName}
              >
                <Plus className="h-4 w-4" strokeWidth={1.8} />
                Thêm câu hỏi
              </button>
            </div>

            <div className="pt-4">
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 active:translate-y-px"
                disabled={isSaving || questions.length === 0}
                onClick={() => void handleSave()}
                type="button"
              >
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={1.8} />
                )}
                Lưu vào CSDL ({questions.length} câu)
              </button>
            </div>
          </aside>

          <section className="space-y-6 lg:border-l lg:border-slate-200 lg:pl-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-950">Danh sách câu hỏi đang nhập</h2>
              <Badge tone="neutral">{questions.length} câu</Badge>
            </div>

            {questions.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                  <Plus className="h-5 w-5 text-slate-400" strokeWidth={1.8} />
                </div>
                <div className="mt-4 text-sm font-semibold text-slate-900">Chưa có câu hỏi nào</div>
                <div className="mt-1 text-sm text-slate-500">Hãy chọn dạng câu hỏi và bấm thêm bên trái.</div>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((question, index) => {
                  const clientIssues = getReviewQuestionValidationIssues({
                    ...question,
                    topic: metadata.topicName,
                    isValid: true,
                    warnings: [],
                    changes: [],
                  })
                  const isQuestionReady = clientIssues.length === 0

                  return (
                    <article
                      className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] relative"
                      key={`${question.questionNumber}-${index}`}
                    >
                      <button
                        className="absolute right-4 top-4 rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                        onClick={() => handleDeleteQuestion(index)}
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                      </button>

                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 pr-12 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Câu {question.questionNumber}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone={isQuestionReady ? 'success' : 'danger'}>
                              {isQuestionReady ? 'Hợp lệ' : 'Cần sửa'}
                            </Badge>
                            <Badge tone="neutral">{formatQuestionType(question.questionType)}</Badge>
                            {question.assets.length > 0 ? <Badge tone="neutral">Có hình</Badge> : null}
                          </div>
                        </div>

                        <div className="w-full sm:w-48">
                          <AnswerField
                            onChange={(value) =>
                              updateQuestionField(index, {
                                correctAnswer: value.toUpperCase(),
                              })
                            }
                            question={question as any}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-4">
                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-slate-900">Đề bài</div>
                            <textarea
                              autoCapitalize="off"
                              autoCorrect="off"
                              className="min-h-[150px] w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300"
                              onChange={(event) =>
                                updateQuestionField(index, {
                                  questionText: event.target.value,
                                })
                              }
                              spellCheck={false}
                              value={question.questionText}
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-semibold text-slate-900">Đường dẫn file kiến thức (Obsidian)</div>
                            <input
                              className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
                              onChange={(event) =>
                                updateQuestionField(index, {
                                  obsidianSourcePath: event.target.value,
                                })
                              }
                              placeholder="Ví dụ: Vat Ly/Chuong 1/Dao dong co.md"
                              value={question.obsidianSourcePath || ''}
                              autoComplete="off"
                            />
                          </label>

                          {question.questionType === 'multiple_choice' ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              {question.options.map((option) => (
                                <label
                                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                                  key={option.label}
                                >
                                  <div className="mb-2 text-sm font-semibold text-slate-900">
                                    Đáp án {option.label}
                                  </div>
                                  <textarea
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    className="min-h-[110px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                                    onChange={(event) => updateOption(index, option.label, event.target.value)}
                                    spellCheck={false}
                                    value={option.text}
                                  />
                                </label>
                              ))}
                            </div>
                          ) : null}

                          {question.questionType === 'true_false' ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              {question.statements.map((statement) => (
                                <label
                                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                                  key={statement.label}
                                >
                                  <div className="mb-2 text-sm font-semibold text-slate-900">
                                    Mệnh đề {statement.label}
                                  </div>
                                  <textarea
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    className="min-h-[110px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                                    onChange={(event) =>
                                      updateStatement(index, statement.label, event.target.value)
                                    }
                                    spellCheck={false}
                                    value={statement.text}
                                  />
                                </label>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-4">
                          {clientIssues.length > 0 ? (
                            <WarningBlock items={clientIssues} title="Lỗi cần sửa" tone="danger" />
                          ) : (
                            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                              Câu này đã đủ thông tin để lưu.
                            </div>
                          )}

                          <QuestionAssetEditor
                            assets={question.assets}
                            onAddAsset={(file) => addQuestionAsset(index, file)}
                            onRemoveAsset={(assetIndex) => removeQuestionAsset(index, assetIndex)}
                            questionNumber={question.questionNumber}
                            questionSectionLabel={formatQuestionType(question.questionType)}
                          />
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

function SubjectField({
  value,
  onChange,
}: {
  value: SubjectCode
  onChange: (value: SubjectCode) => void
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-900">Môn học</div>
      <select
        className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300"
        onChange={(event) => onChange(event.target.value as SubjectCode)}
        value={value}
      >
        {subjectOptions.map((subject) => (
          <option key={subject.code} value={subject.code}>
            {subject.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function AnswerField({
  question,
  onChange,
}: {
  question: { questionType: AdminQuestionType; correctAnswer: string }
  onChange: (value: string) => void
}) {
  if (question.questionType === 'multiple_choice') {
    return (
      <label className="block">
        <div className="mb-2 text-sm font-semibold text-slate-900">Đáp án đúng</div>
        <select
          className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300"
          onChange={(event) => onChange(event.target.value)}
          value={question.correctAnswer}
        >
          <option value="">Chọn</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </label>
    )
  }

  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-900">
        {question.questionType === 'true_false' ? 'Đáp án Đ/S' : 'Đáp án ngắn'}
      </div>
      <input
        className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.questionType === 'true_false' ? 'DDSS' : '15.5'}
        value={question.correctAnswer}
        autoComplete="off"
      />
    </label>
  )
}

function QuestionAssetEditor({
  assets,
  questionNumber,
  questionSectionLabel,
  onAddAsset,
  onRemoveAsset,
}: {
  assets: AdminImportAsset[]
  questionNumber: number
  questionSectionLabel: string
  onAddAsset: (file: File) => void
  onRemoveAsset: (assetIndex: number) => void
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ImageIcon className="h-4 w-4" strokeWidth={1.8} />
            Ảnh của câu hỏi
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Nếu câu có hình, tải lên tại đây.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white">
          <Upload className="h-4 w-4" strokeWidth={1.8} />
          Thêm ảnh
          <input
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                onAddAsset(file)
              }
              event.target.value = ''
            }}
            type="file"
          />
        </label>
      </div>

      {assets.length > 0 ? (
        <div className="mt-4 space-y-3">
          {assets.map((asset, assetIndex) => (
            <div
              className="rounded-[20px] border border-slate-200 bg-slate-50 p-3"
              key={`${asset.assetPath}-${assetIndex}`}
            >
              {asset.assetDataUrl || asset.publicUrl ? (
                <img
                  alt={`${questionSectionLabel} câu ${questionNumber} asset ${assetIndex + 1}`}
                  className="max-h-80 w-full rounded-[16px] object-contain"
                  src={asset.assetDataUrl || asset.publicUrl}
                />
              ) : (
                <div className="text-sm text-slate-500">Chưa có ảnh preview.</div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {asset.assetType} - tải lên thủ công
                </div>
                <button
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  onClick={() => onRemoveAsset(assetIndex)}
                  type="button"
                >
                  Xóa ảnh
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
          Chưa có ảnh nào cho câu này.
        </div>
      )}
    </div>
  )
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'success' | 'warning' | 'danger' | 'neutral'
}) {
  const className =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-slate-200 bg-slate-50 text-slate-600'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {children}
    </span>
  )
}

function WarningBlock({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'warning' | 'danger'
}) {
  const className =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`rounded-[24px] border px-4 py-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  )
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function formatQuestionType(questionType: AdminQuestionType) {
  if (questionType === 'multiple_choice') return 'Trắc nghiệm'
  if (questionType === 'true_false') return 'Đúng/Sai'
  return 'Trả lời ngắn'
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Invalid file reader result.'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Cannot read file.'))
    reader.readAsDataURL(file)
  })
}

// Simple BookPlusIcon for header
function BookPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M9 10h6" />
      <path d="M12 7v6" />
    </svg>
  )
}
