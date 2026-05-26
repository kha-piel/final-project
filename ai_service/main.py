import json
import os
import logging
import re
import tempfile
import unicodedata
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)

try:
    import fitz
except ImportError:  # pragma: no cover - optional until requirements are installed
    fitz = None


load_dotenv()

app = FastAPI(
    title="RAG Explanation Service",
    description="Microservice tich hop Gemini de giai thich dap an dua tren knowledge base Markdown.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY chua duoc cau hinh. "
        "Hay tao file .env voi noi dung: GEMINI_API_KEY=your_key_here"
    )

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"
BASE_VAULT_PATH = Path(__file__).resolve().parent.parent / "docs" / "knowledge-base"
PDF_TEXT_EXTRACTION_MIN_CHARS = 120
logger = logging.getLogger("ai_service.admin_import")


class QuestionRequest(BaseModel):
    question_content: str
    student_answer: str
    correct_answer: str
    obsidian_source_path: str


class WrongQuestionItem(BaseModel):
    question_id: int
    question_content: str
    topic: str
    user_answer: str
    correct_answer: str


class WeaknessAnalysisRequest(BaseModel):
    wrong_questions: list[WrongQuestionItem]


class ParsedStudentPayload(BaseModel):
    mode: str
    selected_answer: str
    message: str


class ValidateExamRequest(BaseModel):
    content: str = Field(min_length=1)
    filename: str | None = None
    answer_key_content: str | None = Field(default=None, alias="answerKeyContent")

    model_config = {
        "populate_by_name": True,
    }


class ValidatedExamOption(BaseModel):
    label: str
    text: str


class ValidatedExamChange(BaseModel):
    field: str
    original: str
    corrected: str
    reason: str


class ValidatedExamQuestion(BaseModel):
    question_number: int | None = Field(default=None, alias="questionNumber")
    question_text: str = Field(default="", alias="questionText")
    options: list[ValidatedExamOption] = Field(default_factory=list)
    correct_answer: str = Field(default="", alias="correctAnswer")
    is_valid: bool = Field(default=True, alias="isValid")
    warnings: list[str] = Field(default_factory=list)
    changes: list[ValidatedExamChange] = Field(default_factory=list)
    raw_excerpt: str | None = Field(default=None, alias="rawExcerpt")

    model_config = {
        "populate_by_name": True,
    }


class ValidateExamResponse(BaseModel):
    is_valid: bool = Field(alias="isValid")
    warnings: list[str] = Field(default_factory=list)
    questions: list[ValidatedExamQuestion] = Field(default_factory=list)
    raw_model_response: str | None = Field(default=None, alias="rawModelResponse")

    model_config = {
        "populate_by_name": True,
    }


class PdfExamDraft(BaseModel):
    exam_id: str = Field(alias="examId")
    title: str
    school_name: str = Field(alias="schoolName")
    city: str
    subject_code: str = Field(alias="subjectCode")
    subject_name: str = Field(alias="subjectName")
    year: int
    duration_minutes: int = Field(alias="durationMinutes")
    variant_code: str = Field(alias="variantCode")
    pdf_storage_path: str = Field(alias="pdfStoragePath")
    pdf_url: str = Field(default="", alias="pdfUrl")

    model_config = {
        "populate_by_name": True,
    }


class PdfExamStatement(BaseModel):
    label: str
    text: str


class PdfExamAsset(BaseModel):
    asset_type: str = Field(default="question_block", alias="assetType")
    asset_path: str = Field(alias="assetPath")
    page_number: int | None = Field(default=None, alias="pageNumber")
    asset_data_url: str | None = Field(default=None, alias="assetDataUrl")

    model_config = {
        "populate_by_name": True,
    }


class PdfExamQuestion(BaseModel):
    question_number: int = Field(alias="questionNumber")
    question_type: str = Field(alias="questionType")
    question_text: str = Field(default="", alias="questionText")
    options: list[ValidatedExamOption] = Field(default_factory=list)
    statements: list[PdfExamStatement] = Field(default_factory=list)
    correct_answer: str = Field(default="", alias="correctAnswer")
    is_valid: bool = Field(default=True, alias="isValid")
    warnings: list[str] = Field(default_factory=list)
    changes: list[ValidatedExamChange] = Field(default_factory=list)
    assets: list[PdfExamAsset] = Field(default_factory=list)
    raw_excerpt: str | None = Field(default=None, alias="rawExcerpt")

    model_config = {
        "populate_by_name": True,
    }


class PdfExamValidateResponse(BaseModel):
    is_valid: bool = Field(alias="isValid")
    warnings: list[str] = Field(default_factory=list)
    exam_draft: PdfExamDraft = Field(alias="examDraft")
    questions: list[PdfExamQuestion] = Field(default_factory=list)
    raw_model_response: str | None = Field(default=None, alias="rawModelResponse")

    model_config = {
        "populate_by_name": True,
    }


