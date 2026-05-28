import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import {
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createEmptyMetadata,
  deleteManagedImportedExam,
  fetchManagedImportedExamDraft,
  fetchManagedImportedExams,
  getDraftValidationIssues,
  getQuestionValidationIssues,
  requestExamPdfValidation,
  saveAdminImportedExam,
  saveManagedImportedExamDraft,
  subjectOptions,
  topicOptionsBySubjectCode,
  type AdminImportMetadata,
  type AdminImportAsset,
  type AdminImportQuestion,
  type AdminImportStatement,
  type AdminImportValidationResponse,
  type ManagedImportedExam,
  type SubjectCode,
  updateManagedImportedExam,
} from '../../features/admin-import/services/admin-import-service'

type AnswerChoice = 'A' | 'B' | 'C' | 'D'
type AnswerKeyByNumber = Record<number, string>
const PART_TWO_COUNT = 4
const PART_THREE_COUNT = 6

type ManagedExamFormState = {
  examId: string
  title: string
  schoolName: string
  city: string
  subjectCode: SubjectCode
  year: string
  durationMinutes: string
  variantCode: string
  isActive: boolean
}

export function ImportExamPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [metadata, setMetadata] = useState<AdminImportMetadata>(createEmptyMetadata())
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const partOneQuestionCount = getPartOneQuestionCount(metadata.subjectCode)
  const [partOneAnswers, setPartOneAnswers] = useState<Record<number, AnswerChoice | ''>>(
    () => createAnswerChoiceState(partOneQuestionCount),
  )
  const [partTwoAnswers, setPartTwoAnswers] = useState<AnswerKeyByNumber>(() =>
    createAnswerTextState(PART_TWO_COUNT),
  )
  const [partThreeAnswers, setPartThreeAnswers] = useState<AnswerKeyByNumber>(() =>
    createAnswerTextState(PART_THREE_COUNT),
  )
  const [dragActive, setDragActive] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationStatus, setValidationStatus] = useState('')
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState<AdminImportValidationResponse | null>(null)
  const [managedExams, setManagedExams] = useState<ManagedImportedExam[]>([])
  const [isLoadingManagedExams, setIsLoadingManagedExams] = useState(true)
  const [managerError, setManagerError] = useState('')
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [managedForm, setManagedForm] = useState<ManagedExamFormState | null>(null)
  const [isUpdatingManagedExam, setIsUpdatingManagedExam] = useState(false)
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null)
  const [editingQuestionExamId, setEditingQuestionExamId] = useState<string | null>(null)
  const [managedDraft, setManagedDraft] = useState<AdminImportValidationResponse | null>(null)
  const [isLoadingManagedDraft, setIsLoadingManagedDraft] = useState(false)
  const [isSavingManagedDraft, setIsSavingManagedDraft] = useState(false)

  const draftIssues = useMemo(() => {
    return getDraftValidationIssues({
      draft: result,
      pdfFile,
    })
  }, [pdfFile, result])

  const answerKeyText = useMemo(
    () =>
      buildAnswerKeyText({
        partOneAnswers,
        partTwoAnswers,
        partThreeAnswers,
        partOneQuestionCount,
        partTwoQuestionCount: PART_TWO_COUNT,
        partThreeQuestionCount: PART_THREE_COUNT,
      }),
    [partOneAnswers, partOneQuestionCount, partThreeAnswers, partTwoAnswers],
  )
  const topicSuggestions = useMemo(
    () => topicOptionsBySubjectCode[metadata.subjectCode] ?? [],
    [metadata.subjectCode],
  )

  useEffect(() => {
    void loadManagedExams()
  }, [])

  async function loadManagedExams() {
    try {
      setIsLoadingManagedExams(true)
      setManagerError('')
      const exams = await fetchManagedImportedExams()
      setManagedExams(exams)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the tai danh sach de da nhap.'
      setManagerError(message)
    } finally {
      setIsLoadingManagedExams(false)
    }
  }

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
    const nextPartOneQuestionCount = getPartOneQuestionCount(subjectCode)
    setMetadata((current) => ({
      ...current,
      subjectCode,
      subjectName: subject?.name ?? current.subjectName,
      durationMinutes: subject?.durationMinutes ?? current.durationMinutes,
    }))
    setPartOneAnswers((current) => resizeAnswerChoiceState(current, nextPartOneQuestionCount))
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
      void loadManagedExams()
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

  function startEditingManagedExam(exam: ManagedImportedExam) {
    setEditingExamId(exam.examId)
    setManagedForm({
      examId: exam.examId,
      title: exam.title,
      schoolName: exam.schoolName,
      city: exam.city,
      subjectCode: exam.subjectCode,
      year: String(exam.year),
      durationMinutes: String(exam.durationMinutes),
      variantCode: exam.variantCode,
      isActive: exam.isActive,
    })
  }

  function stopEditingManagedExam() {
    setEditingExamId(null)
    setManagedForm(null)
  }

  async function openManagedQuestionEditor(exam: ManagedImportedExam) {
    try {
      setEditingQuestionExamId(exam.examId)
      setIsLoadingManagedDraft(true)
      const draft = await fetchManagedImportedExamDraft(exam.examId)
      setManagedDraft(draft)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the mo editor cau hoi cua de thi.'
      toast.error(message)
      setEditingQuestionExamId(null)
      setManagedDraft(null)
    } finally {
      setIsLoadingManagedDraft(false)
    }
  }

  function closeManagedQuestionEditor() {
    setEditingQuestionExamId(null)
    setManagedDraft(null)
  }

  function updateManagedFormField<Key extends keyof ManagedExamFormState>(
    key: Key,
    value: ManagedExamFormState[Key],
  ) {
    setManagedForm((current) => (current ? { ...current, [key]: value } : current))
  }

  async function handleSaveManagedExam() {
    if (!managedForm) {
      return
    }

    if (
      !managedForm.title.trim() ||
      !managedForm.schoolName.trim() ||
      !managedForm.city.trim() ||
      !managedForm.year.trim() ||
      !managedForm.durationMinutes.trim()
    ) {
      toast.error('Hay dien du thong tin truoc khi cap nhat de thi.')
      return
    }

    try {
      setIsUpdatingManagedExam(true)
      await updateManagedImportedExam({
        examId: managedForm.examId,
        title: managedForm.title,
        schoolName: managedForm.schoolName,
        city: managedForm.city,
        subjectCode: managedForm.subjectCode,
        year: Number(managedForm.year) || new Date().getFullYear(),
        durationMinutes: Number(managedForm.durationMinutes) || 0,
        variantCode: managedForm.variantCode,
        isActive: managedForm.isActive,
      })
      toast.success('Da cap nhat thong tin de thi.')
      stopEditingManagedExam()
      await loadManagedExams()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the cap nhat de thi luc nay.'
      toast.error(message)
    } finally {
      setIsUpdatingManagedExam(false)
    }
  }

  async function handleDeleteManagedExam(exam: ManagedImportedExam) {
    const confirmed = window.confirm(
      `Ban co chac muon xoa de "${exam.title}"? Thao tac nay se xoa de, cau hoi va dap an lien quan.`,
    )
    if (!confirmed) {
      return
    }

    try {
      setDeletingExamId(exam.examId)
      await deleteManagedImportedExam({
        examId: exam.examId,
        subjectCode: exam.subjectCode,
        year: exam.year,
      })
      toast.success('Da xoa de thi khoi he thong.')
      if (editingExamId === exam.examId) {
        stopEditingManagedExam()
      }
      await loadManagedExams()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Khong the xoa de thi luc nay.'
      toast.error(message)
    } finally {
      setDeletingExamId(null)
    }
  }

  function updateManagedDraftQuestionField(index: number, patch: Partial<AdminImportQuestion>) {
    setManagedDraft((current) => {
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

  function updateManagedDraftOption(index: number, label: 'A' | 'B' | 'C' | 'D', text: string) {
    setManagedDraft((current) => {
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

  function updateManagedDraftStatement(
    index: number,
    label: AdminImportStatement['label'],
    text: string,
  ) {
    setManagedDraft((current) => {
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

  async function addManagedDraftQuestionAsset(index: number, file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Chi ho tro file anh PNG/JPG/WebP cho asset cau hoi.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setManagedDraft((current) => {
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

            return {
              ...question,
              assets: [
                ...question.assets,
                {
                  assetType: 'figure',
                  assetPath: `assets/q${String(question.questionNumber).padStart(2, '0')}-manual-${nextAssetIndex}.${extension}`,
                  pageNumber: null,
                  assetDataUrl: dataUrl,
                },
              ],
            }
          }),
        }
      })
      toast.success('Da them anh vao editor de thi da luu.')
    } catch {
      toast.error('Khong doc duoc file anh vua chon.')
    }
  }

  function removeManagedDraftQuestionAsset(index: number, assetIndex: number) {
    setManagedDraft((current) => {
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

  async function handleSaveManagedDraft() {
    if (!managedDraft) {
      return
    }

    const issues = getDraftValidationIssues({
      draft: managedDraft,
      pdfFile: new File(['managed-exam'], 'managed-exam.pdf', { type: 'application/pdf' }),
    }).filter((issue) => issue !== 'Chua co file PDF.')

    if (issues.length > 0) {
      toast.error(issues[0] ?? 'Du lieu de thi chua hop le de cap nhat.')
      return
    }

    try {
      setIsSavingManagedDraft(true)
      await saveManagedImportedExamDraft({
        draft: managedDraft,
      })
      toast.success('Da cap nhat noi dung cau hoi va dap an cua de thi.')
      await loadManagedExams()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the luu noi dung de thi da sua.'
      toast.error(message)
    } finally {
      setIsSavingManagedDraft(false)
    }
  }

  return (
    <section className="space-y-6">
      <TopicSuggestionList subjectCode={metadata.subjectCode} topics={topicSuggestions} />
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.08)]">


        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-5">
            <SectionHeading
              title="Thong tin toi thieu"
              description="Thoi luong duoc tu dong gan theo mon hoc. Exam ID van duoc sinh noi bo tu truong, mon, nam thi va ma de."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <SubjectField value={metadata.subjectCode} onChange={updateSubject} />
              <InputField
                label="Ten truong"
                onChange={(value) => updateMetadataField('schoolName', value)}
                placeholder="THPT Văn Lang"
                value={metadata.schoolName}
              />
              <InputField
                label="Thanh pho"
                onChange={(value) => updateMetadataField('city', value)}
                placeholder="Hà Nội"
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

            <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_42px_rgba(15,23,42,0.04)]">
              <div className="mb-2 block text-sm font-semibold text-slate-900">
                Dap an giao vien nhap
              </div>
              <div className="space-y-4">
                <AnswerKeySection
                  description="Phan I. Trac nghiem nhieu lua chon"
                  title="Phan I"
                >
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {buildNumberRange(1, partOneQuestionCount).map((questionNumber) => (
                      <AnswerChoiceField
                        key={questionNumber}
                        questionNumber={questionNumber}
                        value={partOneAnswers[questionNumber] ?? ''}
                        onChange={(value) => {
                          setPartOneAnswers((current) => ({
                            ...current,
                            [questionNumber]: value,
                          }))
                          setResult(null)
                        }}
                      />
                    ))}
                  </div>
                </AnswerKeySection>

                <AnswerKeySection
                  description="Phan II. Dung / Sai"
                  title="Phan II"
                >
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {buildNumberRange(1, PART_TWO_COUNT).map((questionNumber) => (
                      <AnswerTextField
                        key={questionNumber}
                        maxLength={4}
                        onChange={(value) => {
                          setPartTwoAnswers((current) => ({
                            ...current,
                            [questionNumber]: value.toUpperCase().replace(/[^DS]/g, '').slice(0, 4),
                          }))
                          setResult(null)
                        }}
                        placeholder="DDSS"
                        questionNumber={questionNumber}
                        value={partTwoAnswers[questionNumber] ?? ''}
                      />
                    ))}
                  </div>
                </AnswerKeySection>

                <AnswerKeySection
                  description="Phan III. Tra loi ngan"
                  title="Phan III"
                >
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {buildNumberRange(1, PART_THREE_COUNT).map((questionNumber) => (
                      <AnswerTextField
                        key={questionNumber}
                        onChange={(value) => {
                          setPartThreeAnswers((current) => ({
                            ...current,
                            [questionNumber]: value,
                          }))
                          setResult(null)
                        }}
                        placeholder="68"
                        questionNumber={questionNumber}
                        value={partThreeAnswers[questionNumber] ?? ''}
                      />
                    ))}
                  </div>
                </AnswerKeySection>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {buildAnswerKeyHint(partOneQuestionCount, PART_TWO_COUNT, PART_THREE_COUNT)} Neu thieu dap an, preview se canh bao de giao vien sua.
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

            <ManagedExamPanel
              deletingExamId={deletingExamId}
              editingExamId={editingExamId}
              exams={managedExams}
              form={managedForm}
              isLoading={isLoadingManagedExams}
              isSaving={isUpdatingManagedExam}
              onDelete={handleDeleteManagedExam}
              onEdit={startEditingManagedExam}
              onEditQuestions={openManagedQuestionEditor}
              onFormChange={updateManagedFormField}
              onRefresh={() => void loadManagedExams()}
              onSave={() => void handleSaveManagedExam()}
              onStopEditing={stopEditingManagedExam}
              panelError={managerError}
            />
          </section>
        </div>
      </div>

      {editingQuestionExamId ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Managed Exam Editor
              </div>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                Sua de da luu trong he thong
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Editor nay mo toan bo cau hoi cua de thi da luu, cho phep sua noi dung, dap an, topic va hinh anh giong preview sau khi AI phan tich.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSavingManagedDraft || isLoadingManagedDraft || !managedDraft}
                onClick={() => void handleSaveManagedDraft()}
                type="button"
              >
                {isSavingManagedDraft ? 'Dang luu...' : 'Luu noi dung de'}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={closeManagedQuestionEditor}
                type="button"
              >
                Dong editor
              </button>
            </div>
          </div>

          <div className="mt-6">
            {isLoadingManagedDraft ? <PreviewSkeleton /> : null}
            {!isLoadingManagedDraft && !managedDraft ? <EmptyPreviewState /> : null}
            {!isLoadingManagedDraft && managedDraft ? (
              <PreviewEditor
                addQuestionAsset={addManagedDraftQuestionAsset}
                draftIssues={getDraftValidationIssues({
                  draft: managedDraft,
                  pdfFile: new File(['managed-exam'], 'managed-exam.pdf', {
                    type: 'application/pdf',
                  }),
                }).filter((issue) => issue !== 'Chua co file PDF.')}
                removeQuestionAsset={removeManagedDraftQuestionAsset}
                result={managedDraft}
                updateOption={updateManagedDraftOption}
                updateQuestionField={updateManagedDraftQuestionField}
                updateStatement={updateManagedDraftStatement}
              />
            ) : null}
          </div>
        </section>
      ) : null}

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
      {draftIssues.length > 0 ? (
        <WarningBlock items={draftIssues} title="Chua san sang luu" tone="danger" />
      ) : null}

      {result.questions.map((question, index) => {
        const clientIssues = getQuestionValidationIssues(question)
        const isQuestionReady = clientIssues.length === 0
        const localizedQuestionNumber = toLocalizedQuestionNumber(question.questionType, question.questionNumber)
        const questionSectionLabel = formatQuestionSectionLabel(question.questionType)

        return (
          <article
            className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
            key={`${question.questionNumber}-${index}`}
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {questionSectionLabel} - Cau {localizedQuestionNumber}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={isQuestionReady ? 'success' : 'danger'}>
                    {isQuestionReady ? 'Hop le' : 'Can sua'}
                  </Badge>
                  <Badge tone="neutral">{formatQuestionType(question.questionType)}</Badge>
                  {question.assets.length > 0 ? <Badge tone="neutral">Co hinh</Badge> : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  compact
                  label="So cau trong phan"
                  onChange={(value) =>
                    updateQuestionField(index, {
                      questionNumber: toGlobalQuestionNumber(
                        question.questionType,
                        Number(value) || 0,
                      ),
                    })
                  }
                  type="number"
                  value={String(localizedQuestionNumber)}
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

                <QuestionAssetEditor
                  assets={question.assets}
                  onAddAsset={(file) => addQuestionAsset(index, file)}
                  onRemoveAsset={(assetIndex) => removeQuestionAsset(index, assetIndex)}
                  questionNumber={localizedQuestionNumber}
                  questionSectionLabel={questionSectionLabel}
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

function ManagedExamPanel({
  exams,
  isLoading,
  panelError,
  editingExamId,
  form,
  isSaving,
  deletingExamId,
  onRefresh,
  onEdit,
  onEditQuestions,
  onStopEditing,
  onFormChange,
  onSave,
  onDelete,
}: {
  exams: ManagedImportedExam[]
  isLoading: boolean
  panelError: string
  editingExamId: string | null
  form: ManagedExamFormState | null
  isSaving: boolean
  deletingExamId: string | null
  onRefresh: () => void
  onEdit: (exam: ManagedImportedExam) => void
  onEditQuestions: (exam: ManagedImportedExam) => void
  onStopEditing: () => void
  onFormChange: <Key extends keyof ManagedExamFormState>(
    key: Key,
    value: ManagedExamFormState[Key],
  ) => void
  onSave: () => void
  onDelete: (exam: ManagedImportedExam) => void
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_42px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Quan ly de da nhap</div>
          <div className="mt-1 text-sm leading-6 text-slate-500">
            Sua metadata co ban, bat/tat hien thi va xoa de thi ngay tai man nay.
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
          onClick={onRefresh}
          type="button"
        >
          Tai lai danh sach
        </button>
      </div>

      {panelError ? <InlineAlert message={panelError} title="Khong the tai danh sach de" /> : null}

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4" key={item}>
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && exams.length === 0 ? (
        <div className="mt-4 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
          Chua co de nao duoc luu tu man import nay.
        </div>
      ) : null}

      {!isLoading && exams.length > 0 ? (
        <div className="mt-4 space-y-4">
          {exams.map((exam) => {
            const isEditing = editingExamId === exam.examId && form?.examId === exam.examId

            return (
              <div
                className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                key={exam.examId}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-950">{exam.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">
                      {exam.schoolName} | {exam.subjectName} | {exam.year} | Ma {exam.variantCode || '--'}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={exam.isActive ? 'success' : 'warning'}>
                        {exam.isActive ? 'Dang hien' : 'Dang an'}
                      </Badge>
                      <Badge tone="neutral">{exam.examId}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      href={exam.pdfUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Mo PDF
                    </a>
                    <button
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={() => onEdit(exam)}
                      type="button"
                    >
                      Sua thong tin
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={() => void onEditQuestions(exam)}
                      type="button"
                    >
                      Sua cau hoi
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingExamId === exam.examId}
                      onClick={() => void onDelete(exam)}
                      type="button"
                    >
                      {deletingExamId === exam.examId ? 'Dang xoa...' : 'Xoa de thi'}
                    </button>
                  </div>
                </div>

                {isEditing && form ? (
                  <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        compact
                        label="Tieu de de thi"
                        onChange={(value) => onFormChange('title', value)}
                        value={form.title}
                      />
                      <SubjectField
                        compact
                        value={form.subjectCode}
                        onChange={(value) => onFormChange('subjectCode', value)}
                      />
                      <InputField
                        compact
                        label="Ten truong"
                        onChange={(value) => onFormChange('schoolName', value)}
                        value={form.schoolName}
                      />
                      <InputField
                        compact
                        label="Thanh pho"
                        onChange={(value) => onFormChange('city', value)}
                        value={form.city}
                      />
                      <InputField
                        compact
                        label="Nam thi"
                        onChange={(value) => onFormChange('year', value)}
                        type="number"
                        value={form.year}
                      />
                      <InputField
                        compact
                        label="Thoi luong"
                        onChange={(value) => onFormChange('durationMinutes', value)}
                        type="number"
                        value={form.durationMinutes}
                      />
                      <InputField
                        compact
                        label="Ma de"
                        onChange={(value) => onFormChange('variantCode', value)}
                        value={form.variantCode}
                      />
                      <label className="block">
                        <div className="mb-2 text-sm font-semibold text-slate-900">Trang thai</div>
                        <button
                          className={[
                            'h-12 w-full rounded-[20px] border px-4 text-sm font-semibold transition',
                            form.isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700',
                          ].join(' ')}
                          onClick={() => onFormChange('isActive', !form.isActive)}
                          type="button"
                        >
                          {form.isActive ? 'Dang hien cho hoc sinh' : 'Dang an khoi hoc sinh'}
                        </button>
                      </label>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={isSaving}
                        onClick={onSave}
                        type="button"
                      >
                        {isSaving ? 'Dang luu...' : 'Luu thay doi'}
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={onStopEditing}
                        type="button"
                      >
                        Huy
                      </button>
                    </div>
                  </div>
                ) : null}

              </div>
            )
          })}
        </div>
      ) : null}
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

function TopicSuggestionList({
  subjectCode,
  topics,
}: {
  subjectCode: SubjectCode
  topics: string[]
}) {
  return (
    <datalist id={`topic-suggestions-${subjectCode}`}>
      {topics.map((topic) => (
        <option key={topic} value={topic} />
      ))}
    </datalist>
  )
}

function AnswerKeySection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs leading-5 text-slate-500">{description}</div>
      </div>
      {children}
    </section>
  )
}

function AnswerChoiceField({
  questionNumber,
  value,
  onChange,
}: {
  questionNumber: number
  value: AnswerChoice | ''
  onChange: (value: AnswerChoice | '') => void
}) {
  return (
    <label className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Cau {questionNumber}
      </div>
      <select
        className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
        onChange={(event) => onChange(event.target.value as AnswerChoice | '')}
        value={value}
      >
        <option value="">--</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </label>
  )
}

function AnswerTextField({
  questionNumber,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  questionNumber: number
  value: string
  onChange: (value: string) => void
  placeholder: string
  maxLength?: number
}) {
  return (
    <label className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Cau {questionNumber}
      </div>
      <input
        autoCapitalize="off"
        autoCorrect="off"
        className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        type="text"
        value={value}
      />
    </label>
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
  compact = false,
}: {
  value: SubjectCode
  onChange: (value: SubjectCode) => void
  compact?: boolean
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-900">Mon hoc</div>
      <select
        className={[
          'w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300',
          compact ? 'h-12' : 'h-14',
        ].join(' ')}
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

function createAnswerChoiceState(total: number): Record<number, AnswerChoice | ''> {
  return buildNumberRange(1, total).reduce<Record<number, AnswerChoice | ''>>((acc, questionNumber) => {
    acc[questionNumber] = ''
    return acc
  }, {})
}

function createAnswerTextState(total: number): AnswerKeyByNumber {
  return buildNumberRange(1, total).reduce<AnswerKeyByNumber>((acc, questionNumber) => {
    acc[questionNumber] = ''
    return acc
  }, {})
}

function resizeAnswerChoiceState(
  current: Record<number, AnswerChoice | ''>,
  total: number,
): Record<number, AnswerChoice | ''> {
  return buildNumberRange(1, total).reduce<Record<number, AnswerChoice | ''>>((acc, questionNumber) => {
    acc[questionNumber] = current[questionNumber] ?? ''
    return acc
  }, {})
}

function buildNumberRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function buildAnswerKeyText(input: {
  partOneAnswers: Record<number, AnswerChoice | ''>
  partTwoAnswers: AnswerKeyByNumber
  partThreeAnswers: AnswerKeyByNumber
  partOneQuestionCount: number
  partTwoQuestionCount: number
  partThreeQuestionCount: number
}) {
  const entries: string[] = []

  for (const questionNumber of buildNumberRange(1, input.partOneQuestionCount)) {
    const value = input.partOneAnswers[questionNumber]?.trim()
    if (value) {
      entries.push(`${questionNumber}.${value}`)
    }
  }

  for (const localNumber of buildNumberRange(1, input.partTwoQuestionCount)) {
    const value = input.partTwoAnswers[localNumber]?.trim().toUpperCase()
    if (value) {
      entries.push(`${localNumber + input.partOneQuestionCount}.${value}`)
    }
  }

  for (const localNumber of buildNumberRange(1, input.partThreeQuestionCount)) {
    const value = input.partThreeAnswers[localNumber]?.trim()
    if (value) {
      entries.push(`${localNumber + input.partOneQuestionCount + input.partTwoQuestionCount}: ${value}`)
    }
  }

  return entries.join(', ')
}

function getPartOneQuestionCount(subjectCode: SubjectCode) {
  return subjectCode === 'VAT_LY' || subjectCode === 'HOA_HOC' ? 18 : 12
}

function buildAnswerKeyHint(partOneCount: number, partTwoCount: number, partThreeCount: number) {
  const partTwoStart = partOneCount + 1
  const partTwoEnd = partOneCount + partTwoCount
  const partThreeStart = partTwoEnd + 1
  const partThreeEnd = partTwoEnd + partThreeCount
  return `He thong tu map thanh chuoi dap an noi bo theo so cau 1-${partOneCount}, ${partTwoStart}-${partTwoEnd} va ${partThreeStart}-${partThreeEnd}.`
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
            Anh cua cau hoi
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Neu cau co hinh, crop anh tu PDF roi tai len tai day. Anh se duoc luu vao Storage va gan voi {questionSectionLabel.toLowerCase()} cau {questionNumber}.
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
                  alt={`${questionSectionLabel} cau ${questionNumber} asset ${assetIndex + 1}`}
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

function formatQuestionSectionLabel(questionType: AdminImportQuestion['questionType']) {
  if (questionType === 'multiple_choice') {
    return 'Phan I'
  }
  if (questionType === 'true_false') {
    return 'Phan II'
  }
  return 'Phan III'
}

function toLocalizedQuestionNumber(
  questionType: AdminImportQuestion['questionType'],
  questionNumber: number,
) {
  if (questionType === 'multiple_choice') {
    return questionNumber
  }
  if (questionType === 'true_false') {
    return Math.max(1, questionNumber - 12)
  }
  return Math.max(1, questionNumber - 16)
}

function toGlobalQuestionNumber(
  questionType: AdminImportQuestion['questionType'],
  localizedQuestionNumber: number,
) {
  if (localizedQuestionNumber <= 0) {
    return 0
  }
  if (questionType === 'multiple_choice') {
    return localizedQuestionNumber
  }
  if (questionType === 'true_false') {
    return localizedQuestionNumber + 12
  }
  return localizedQuestionNumber + 16
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
