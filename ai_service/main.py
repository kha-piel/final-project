import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