def read_knowledge_context(relative_path: str) -> str:
    normalized = (relative_path or "").strip().lstrip("/\\")
    if not normalized:
        return ""

    file_path = BASE_VAULT_PATH / normalized
    if not file_path.exists() or not file_path.is_file():
        return ""

    return file_path.read_text(encoding="utf-8")


def parse_student_payload(raw_value: str) -> ParsedStudentPayload:
    lines = [line.strip() for line in raw_value.splitlines() if line.strip()]
    payload: dict[str, str] = {}

    for line in lines:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        payload[key.strip().upper()] = value.strip()

    mode = payload.get("MODE", "")
    selected_answer = payload.get("SELECTED_ANSWER", "")
    message = payload.get("MESSAGE", "")

    if mode and message:
        return ParsedStudentPayload(
            mode=mode.lower(),
            selected_answer=selected_answer or "Chua chon",
            message=message,
        )

    selected_answer = "Chua chon"
    message = raw_value.strip()
    mode = "follow_up"

    for line in lines:
        normalized = line.lower()
        if normalized.startswith("lua chon hien tai cua hoc sinh:"):
            selected_answer = line.split(":", 1)[1].strip()
        elif normalized.startswith("yeu cau he thong:"):
            mode = "auto_explain"
            message = line.split(":", 1)[1].strip()
        elif normalized.startswith("cau hoi them cua hoc sinh:"):
            mode = "follow_up"
            message = line.split(":", 1)[1].strip()

    return ParsedStudentPayload(
        mode=mode,
        selected_answer=selected_answer or "Chua chon",
        message=message or raw_value.strip(),
    )


def build_knowledge_section(knowledge_context: str) -> str:
    if knowledge_context:
        return (
            f"--- TAI LIEU KIEN THUC (Knowledge Context) ---\n{knowledge_context}\n--- KET THUC TAI LIEU ---"
        )

    return (
        "--- TAI LIEU KIEN THUC (Knowledge Context) ---\n"
        "Chua co file kien thuc chi dinh. Hay dua vao noi dung cau hoi, dap an dung va dap an sai "
        "de giai thich can ban, khong duoc boi dung them du lieu khong can thiet.\n"
        "--- KET THUC TAI LIEU ---"
    )


def build_auto_explain_prompt(
    question_content: str,
    correct_answer: str,
    selected_answer: str,
    knowledge_section: str,
) -> str:
    return f"""
Ban la mot gia su thong minh va kien nhan, chuyen giup hoc sinh on thi THPTQG.
Nhiem vu cua ban la phan tich loi sai cua hoc sinh va giai thich lai bai bang tieng Viet.

{knowledge_section}

--- THONG TIN BAI TAP ---
Cau hoi: {question_content}
Dap an dung: {correct_answer}
Dap an hoc sinh chon: {selected_answer}

--- YEU CAU BAT BUOC ---
1. Giai thich ro hoc sinh sai o dau.
2. Neu kien thuc cot loi can nho.
3. Huong dan cach lam dung de di den dap an dung.
4. Viet bang tieng Viet, ro rang, than thien.
5. Khong mo rong sang noi dung ngoai bai toan nay.
"""


def build_follow_up_prompt(
    question_content: str,
    correct_answer: str,
    selected_answer: str,
    student_message: str,
    knowledge_section: str,
) -> str:
    return f"""
Ban dang o trong mot cuoc hoi thoai tiep theo ve DUNG 1 cau hoi cu the.
Ban phai tra loi CHI cho cau hoi follow-up cua hoc sinh, khong duoc lap lai toan bo loi giai tu dau
neu hoc sinh khong yeu cau "giai lai tu dau", "giai chi tiet lai", hoac y tuong tuong duong.

{knowledge_section}

--- NGU CANH CAU HOI ---
Cau hoi: {question_content}
Dap an hoc sinh da chon: {selected_answer}
Dap an dung: {correct_answer}
Cau hoi follow-up cua hoc sinh: {student_message}

--- LUAT BAT BUOC ---
1. Neu cau hoi follow-up KHONG lien quan truc tiep den cau nay, dap an, cach giai, meo lam nhanh,
   kien thuc nen nho, hoac loi sai cua hoc sinh, chi tra loi dung 1 cau:
   "Mình chỉ hỗ trợ nội dung liên quan trực tiếp đến câu này thôi. Em hãy hỏi về cách giải, đáp án hoặc mẹo làm câu này nhé."
2. Neu hoc sinh hoi ngan nhu "co meo gi khong a", "em can nho gi", "buoc nay la sao", thi tra loi ngan gon,
   dung trong 3-6 cau, di thang vao y do. KHONG duoc chao hoi lai dai dong hay giai lai tu dau.
3. Chi khi hoc sinh yeu cau ro rang giai lai toan bo bai thi moi trinh bay day du.
4. Neu can dua meo, hay dua meo rat cu the cho chinh cau nay.
5. Giu van phong tro giang, ro rang, tu nhien, khong lap lai nguyen van cac phan da noi truoc do.
"""


