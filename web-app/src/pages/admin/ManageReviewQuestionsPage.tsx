import { useEffect, useState, type ReactNode } from 'react'
import {
  Save,
  Trash2,
  Edit,
  LoaderCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
  subjectOptions,
  topicOptionsBySubjectCode,
  type AdminQuestionType,
  type SubjectCode,
  type AdminImportStatement
} from '../../features/admin-import/services/admin-import-service'
import {
  fetchReviewTopics,
  fetchReviewQuestionsByTopic,
  deleteReviewQuestion,
  updateReviewQuestion,
  type ManagedReviewQuestion
} from '../../features/admin-import/services/manage-review-service'

export function ManageReviewQuestionsPage() {
  const user = useAuthSessionStore((state) => state.user)
  const [subjectCode, setSubjectCode] = useState<SubjectCode>(subjectOptions[0].code)
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  
  const [questions, setQuestions] = useState<ManagedReviewQuestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<ManagedReviewQuestion | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    fetchReviewTopics(subjectCode)
      .then((data) => {
        if (isMounted) {
          const defaultTopics = topicOptionsBySubjectCode[subjectCode] || []
          const mergedTopics = Array.from(new Set([...defaultTopics, ...data]))
          setTopics(mergedTopics)
          setSelectedTopic(mergedTopics[0] || '')
        }
      })
      .catch((err) => {
        toast.error(err.message)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
      
    return () => { isMounted = false }
  }, [subjectCode])

  useEffect(() => {
    let isMounted = true
    if (!selectedTopic) {
      setQuestions([])
      return
    }
    
    setIsLoading(true)
    fetchReviewQuestionsByTopic({ subjectCode, subjectName: '', topicName: selectedTopic })
      .then((data) => {
        if (isMounted) {
          setQuestions(data)
        }
      })
      .catch((err) => {
        toast.error(err.message)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
      
    return () => { isMounted = false }
  }, [selectedTopic, subjectCode])

  function handleDelete(questionId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không? Thao tác này không thể hoàn tác.')) {
      return
    }
    
    setIsDeleting(questionId)
    deleteReviewQuestion(questionId)
      .then(() => {
        setQuestions(prev => prev.filter(q => q.questionId !== questionId))
        toast.success('Đã xóa câu hỏi thành công.')
      })
      .catch(err => {
        toast.error(err.message)
      })
      .finally(() => {
        setIsDeleting(null)
      })
  }

  function handleStartEdit(question: ManagedReviewQuestion) {
    setEditingQuestionId(question.questionId)
    // Deep clone the question so we can edit it freely
    setEditDraft(JSON.parse(JSON.stringify(question)))
  }

  function handleCancelEdit() {
    setEditingQuestionId(null)
    setEditDraft(null)
  }

  async function handleSaveEdit() {
    if (!editDraft) return
    
    try {
      setIsSaving(true)
      await updateReviewQuestion(editDraft)
      
      // Update local state
      setQuestions(prev => prev.map(q => q.questionId === editDraft.questionId ? editDraft : q))
      setEditingQuestionId(null)
      setEditDraft(null)
      toast.success('Đã cập nhật câu hỏi thành công.')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  function updateEditField(patch: Partial<ManagedReviewQuestion>) {
    if (!editDraft) return
    setEditDraft({ ...editDraft, ...patch })
  }

  function updateEditOption(label: 'A' | 'B' | 'C' | 'D', text: string) {
    if (!editDraft) return
    setEditDraft({
      ...editDraft,
      options: editDraft.options.map(o => o.label === label ? { ...o, text } : o)
    })
  }

  function updateEditStatement(label: AdminImportStatement['label'], text: string) {
    if (!editDraft) return
    setEditDraft({
      ...editDraft,
      statements: editDraft.statements.map(s => s.label === label ? { ...s, text } : s)
    })
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_52%,#111827_100%)] px-6 py-7 text-white md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100/90">
            <Edit className="h-3.5 w-3.5" strokeWidth={1.8} />
            Quản lý câu ôn tập kiến thức
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="max-w-[14ch] text-3xl font-extrabold tracking-[-0.04em] text-white md:text-4xl">
                Sửa/Xóa câu hỏi ôn tập
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Lựa chọn môn học và chuyên đề để xem danh sách câu hỏi hiện có. Bạn có thể chỉnh sửa nội dung hoặc xóa câu hỏi khỏi hệ thống.
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
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Bộ lọc</div>
              
              <label className="block">
                <div className="mb-2 text-sm font-semibold text-slate-900">Môn học</div>
                <select
                  className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300"
                  onChange={(event) => setSubjectCode(event.target.value as SubjectCode)}
                  value={subjectCode}
                >
                  {subjectOptions.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
              
              <label className="block">
                <div className="mb-2 text-sm font-semibold text-slate-900">Chuyên đề (Topic)</div>
                <select
                  className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300 disabled:bg-slate-50 disabled:text-slate-400"
                  onChange={(event) => setSelectedTopic(event.target.value)}
                  value={selectedTopic}
                  disabled={topics.length === 0}
                >
                  {topics.length === 0 ? (
                    <option value="">Chưa có dữ liệu</option>
                  ) : (
                    topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>
          </aside>

          <section className="space-y-6 lg:border-l lg:border-slate-200 lg:pl-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-950">
                {selectedTopic ? `Danh sách câu hỏi (${questions.length})` : 'Chọn chuyên đề để hiển thị'}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : questions.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mt-4 text-sm font-semibold text-slate-900">Không có câu hỏi nào</div>
                <div className="mt-1 text-sm text-slate-500">Chuyên đề này chưa có câu hỏi hoặc chưa được chọn.</div>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((question) => {
                  const isEditing = editingQuestionId === question.questionId
                  const draft = isEditing ? editDraft : question
                  if (!draft) return null

                  return (
                    <article
                      className={`rounded-[28px] border ${isEditing ? 'border-sky-300 bg-sky-50 shadow-md' : 'border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_16px_40px_rgba(15,23,42,0.04)]'} p-5 relative`}
                      key={question.questionId}
                    >
                      {!isEditing && (
                        <div className="absolute right-4 top-4 flex gap-2">
                          <button
                            className="rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-600 transition hover:bg-sky-100"
                            onClick={() => handleStartEdit(question)}
                            title="Sửa câu hỏi này"
                          >
                            <Edit className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                          <button
                            className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                            onClick={() => handleDelete(question.questionId)}
                            title="Xóa câu hỏi này"
                            disabled={isDeleting === question.questionId}
                          >
                            {isDeleting === question.questionId ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                            ) : (
                              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                            )}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 pr-24 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Câu {draft.questionNumber}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="neutral">{formatQuestionType(draft.questionType)}</Badge>
                            {draft.assets?.length > 0 ? <Badge tone="neutral">Có hình</Badge> : null}
                          </div>
                        </div>

                        {isEditing && (
                          <div className="w-full sm:w-48">
                            <AnswerField
                              onChange={(value) => updateEditField({ correctAnswer: value.toUpperCase() })}
                              question={draft as any}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-5">
                        <label className="block mb-4">
                          <div className="mb-2 text-sm font-semibold text-slate-900">Đề bài</div>
                          {isEditing ? (
                            <textarea
                              className="min-h-[150px] w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300"
                              onChange={(event) => updateEditField({ questionText: event.target.value })}
                              value={draft.questionText}
                            />
                          ) : (
                            <div className="rounded-[22px] border border-slate-100 bg-white px-4 py-4 text-sm leading-7 text-slate-800 whitespace-pre-wrap">
                              {draft.questionText}
                            </div>
                          )}
                        </label>

                        {isEditing && (
                          <label className="block mb-4">
                            <div className="mb-2 text-sm font-semibold text-slate-900">Đường dẫn Obsidian</div>
                            <input
                              className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
                              onChange={(event) => updateEditField({ obsidianSourcePath: event.target.value })}
                              value={draft.obsidianSourcePath || ''}
                            />
                          </label>
                        )}

                        {!isEditing && draft.obsidianSourcePath && (
                          <div className="mb-4 text-sm text-slate-500">
                            <strong>Obsidian:</strong> {draft.obsidianSourcePath}
                          </div>
                        )}

                        {!isEditing && (
                          <div className="mb-4 text-sm text-slate-500">
                            <strong>Đáp án đúng:</strong> <span className="font-bold text-emerald-600">{draft.correctAnswer}</span>
                          </div>
                        )}

                        {draft.questionType === 'multiple_choice' ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {draft.options?.map((option) => (
                              <label
                                className={`rounded-[24px] border ${!isEditing && draft.correctAnswer === option.label ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'} p-4`}
                                key={option.label}
                              >
                                <div className="mb-2 text-sm font-semibold text-slate-900">
                                  Đáp án {option.label}
                                </div>
                                {isEditing ? (
                                  <textarea
                                    className="min-h-[110px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                                    onChange={(event) => updateEditOption(option.label as any, event.target.value)}
                                    value={option.text}
                                  />
                                ) : (
                                  <div className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{option.text}</div>
                                )}
                              </label>
                            ))}
                          </div>
                        ) : null}

                        {draft.questionType === 'true_false' ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {draft.statements?.map((statement, idx) => {
                              const isTrue = !isEditing && draft.correctAnswer && draft.correctAnswer[idx] === 'D'
                              return (
                                <label
                                  className={`rounded-[24px] border ${!isEditing && isTrue ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'} p-4`}
                                  key={statement.label}
                                >
                                  <div className="mb-2 text-sm font-semibold text-slate-900">
                                    Mệnh đề {statement.label}
                                  </div>
                                  {isEditing ? (
                                    <textarea
                                      className="min-h-[110px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                                      onChange={(event) => updateEditStatement(statement.label as any, event.target.value)}
                                      value={statement.text}
                                    />
                                  ) : (
                                    <div className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{statement.text}</div>
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        ) : null}

                        {isEditing && (
                          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                            <button
                              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              onClick={handleCancelEdit}
                              type="button"
                              disabled={isSaving}
                            >
                              Hủy
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                              onClick={() => void handleSaveEdit()}
                              type="button"
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                              ) : (
                                <Save className="h-4 w-4" strokeWidth={1.8} />
                              )}
                              Lưu thay đổi
                            </button>
                          </div>
                        )}
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
