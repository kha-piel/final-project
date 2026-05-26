import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import {
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
  createEmptyMetadata,
  estimateExamId,
  getDraftValidationIssues,
  getQuestionValidationIssues,
  requestExamPdfValidation,
  saveAdminImportedExam,
  subjectOptions,
  type AdminImportMetadata,
  type AdminImportAsset,
  type AdminImportQuestion,
  type AdminImportStatement,
  type AdminImportValidationResponse,
  type SubjectCode,
} from '../../features/admin-import/services/admin-import-service'

export function ImportExamPage() {
  const user = useAuthSessionStore((state) => state.user)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [metadata, setMetadata] = useState<AdminImportMetadata>(createEmptyMetadata())
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [answerKeyText, setAnswerKeyText] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationStatus, setValidationStatus] = useState('')
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState<AdminImportValidationResponse | null>(null)

  const previewExamId = useMemo(() => {
    return result?.examDraft.examId || estimateExamId(metadata) || 'se-tu-sinh-sau-khi-nhap-du'
  }, [metadata, result])

  const draftIssues = useMemo(() => {
    return getDraftValidationIssues({
      draft: result,
      pdfFile,
    })
  }, [pdfFile, result])

  function updateMetadataField<Key extends keyof AdminImportMetadata>(
    key: Key,
    value: AdminImportMetadata[Key],
  ) {
    setMetadata((current) => ({
      ...current,
      [key]: value,
    }))
    setResult(null)
  }

  function updateSubject(subjectCode: SubjectCode) {
    const subject = subjectOptions.find((item) => item.code === subjectCode)
    setMetadata((current) => ({
      ...current,
      subjectCode,
      subjectName: subject?.name ?? current.subjectName,
      durationMinutes: subject?.durationMinutes ?? current.durationMinutes,
    }))
    setResult(null)
  }

  function handleSelectedFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Chi ho tro upload file PDF.')
      return
    }

    setPdfFile(file)
    setApiError('')
    setResult(null)
    toast.success(`Da chon PDF: ${file.name}`)
  }

  function handlePickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      handleSelectedFile(file)
    }
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleSelectedFile(file)
    }
  }

  async function handleValidate() {
    if (!pdfFile) {
      toast.error('Hay upload PDF truoc khi phan tich.')
      return
    }

    const requiredFields: Array<[string, string]> = [
      ['Ten truong', metadata.schoolName],
      ['Thanh pho', metadata.city],
      ['Nam thi', metadata.year],
      ['Ma de', metadata.variantCode],
    ]
    const missingField = requiredFields.find(([, value]) => !value.trim())
    if (missingField) {
      toast.error(`Thieu ${missingField[0]}.`)
      return
    }

    try {
      setIsValidating(true)
      setApiError('')
      setValidationStatus('Dang chuan bi upload PDF...')
      const payload = await requestExamPdfValidation({
        pdfFile,
        metadata,
        answerKeyText,
        onStatusChange: setValidationStatus,
      })
      setValidationStatus('')
      setResult(payload)

      if (payload.questions.length > 0) {
        toast.success(`AI da trich xuat ${payload.questions.length} cau hoi tu PDF.`)
      } else {
        toast.warning('AI chua trich xuat duoc cau hoi nao. Hay kiem tra PDF.')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the phan tich PDF luc nay.'
      setApiError(message)
      toast.error(message)
    } finally {
      setIsValidating(false)
      setValidationStatus('')
    }
  }

  async function handleSave() {
    if (!result || !pdfFile) {
      toast.error('Can phan tich PDF truoc khi luu.')
      return
    }

    if (draftIssues.length > 0) {
      toast.error(draftIssues[0] ?? 'Du lieu chua hop le de luu.')
      return
    }

    try {
      setIsSaving(true)
      const saved = await saveAdminImportedExam({
        pdfFile,
        draft: result,
      })
      toast.success(`Da luu ${saved.questionCount} cau vao exam ${saved.examId}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Khong the luu vao Supabase.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  function updateQuestionField(index: number, patch: Partial<AdminImportQuestion>) {
    setResult((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        questions: current.questions.map((question, questionIndex) =>
          questionIndex === index
            ? {
                ...question,
                ...patch,
              }
            : question,
        ),
      }
    })
  }

  function updateOption(index: number, label: 'A' | 'B' | 'C' | 'D', text: string) {
    setResult((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        questions: current.questions.map((question, questionIndex) =>
          questionIndex === index
            ? {
                ...question,
                options: question.options.map((option) =>
                  option.label === label ? { ...option, text } : option,
                ),
              }
            : question,
        ),
      }
    })
  }

  function updateStatement(index: number, label: AdminImportStatement['label'], text: string) {
    setResult((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        questions: current.questions.map((question, questionIndex) =>
          questionIndex === index
            ? {
                ...question,
                statements: question.statements.map((statement) =>
                  statement.label === label ? { ...statement, text } : statement,
                ),
              }
            : question,
        ),
      }
    })
  }

  async function addQuestionAsset(index: number, file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Chi ho tro file anh PNG/JPG/WebP cho asset cau hoi.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setResult((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          questions: current.questions.map((question, questionIndex) => {
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
        }
      })
      toast.success(`Da them anh vao cau ${result?.questions[index]?.questionNumber ?? index + 1}.`)
    } catch {
      toast.error('Khong doc duoc file anh vua chon.')
    }
  }

  function removeQuestionAsset(index: number, assetIndex: number) {
    setResult((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        questions: current.questions.map((question, questionIndex) =>
          questionIndex === index
            ? {
                ...question,
                assets: question.assets.filter((_, currentAssetIndex) => currentAssetIndex !== assetIndex),
              }
            : question,
        ),
      }
    })
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_52%,#111827_100%)] px-6 py-7 text-white md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-100/90">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
            Teacher PDF Import
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="max-w-[14ch] text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
                Nap de bang PDF, con lai de AI xu ly.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                Giao vien chi can upload PDF, chon mon, nhap truong/thanh pho/nam/ma de va paste dap an tho. He thong se trich xuat cau hoi, map dap an, tao preview va luu vao Supabase.
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <StatusPill label="Nguoi thao tac" value={user?.fullName || user?.email || 'Teacher'} />
              <StatusPill label="Role" value={user?.role || 'teacher'} />
              <StatusPill label="Exam ID" value={previewExamId} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-5">
            <SectionHeading
              title="Thong tin toi thieu"
              description="Exam ID se duoc sinh tu truong, mon, nam thi va ma de."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <SubjectField value={metadata.subjectCode} onChange={updateSubject} />
              <InputField
                label="Thoi luong"
                onChange={(value) => updateMetadataField('durationMinutes', value)}
                placeholder="50"
                type="number"
                value={metadata.durationMinutes}
              />
              <InputField
                label="Ten truong"
                onChange={(value) => updateMetadataField('schoolName', value)}
                placeholder="THPT Van Lang"
                value={metadata.schoolName}
              />
              <InputField
                label="Thanh pho"
                onChange={(value) => updateMetadataField('city', value)}
                placeholder="Ha Noi"
                value={metadata.city}
              />
              <InputField
                label="Nam thi"
                onChange={(value) => updateMetadataField('year', value)}
                placeholder="2026"
                type="number"
                value={metadata.year}
              />
              <InputField
                label="Ma de"
                onChange={(value) => updateMetadataField('variantCode', value)}
                placeholder="101"
                value={metadata.variantCode}
              />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Exam ID tu dong
              </div>
              <div className="mt-2 break-all text-sm font-semibold text-slate-900">{previewExamId}</div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_42px_rgba(15,23,42,0.04)]">
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Dap an giao vien nhap
              </label>
              <textarea
                autoCapitalize="off"
                autoCorrect="off"
                className="min-h-[190px] w-full resize-y rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
                onChange={(event) => {
                  setAnswerKeyText(event.target.value)
                  setResult(null)
                }}
                placeholder="Vi du: 1.A, 2.C, 3.D ... 12.B, 13.DDSS, 14.SDDS, 17: 68"
                spellCheck={false}
                value={answerKeyText}
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Ho tro dang 1.A, 1: A, 1 A, 13 DDSS, 17: 68. Neu thieu dap an, preview se canh bao de giao vien sua.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading
              title="Upload PDF de thi"
              description="Workflow chinh chi nhan PDF. Backend se gui PDF cho Gemini 2.5 Flash de doc va boc tach cau hoi."
            />

            <div
              className={[
                'rounded-[30px] border border-dashed px-6 py-8 transition',
                dragActive
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50/90',
              ].join(' ')}
              onDragEnter={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setDragActive(false)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                    <Upload className="h-6 w-6 text-slate-700" strokeWidth={1.9} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-900">
                      Keo tha PDF vao day
                    </div>
                    <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                      File PDF goc se duoc upload vao Supabase Storage khi bam luu CSDL.
                    </p>
                  </div>
                </div>

                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100 active:translate-y-px"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.8} />
                  Chon PDF
                </button>
              </div>

              <input
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handlePickFile}
                ref={fileInputRef}
                type="file"
              />

              {pdfFile ? (
                <div className="mt-6 flex items-center justify-between gap-4 rounded-[24px] border border-emerald-200 bg-white px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{pdfFile.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                    onClick={() => {
                      setPdfFile(null)
                      setResult(null)
                    }}
                    type="button"
                  >
                    <X className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 active:translate-y-px"
                disabled={isValidating}
                onClick={() => void handleValidate()}
                type="button"
              >
                {isValidating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                )}
                Phan tich PDF bang AI
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 active:translate-y-px"
                disabled={isSaving || !result}
                onClick={() => void handleSave()}
                type="button"
              >
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={1.8} />
                )}
                Luu vao CSDL
              </button>
            </div>

            {isValidating && validationStatus ? (
              <div className="rounded-[24px] border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-800">
                <div className="flex items-center gap-2 font-semibold">
                  <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                  {validationStatus}
                </div>
                <p className="mt-2 text-xs leading-5 text-sky-700">
                  PDF co text thuong nhanh hon. PDF scan/anh co the cham vi backend phai fallback sang Gemini File API.
                </p>
              </div>
            ) : null}

            {apiError ? <InlineAlert message={apiError} title="Khong the phan tich PDF" /> : null}
          </section>
        </div>
      </div>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Preview editor
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
              Kiem tra va sua truoc khi luu
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Preview ho tro 3 phan: trac nghiem A-D, dung/sai DDSS va tra loi ngan.
            </p>
          </div>

          {result ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {result.questions.length} cau hoi
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          {isValidating ? <PreviewSkeleton /> : null}
          {!isValidating && !result ? <EmptyPreviewState /> : null}
          {!isValidating && result ? (
            <PreviewEditor
              draftIssues={draftIssues}
              result={result}
              updateOption={updateOption}
              updateQuestionField={updateQuestionField}
              updateStatement={updateStatement}
              addQuestionAsset={addQuestionAsset}
              removeQuestionAsset={removeQuestionAsset}
            />
          ) : null}
        </div>
      </section>
    </section>
  )
}

function PreviewEditor({
  result,
  draftIssues,
  updateQuestionField,
  updateOption,
  updateStatement,
  addQuestionAsset,
  removeQuestionAsset,
}: {
  result: AdminImportValidationResponse
  draftIssues: string[]
  updateQuestionField: (index: number, patch: Partial<AdminImportQuestion>) => void
  updateOption: (index: number, label: 'A' | 'B' | 'C' | 'D', text: string) => void
  updateStatement: (index: number, label: AdminImportStatement['label'], text: string) => void
  addQuestionAsset: (index: number, file: File) => void
  removeQuestionAsset: (index: number, assetIndex: number) => void
}) {
  return (
    <div className="space-y-5">
      {result.warnings.length > 0 ? (
        <WarningBlock items={result.warnings} title="Canh bao tong the" tone="warning" />
      ) : null}

      {draftIssues.length > 0 ? (
        <WarningBlock items={draftIssues} title="Chua san sang luu" tone="danger" />
      ) : null}

      {result.questions.map((question, index) => {
        const clientIssues = getQuestionValidationIssues(question)
        const isQuestionReady = clientIssues.length === 0

        return (
          <article
            className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
            key={`${question.questionNumber}-${index}`}
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Cau {question.questionNumber}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={isQuestionReady ? 'success' : 'danger'}>
                    {isQuestionReady ? 'Hop le' : 'Can sua'}
                  </Badge>
                  <Badge tone="neutral">{formatQuestionType(question.questionType)}</Badge>
                  {question.assets.length > 0 ? <Badge tone="neutral">Co hinh</Badge> : null}
                  {question.warnings.length > 0 ? (
                    <Badge tone="warning">{question.warnings.length} warning</Badge>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  compact
                  label="So cau"
                  onChange={(value) =>
                    updateQuestionField(index, {
                      questionNumber: Number(value) || 0,
                    })
                  }
                  type="number"
                  value={String(question.questionNumber)}
                />
                <AnswerField
                  onChange={(value) =>
                    updateQuestionField(index, {
                      correctAnswer: value.toUpperCase(),
                    })
                  }
                  question={question}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-slate-900">De bai</div>
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

                {question.questionType === 'multiple_choice' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {question.options.map((option) => (
                      <label
                        className="rounded-[24px] border border-slate-200 bg-white p-4"
                        key={option.label}
                      >
                        <div className="mb-2 text-sm font-semibold text-slate-900">
                          Dap an {option.label}
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
                          Menh de {statement.label}
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
                  <WarningBlock items={clientIssues} title="Loi can sua" tone="danger" />
                ) : (
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                    Cau nay da hop le de luu.
                  </div>
                )}

                {question.warnings.length > 0 ? (
                  <WarningBlock items={question.warnings} title="AI warnings" tone="warning" />
                ) : null}

                <QuestionAssetEditor
                  assets={question.assets}
                  onAddAsset={(file) => addQuestionAsset(index, file)}
                  onRemoveAsset={(assetIndex) => removeQuestionAsset(index, assetIndex)}
                  questionNumber={question.questionNumber}
                />

                {question.changes.length > 0 ? (
                  <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                    <div className="text-sm font-semibold text-slate-900">AI da sua</div>
                    <div className="mt-3 space-y-3">
                      {question.changes.map((change, changeIndex) => (
                        <div
                          className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3"
                          key={`${change.field}-${changeIndex}`}
                        >
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {change.field}
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Goc:</span>{' '}
                            {change.original || '--'}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Sua:</span>{' '}
                            {change.corrected || '--'}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Ly do:</span>{' '}
                            {change.reason || '--'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  compact = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  compact?: boolean
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-900">{label}</div>
      <input
        autoCapitalize="off"
        autoCorrect="off"
        className={[
          'w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300',
          compact ? 'h-12' : 'h-14',
        ].join(' ')}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        type={type}
        value={value}
      />
    </label>
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
      <div className="mb-2 text-sm font-semibold text-slate-900">Mon hoc</div>
      <select
        className="h-14 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
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
  question: AdminImportQuestion
  onChange: (value: string) => void
}) {
  if (question.questionType === 'multiple_choice') {
    return (
      <label className="block">
        <div className="mb-2 text-sm font-semibold text-slate-900">Dap an dung</div>
        <select
          className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300"
          onChange={(event) => onChange(event.target.value)}
          value={question.correctAnswer}
        >
          <option value="">Chon</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </label>
    )
  }

  return (
    <InputField
      compact
      label={question.questionType === 'true_false' ? 'Dap an DDSS' : 'Dap an ngan'}
      onChange={onChange}
      placeholder={question.questionType === 'true_false' ? 'DDSS' : '68'}
      value={question.correctAnswer}
    />
  )
}

function QuestionAssetEditor({
  assets,
  questionNumber,
  onAddAsset,
  onRemoveAsset,
}: {
  assets: AdminImportAsset[]
  questionNumber: number
  onAddAsset: (file: File) => void
  onRemoveAsset: (assetIndex: number) => void
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ImageIcon className="h-4 w-4" strokeWidth={1.8} />
            Anh cua cau hoi
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Neu cau co hinh, crop anh tu PDF roi tai len tai day. Anh se duoc luu vao Storage va gan voi cau {questionNumber}.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white">
          <Upload className="h-4 w-4" strokeWidth={1.8} />
          Them anh
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
                  alt={`Cau ${questionNumber} asset ${assetIndex + 1}`}
                  className="max-h-80 w-full rounded-[16px] object-contain"
                  src={asset.assetDataUrl || asset.publicUrl}
                />
              ) : (
                <div className="text-sm text-slate-500">Chua co anh preview.</div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {asset.assetType} {asset.pageNumber ? `- trang ${asset.pageNumber}` : '- upload thu cong'}
                </div>
                <button
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  onClick={() => onRemoveAsset(assetIndex)}
                  type="button"
                >
                  Xoa anh
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
          Chua co anh nao cho cau nay.
        </div>
      )}
    </div>
  )
}

function InlineAlert({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-rose-800">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6">{message}</div>
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

function EmptyPreviewState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="mt-4 h-8 max-w-lg rounded-full bg-slate-200" />
        <div className="mt-3 h-4 max-w-2xl rounded-full bg-slate-200" />
        <div className="mt-2 h-4 max-w-xl rounded-full bg-slate-200" />
      </div>
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <Sparkles className="h-5 w-5 text-slate-500" strokeWidth={1.8} />
        </div>
        <div className="mt-4 text-lg font-semibold text-slate-900">Chua co preview</div>
        <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
          Upload PDF, nhap metadata va answer key, sau do bam phan tich PDF bang AI.
        </p>
      </div>
    </div>
  )
}

function PreviewSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[0, 1].map((item) => (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5" key={item}>
          <div className="h-5 w-28 rounded-full bg-slate-200" />
          <div className="mt-4 h-10 w-full rounded-[20px] bg-slate-200" />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((block) => (
              <div className="h-28 rounded-[24px] bg-slate-200" key={block} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatQuestionType(questionType: AdminImportQuestion['questionType']) {
  if (questionType === 'multiple_choice') {
    return 'Trac nghiem'
  }
  if (questionType === 'true_false') {
    return 'Dung sai'
  }
  return 'Tra loi ngan'
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