def generate_text(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"Loi khi goi Gemini API: {str(exc)}",
        ) from exc

    text = getattr(response, "text", None)
    if not text:
        raise HTTPException(
            status_code=500,
            detail="Gemini API khong tra ve noi dung text hop le.",
        )
    return text


def slugify_ascii(value: str) -> str:
    normalized = unicodedata.normalize("NFD", (value or "").strip().lower())
    normalized = "".join(character for character in normalized if unicodedata.category(character) != "Mn")
    normalized = normalized.replace("đ", "d").replace("Đ", "d")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = re.sub(r"-+", "-", normalized).strip("-")
    return normalized or "de-thi"


def build_exam_id(school_name: str, subject_code: str, year: int, variant_code: str) -> str:
    return "-".join(
        part
        for part in [
            slugify_ascii(school_name),
            subject_code.strip().lower() or "mon",
            str(year),
            slugify_ascii(variant_code),
        ]
        if part
    )


def parse_answer_key_text(answer_key_text: str) -> dict[int, str]:
    normalized = (answer_key_text or "").replace("\n", " ")
    pattern = re.compile(
        r"(?<!\d)(\d{1,3})\s*(?:[.:=\-]|\s)\s*([DdSs]{4}|[A-Da-d]|[^,;\s]+)",
        re.UNICODE,
    )
    answers: dict[int, str] = {}

    for match in pattern.finditer(normalized):
        question_number = int(match.group(1))
        answer_value = match.group(2).strip()
        if not answer_value:
            continue

        upper_value = answer_value.upper()
        if re.fullmatch(r"[DS]{4}", upper_value):
            answers[question_number] = upper_value
        elif re.fullmatch(r"[A-D]", upper_value):
            answers[question_number] = upper_value
        else:
            answers[question_number] = answer_value

    return answers


def build_pdf_exam_prompt(
    pdf_name: str,
    subject_code: str,
    subject_name: str,
    answer_key_map: dict[int, str],
) -> str:
    response_template = {
        "warnings": ["string"],
        "questions": [
            {
                "questionNumber": 1,
                "questionType": "multiple_choice | true_false | short_answer",
                "questionText": "string",
                "options": [
                    {"label": "A", "text": "string"},
                    {"label": "B", "text": "string"},
                    {"label": "C", "text": "string"},
                    {"label": "D", "text": "string"},
                ],
                "statements": [
                    {"label": "a", "text": "string"},
                    {"label": "b", "text": "string"},
                    {"label": "c", "text": "string"},
                    {"label": "d", "text": "string"},
                ],
                "hasImage": False,
                "pageNumber": 1,
                "warnings": ["string"],
                "changes": [
                    {
                        "field": "question_text",
                        "original": "string",
                        "corrected": "string",
                        "reason": "string",
                    }
                ],
                "rawExcerpt": "string",
            }
        ],
    }

    return f"""
Ban la AI trich xuat de thi THPT tu PDF cho he thong giao vien.
Nguon PDF: {pdf_name}
Mon: {subject_code} - {subject_name}

NHIEM VU:
- Doc PDF va trich xuat day du cac cau hoi.
- Ho tro 3 loai cau: multiple_choice, true_false, short_answer.
- Sua loi OCR/chinh ta ro rang neu can va ghi vao changes.
- Khong tu doan dap an dung. Dap an dung se duoc he thong gan tu answer key rieng.

QUY TAC BAT BUOC:
1. Chi tra ve DUY NHAT JSON hop le, khong markdown.
2. questionNumber la so cau canonical trong de, tang dan.
3. questionType:
   - multiple_choice: co options A, B, C, D.
   - true_false: co statements a, b, c, d.
   - short_answer: khong co options/statements.
4. hasImage=true neu cau co hinh ve, bang, do thi, bieu do, so do, hoac cong thuc/hinh kho OCR.
5. pageNumber la trang PDF chua cau hoi, bat dau tu 1. Neu khong chac, de null va them warning.
6. Moi cong thuc Toan/Ly/Hoa viet bang LaTeX boc trong dau $.
7. Giu tieng Viet UTF-8 chuan.
8. Cau nao thieu de bai, thieu option/statement, hoac kho doc thi van tra ve nhung them warning.

ANSWER KEY DA PARSE TU GIAO VIEN:
{json.dumps(answer_key_map, ensure_ascii=False, indent=2)}

DINH DANG JSON:
{json.dumps(response_template, ensure_ascii=False, indent=2)}
""".strip()


def extract_pdf_text(pdf_path: Path) -> str:
    if fitz is None:
        return ""

    try:
        document = fitz.open(pdf_path)
        page_texts: list[str] = []
        for page_index in range(document.page_count):
            page = document.load_page(page_index)
            text = page.get_text("text").strip()
            if text:
                page_texts.append(f"--- PAGE {page_index + 1} ---\n{text}")
        document.close()
        return "\n\n".join(page_texts).strip()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Cannot extract PDF text with PyMuPDF: %s", exc)
        return ""


def build_pdf_text_exam_prompt(
    pdf_name: str,
    subject_code: str,
    subject_name: str,
    answer_key_map: dict[int, str],
    extracted_text: str,
) -> str:
    base_prompt = build_pdf_exam_prompt(
        pdf_name=pdf_name,
        subject_code=subject_code,
        subject_name=subject_name,
        answer_key_map=answer_key_map,
    )
    return f"""
{base_prompt}

NGUON TRICH TEXT TU PDF:
Backend da trich text truc tiep tu PDF bang PyMuPDF. CHI duoc phep dua vao nguon text nay.
Khong duoc doc anh, khong duoc suy luan tu hinh, khong duoc dung PDF image/File API.
Neu thay dau "--- PAGE N ---", dung N lam pageNumber cua cau hoi gan nhat.
Neu text thieu do co hinh/so do/bang thi giu lai phan text doc duoc, them warning, va tuyet doi khong tu them noi dung.

{extracted_text}
""".strip()


def generate_pdf_text_json(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0,
            ),
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Loi khi goi Gemini text PDF: {exc}") from exc

    text = getattr(response, "text", None)
    if not text:
        raise HTTPException(status_code=500, detail="Gemini khong tra ve JSON tu PDF text.")
    return text


def normalize_pdf_question(
    item: dict[str, Any],
    fallback_number: int,
    answer_key_map: dict[int, str],
    pdf_path: Path,
    asset_root_path: str,
) -> PdfExamQuestion:
    warnings = normalize_warning_list(item.get("warnings", []))
    question_number_raw = item.get("questionNumber", item.get("question_number", fallback_number))
    try:
        question_number = int(question_number_raw)
    except (TypeError, ValueError):
        question_number = fallback_number
        warnings.append("Khong doc duoc questionNumber, da gan theo thu tu fallback.")

    question_type = str(item.get("questionType", item.get("question_type", ""))).strip()
    if question_type not in {"multiple_choice", "true_false", "short_answer"}:
        question_type = "multiple_choice"
        warnings.append("Khong doc duoc questionType, tam gan multiple_choice.")

    raw_options = item.get("options", [])
    option_map: dict[str, str] = {}
    if isinstance(raw_options, list):
        for option in raw_options:
            if isinstance(option, dict):
                label = str(option.get("label", "")).strip().upper()
                if label:
                    option_map[label] = str(option.get("text", "") or "").strip()

    raw_statements = item.get("statements", [])
    statements: list[PdfExamStatement] = []
    if isinstance(raw_statements, list):
        for statement in raw_statements:
            if isinstance(statement, dict):
                label = str(statement.get("label", "")).strip().lower()
                text = str(statement.get("text", "") or "").strip()
                if label and text:
                    statements.append(PdfExamStatement(label=label, text=text))

    options = [
        ValidatedExamOption(label=label, text=option_map.get(label, ""))
        for label in ["A", "B", "C", "D"]
    ]
    correct_answer = str(answer_key_map.get(question_number, "")).strip()
    page_number_value = item.get("pageNumber", item.get("page_number", None))
    try:
        page_number = int(page_number_value) if page_number_value is not None else None
    except (TypeError, ValueError):
        page_number = None

    has_image = bool(item.get("hasImage", item.get("has_image", False)))
    assets: list[PdfExamAsset] = []
    if has_image:
        warnings.append("Cau co hinh trong PDF goc. Backend hien chi xu ly text, can giao vien doi chieu neu can.")

    changes: list[ValidatedExamChange] = []
    for change in item.get("changes", []):
        if isinstance(change, dict):
            changes.append(
                ValidatedExamChange(
                    field=str(change.get("field", "")).strip(),
                    original=str(change.get("original", "")).strip(),
                    corrected=str(change.get("corrected", "")).strip(),
                    reason=str(change.get("reason", "")).strip(),
                )
            )

    question_text = str(item.get("questionText", item.get("question_text", "")) or "").strip()

    is_valid = True
    if not question_text:
        is_valid = False
        warnings.append("Thieu de bai.")

    if question_type == "multiple_choice":
        missing_options = [option.label for option in options if not option.text]
        if missing_options:
            is_valid = False
            warnings.append(f"Thieu dap an {', '.join(missing_options)}.")
        if correct_answer.upper() not in {"A", "B", "C", "D"}:
            is_valid = False
            warnings.append("Thieu hoac sai dap an dung A/B/C/D.")
        correct_answer = correct_answer.upper()
    elif question_type == "true_false":
        if len(statements) < 4:
            is_valid = False
            warnings.append("Thieu menh de dung/sai a,b,c,d.")
        if not re.fullmatch(r"[DS]{4}", correct_answer.upper()):
            is_valid = False
            warnings.append("Thieu hoac sai dap an dung/sai dang DDSS.")
        correct_answer = correct_answer.upper()
    else:
        if not correct_answer:
            is_valid = False
            warnings.append("Thieu dap an tra loi ngan.")

    return PdfExamQuestion(
        question_number=question_number,
        question_type=question_type,
        question_text=question_text,
        options=options if question_type == "multiple_choice" else [],
        statements=statements if question_type == "true_false" else [],
        correct_answer=correct_answer,
        is_valid=is_valid,
        warnings=normalize_warning_list(warnings),
        changes=changes,
        assets=assets,
        raw_excerpt=str(item.get("rawExcerpt", item.get("raw_excerpt", "")) or "").strip() or None,
    )


def normalize_pdf_exam_response(
    payload: dict[str, Any],
    *,
    raw_model_response: str,
    pdf_path: Path,
    pdf_name: str,
    subject_code: str,
    subject_name: str,
    school_name: str,
    city: str,
    year: int,
    variant_code: str,
    duration_minutes: int,
    answer_key_map: dict[int, str],
) -> PdfExamValidateResponse:
    exam_id = build_exam_id(school_name, subject_code, year, variant_code)
    pdf_storage_path = f"{subject_code}/{year}/{exam_id}/source.pdf"
    asset_root_path = f"{subject_code}/{year}/{exam_id}"
    exam_draft = PdfExamDraft(
        exam_id=exam_id,
        title=f"De thi {subject_name} {school_name} {year} - Ma {variant_code}",
        school_name=school_name,
        city=city,
        subject_code=subject_code,
        subject_name=subject_name,
        year=year,
        duration_minutes=duration_minutes,
        variant_code=variant_code,
        pdf_storage_path=pdf_storage_path,
        pdf_url="",
    )

    questions: list[PdfExamQuestion] = []
    raw_questions = payload.get("questions", [])
    if isinstance(raw_questions, list):
        for index, item in enumerate(raw_questions, start=1):
            if isinstance(item, dict):
                questions.append(
                    normalize_pdf_question(item, index, answer_key_map, pdf_path, asset_root_path)
                )

    warnings = normalize_warning_list(payload.get("warnings", []))
    if not questions:
        warnings.append("Gemini khong trich xuat duoc cau hoi nao tu PDF.")

    duplicate_numbers = [
        question.question_number
        for question in questions
        if [item.question_number for item in questions].count(question.question_number) > 1
    ]
    if duplicate_numbers:
        warnings.append("Co questionNumber bi trung lap, can giao vien kiem tra lai.")

    is_valid = bool(questions) and not any(not question.is_valid for question in questions)
    return PdfExamValidateResponse(
        is_valid=is_valid,
        warnings=warnings,
        exam_draft=exam_draft,
        questions=questions,
        raw_model_response=raw_model_response,
    )


def build_answer_key_section(answer_key_content: str | None) -> str:
    cleaned_answer_key = (answer_key_content or "").strip()
    if not cleaned_answer_key:
        return (
            "--- NGUON DAP AN PHU ---\n"
            "Khong co nguon dap an rieng. Neu dap an dung khong nam ro trong noi dung de thi, "
            'hay de correctAnswer = "" va ghi warning cu the.\n'
            "--- KET THUC NGUON DAP AN PHU ---"
        )

    return (
        "--- NGUON DAP AN PHU ---\n"
        "Day la nguon dap an rieng do giao vien cung cap. Hay uu tien nguon nay de xac dinh correctAnswer. "
        "Neu nguon dap an rieng mau thuan voi noi dung de, giu correctAnswer theo nguon dap an rieng va them warning.\n"
        f"{cleaned_answer_key}\n"
        "--- KET THUC NGUON DAP AN PHU ---"
    )


def build_validate_exam_prompt(
    content: str,
    filename: str | None = None,
    answer_key_content: str | None = None,
) -> str:
    source_name = filename or "pasted_input.txt"
    answer_key_section = build_answer_key_section(answer_key_content)
    response_template = {
        "isValid": True,
        "warnings": [
            "string"
        ],
        "questions": [
            {
                "questionNumber": 1,
                "questionText": "string",
                "options": [
                    {"label": "A", "text": "string"},
                    {"label": "B", "text": "string"},
                    {"label": "C", "text": "string"},
                    {"label": "D", "text": "string"},
                ],
                "correctAnswer": "A",
                "isValid": True,
                "warnings": [
                    "string"
                ],
                "changes": [
                    {
                        "field": "question_text | option_A | option_B | option_C | option_D | correct_answer",
                        "original": "string",
                        "corrected": "string",
                        "reason": "string"
                    }
                ],
                "rawExcerpt": "string"
            }
        ]
    }

    return f"""
Ban la AI kiem dinh de thi trac nghiem THPTQG cho he thong admin.
Nhiem vu: doc noi dung de thi dang text/markdown, boc tach tung cau hoi trac nghiem 4 lua chon,
tu dong sua loi chinh ta hoac tu ngu ro rang neu co, va bao cao cac loi cau truc.

Ten nguon: {source_name}

{answer_key_section}

QUY TAC BAT BUOC:
1. Chi tra ve DUY NHAT 1 JSON hop le. Khong them markdown, khong them giai thich ngoai JSON.
2. Chi xu ly cau hoi trac nghiem co 4 dap an A, B, C, D. Neu cau nao khong du 4 dap an, van tra ve cau do
   nhung dat isValid=false va them warning cu the.
3. Neu phat hien loi chinh ta, OCR, ky tu vo nghia, hay sua ve ban de doc hon. Moi chinh sua phai ghi vao mang changes.
4. Neu co NGUON DAP AN PHU, uu tien nguon do de xac dinh correctAnswer. Neu khong co nguon dap an phu thi moi duoc
   suy ra tu noi dung de. Neu van khong chac chan, de correctAnswer = "" va them warning.
5. Neu input co noi dung khong phai cau hoi, bo qua va ghi vao warnings cap response.
6. Thu tu questionNumber phai tang dan theo thu tu xuat hien trong van ban.
7. options phai la mang 4 phan tu theo thu tu A, B, C, D khi co the.
8. rawExcerpt la mot doan ngan cua van ban goc cua cau do de giao vien doi chieu.
9. isValid cap response chi la true khi tat ca cau hoi hop le va co correctAnswer hop le.
10. Neu nguon dap an phu chi co mot phan dap an, chi dien correctAnswer cho nhung cau khop chac chan. Cac cau con lai de trong.
11. warning cap response dung de ghi chu noi dung bi bo qua, nghi ngo format dau vao, hoac xung dot giua de thi va nguon dap an phu.
12. warning cap question dung de ghi cac loi nhu thieu de bai, thieu dap an, OCR xau, hoac dap an dung khong chac chan.

DINH DANG JSON PHAI KHOP MAU SAU:
{json.dumps(response_template, ensure_ascii=False, indent=2)}

NOI DUNG CAN XU LY:
<<<BEGIN_EXAM_CONTENT>>>
{content}
<<<END_EXAM_CONTENT>>>
"""


def extract_json_text(raw_text: str) -> str:
    text = (raw_text or "").strip()
    if not text:
        return text

    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 3:
            text = "\n".join(lines[1:-1]).strip()

    if text.startswith("{") and text.endswith("}"):
        return text

    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
        return text[first_brace:last_brace + 1]

    return text


def parse_model_json_payload(raw_model_response: str) -> dict[str, Any]:
    try:
        parsed_payload = json.loads(extract_json_text(raw_model_response))
    except json.JSONDecodeError:
        return {}

    if not isinstance(parsed_payload, dict):
        return {}

    return parsed_payload


def payload_contains_questions(payload: dict[str, Any]) -> bool:
    raw_questions = payload.get("questions", [])
    if not isinstance(raw_questions, list):
        return False

    return any(isinstance(item, dict) for item in raw_questions)


def normalize_warning_list(raw_warnings: Any) -> list[str]:
    if not isinstance(raw_warnings, list):
        return []

    seen: set[str] = set()
    normalized_warnings: list[str] = []
    for entry in raw_warnings:
        warning = str(entry).strip()
        if warning and warning not in seen:
            seen.add(warning)
            normalized_warnings.append(warning)
    return normalized_warnings


def normalize_question_payload(item: dict[str, Any], fallback_number: int) -> ValidatedExamQuestion:
    raw_options = item.get("options", [])
    option_map: dict[str, str] = {}

    if isinstance(raw_options, dict):
        for label, value in raw_options.items():
            normalized_label = str(label).strip().upper()
            if normalized_label:
                option_map[normalized_label] = str(value or "").strip()
    elif isinstance(raw_options, list):
        for option in raw_options:
            if not isinstance(option, dict):
                continue
            normalized_label = str(option.get("label", "")).strip().upper()
            if normalized_label:
                option_map[normalized_label] = str(option.get("text", "") or "").strip()

    ordered_labels = ["A", "B", "C", "D"]
    normalized_options = [
        ValidatedExamOption(label=label, text=option_map.get(label, ""))
        for label in ordered_labels
    ]

    warnings = normalize_warning_list(item.get("warnings", []))
    changes: list[ValidatedExamChange] = []
    for change in item.get("changes", []):
        if not isinstance(change, dict):
            continue
        field = str(change.get("field", "")).strip()
        original = str(change.get("original", "")).strip()
        corrected = str(change.get("corrected", "")).strip()
        reason = str(change.get("reason", "")).strip()

        if not any((field, original, corrected, reason)):
            continue

        changes.append(
            ValidatedExamChange(
                field=field,
                original=original,
                corrected=corrected,
                reason=reason,
            )
        )

    question_number = item.get("questionNumber", item.get("question_number", fallback_number))
    try:
        normalized_number = int(question_number) if question_number is not None else fallback_number
    except (TypeError, ValueError):
        normalized_number = fallback_number
        warnings.append("Khong doc duoc questionNumber tu AI, da gan theo thu tu fallback.")

    question = ValidatedExamQuestion(
        question_number=normalized_number,
        question_text=str(item.get("questionText", item.get("question_text", "")) or "").strip(),
        options=normalized_options,
        correct_answer=str(item.get("correctAnswer", item.get("correct_answer", "")) or "").strip().upper(),
        is_valid=bool(item.get("isValid", item.get("is_valid", True))),
        warnings=warnings,
        changes=changes,
        raw_excerpt=str(item.get("rawExcerpt", item.get("raw_excerpt", "")) or "").strip() or None,
    )

    if not question.question_text:
        question.is_valid = False
        question.warnings.append("Thieu de bai sau khi AI boc tach.")

    missing_labels = [option.label for option in question.options if not option.text]
    if missing_labels:
        question.is_valid = False
        question.warnings.append(f"Thieu noi dung dap an: {', '.join(missing_labels)}.")

    if question.correct_answer not in {"A", "B", "C", "D"}:
        question.is_valid = False
        question.warnings.append("Dap an dung khong hop le hoac AI khong xac dinh duoc.")

    question.warnings = normalize_warning_list(question.warnings)
    return question


def normalize_validate_exam_payload(payload: dict[str, Any], raw_model_response: str | None = None) -> ValidateExamResponse:
    raw_questions = payload.get("questions", [])
    normalized_questions: list[ValidatedExamQuestion] = []
    if isinstance(raw_questions, list):
        for index, item in enumerate(raw_questions, start=1):
            if isinstance(item, dict):
                normalized_questions.append(normalize_question_payload(item, index))

    response_warnings = normalize_warning_list(payload.get("warnings", []))

    overall_valid = bool(payload.get("isValid", payload.get("is_valid", True)))
    if not normalized_questions:
        overall_valid = False
        response_warnings.append("AI khong boc tach duoc cau hoi hop le nao tu noi dung dau vao.")

    question_numbers = [question.question_number for question in normalized_questions if question.question_number is not None]
    if len(question_numbers) != len(set(question_numbers)):
        overall_valid = False
        response_warnings.append("AI tra ve questionNumber bi trung lap, can giao vien kiem tra lai.")

    if any(not question.is_valid for question in normalized_questions):
        overall_valid = False

    return ValidateExamResponse(
        is_valid=overall_valid,
        warnings=normalize_warning_list(response_warnings),
        questions=normalized_questions,
        raw_model_response=raw_model_response,
    )


def validate_exam_with_gemini(
    content: str,
    filename: str | None = None,
    answer_key_content: str | None = None,
) -> ValidateExamResponse:
    prompt = build_validate_exam_prompt(
        content=content,
        filename=filename,
        answer_key_content=answer_key_content,
    )
    raw_model_response = generate_text(prompt)

    try:
        parsed_payload = json.loads(extract_json_text(raw_model_response))
    except json.JSONDecodeError:
        return ValidateExamResponse(
            is_valid=False,
            warnings=[
                "Gemini tra ve JSON khong hop le. Giao vien can kiem tra lai hoac thu phan tich lai."
            ],
            questions=[],
            raw_model_response=raw_model_response,
        )

    if not isinstance(parsed_payload, dict):
        return ValidateExamResponse(
            is_valid=False,
            warnings=[
                "Gemini tra ve payload khong dung cau truc object mong doi."
            ],
            questions=[],
            raw_model_response=raw_model_response,
        )

    return normalize_validate_exam_payload(
        parsed_payload,
        raw_model_response=raw_model_response,
    )


@app.get("/health")
async def healthcheck():
    return {
        "status": "ok",
        "model": MODEL_NAME,
    }


@app.post("/api/explain")
async def explain_answer(request: QuestionRequest):
    knowledge_context = read_knowledge_context(request.obsidian_source_path)
    knowledge_section = build_knowledge_section(knowledge_context)
    student_payload = parse_student_payload(request.student_answer)

    if student_payload.mode == "auto_explain":
        prompt = build_auto_explain_prompt(
            question_content=request.question_content,
            correct_answer=request.correct_answer,
            selected_answer=student_payload.selected_answer,
            knowledge_section=knowledge_section,
        )
    else:
        prompt = build_follow_up_prompt(
            question_content=request.question_content,
            correct_answer=request.correct_answer,
            selected_answer=student_payload.selected_answer,
            student_message=student_payload.message,
            knowledge_section=knowledge_section,
        )

    explanation_text = generate_text(prompt)
    return {
        "status": "success",
        "explanation": explanation_text,
    }


@app.post("/api/analyze-weaknesses")
async def analyze_weaknesses(request: WeaknessAnalysisRequest):
    if not request.wrong_questions:
        return {
            "status": "success",
            "explanation": (
                "Hoc sinh khong co cau sai nao trong bai nay. "
                "Nen tiep tuc duy tri nhip on tap va nang muc do cau hoi de kiem tra do vung kien thuc."
            ),
        }

    wrong_questions_json = json.dumps(
        [item.model_dump() for item in request.wrong_questions],
        ensure_ascii=False,
    )

    prompt = (
        "Dua tren cac cau hoc sinh lam sai sau day: "
        f"{wrong_questions_json}, "
        "hay phan tich ngan gon trong 3-4 cau xem hoc sinh dang hong kien thuc o chuyen de nao nhat "
        "va dua ra loi khuyen on tap cu the."
    )

    explanation_text = generate_text(prompt)
    return {
        "status": "success",
        "explanation": explanation_text,
    }


@app.post("/api/admin/validate-exam")
async def validate_exam(request: ValidateExamRequest):
    cleaned_content = request.content.strip()
    if not cleaned_content:
        raise HTTPException(status_code=400, detail="Noi dung de thi dang rong.")

    cleaned_answer_key = (request.answer_key_content or "").strip() or None
    response = validate_exam_with_gemini(
        content=cleaned_content,
        filename=request.filename,
        answer_key_content=cleaned_answer_key,
    )
    return response.model_dump(by_alias=True)


@app.post("/api/admin/import-exam-pdf/validate")
async def validate_exam_pdf(
    pdf_file: UploadFile = File(alias="pdfFile"),
    subject_code: str = Form(alias="subjectCode"),
    subject_name: str = Form(alias="subjectName"),
    school_name: str = Form(alias="schoolName"),
    city: str = Form(),
    year: int = Form(),
    variant_code: str = Form(alias="variantCode"),
    duration_minutes: int = Form(alias="durationMinutes"),
    answer_key_text: str = Form(default="", alias="answerKeyText"),
):
    if not pdf_file.filename or not pdf_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Chi ho tro file PDF.")

    cleaned_subject_code = subject_code.strip().upper()
    cleaned_subject_name = subject_name.strip()
    cleaned_school_name = school_name.strip()
    cleaned_city = city.strip()
    cleaned_variant_code = variant_code.strip()

    if cleaned_subject_code not in {"TOAN", "VAT_LY", "HOA_HOC"}:
        raise HTTPException(status_code=400, detail="Mon hoc khong hop le.")

    if not all((cleaned_subject_name, cleaned_school_name, cleaned_city, cleaned_variant_code)):
        raise HTTPException(status_code=400, detail="Thieu metadata bat buoc cua de thi.")

    if year < 2000 or year > 2100:
        raise HTTPException(status_code=400, detail="Nam thi khong hop le.")

    if duration_minutes <= 0 or duration_minutes > 300:
        raise HTTPException(status_code=400, detail="Thoi luong lam bai khong hop le.")

    answer_key_map = parse_answer_key_text(answer_key_text)
    tmp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_path = Path(tmp_file.name)
            while chunk := await pdf_file.read(1024 * 1024):
                tmp_file.write(chunk)

        logger.info("Start PDF validation: file=%s subject=%s", pdf_file.filename, cleaned_subject_code)
        extracted_text = extract_pdf_text(tmp_path)
        logger.info("Extracted PDF text length: %s", len(extracted_text))

        if len(extracted_text) < PDF_TEXT_EXTRACTION_MIN_CHARS:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Khong trich xuat du text tu PDF. Backend hien chi xu ly text, khong quet anh. "
                    "Hay dung PDF co text layer hoac OCR file truoc khi import."
                ),
            )

        logger.info("Using text-only Gemini extraction.")
        prompt = build_pdf_text_exam_prompt(
            pdf_name=pdf_file.filename,
            subject_code=cleaned_subject_code,
            subject_name=cleaned_subject_name,
            answer_key_map=answer_key_map,
            extracted_text=extracted_text,
        )
        raw_model_response = generate_pdf_text_json(prompt)
        parsed_payload = parse_model_json_payload(raw_model_response)

        response = normalize_pdf_exam_response(
            parsed_payload,
            raw_model_response=raw_model_response,
            pdf_path=tmp_path,
            pdf_name=pdf_file.filename,
            subject_code=cleaned_subject_code,
            subject_name=cleaned_subject_name,
            school_name=cleaned_school_name,
            city=cleaned_city,
            year=year,
            variant_code=cleaned_variant_code,
            duration_minutes=duration_minutes,
            answer_key_map=answer_key_map,
        )
        logger.info(
            "Finished PDF validation: file=%s questions=%s valid=%s",
            pdf_file.filename,
            len(response.questions),
            response.is_valid,
        )
        if not payload_contains_questions(parsed_payload):
            logger.warning("Text-only extraction returned no questions: file=%s", pdf_file.filename)
        return response.model_dump(by_alias=True)
    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
