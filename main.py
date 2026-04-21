# ==============================================================================
# main.py - Python RAG Microservice (FastAPI + Google Gemini)
# Vai trò: Trung gian giữa ứng dụng Java (Frontend) và LLM (Gemini),
#          thực hiện kỹ thuật RAG để giải thích đáp án cho học sinh.
# Cổng  : http://localhost:8000
# ==============================================================================

import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ------------------------------------------------------------------------------
# 1. KHỞI TẠO FASTAPI APPLICATION
# ------------------------------------------------------------------------------
app = FastAPI(
    title="RAG Explanation Service",
    description="Microservice tích hợp Gemini để giải thích đáp án bài kiểm tra dựa trên Obsidian Vault.",
    version="1.0.0",
)

# ------------------------------------------------------------------------------
# 2. CẤU HÌNH GOOGLE GEMINI
#    Điền API Key của bạn vào chuỗi dưới đây trước khi chạy server.
# ------------------------------------------------------------------------------
GEMINI_API_KEY = "AIzaSyD_jxCXwGf-RwcMZ2D5N4M7AaIudlj6J38"
genai.configure(api_key=GEMINI_API_KEY)

# Sử dụng model Gemini 2.5 Flash
model = genai.GenerativeModel("gemini-2.5-flash")

# ------------------------------------------------------------------------------
# 3. THƯ MỤC GỐC CỦA OBSIDIAN VAULT
#    Vault nằm ngang hàng với file main.py này.
# ------------------------------------------------------------------------------
BASE_VAULT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Obsidian Vault")

# ------------------------------------------------------------------------------
# 4. ĐỊNH NGHĨA DATA MODEL (PYDANTIC)
#    Ánh xạ JSON body được gửi từ ứng dụng Java.
# ------------------------------------------------------------------------------
class QuestionRequest(BaseModel):
    question_content: str       # Nội dung câu hỏi
    student_answer: str         # Đáp án học sinh đã chọn (sai)
    correct_answer: str         # Đáp án đúng
    obsidian_source_path: str   # Đường dẫn tương đối đến file .md trong Vault
                                # Ví dụ: "Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md"

# ------------------------------------------------------------------------------
# 5. ENDPOINT POST /api/explain
#    Nhận thông tin câu hỏi → Đọc tài liệu Vault → Tạo Prompt → Gọi Gemini → Trả kết quả
# ------------------------------------------------------------------------------
@app.post("/api/explain")
async def explain_answer(request: QuestionRequest):
    """
    Giải thích nguyên nhân học sinh trả lời sai và hướng dẫn cách giải đúng
    dựa trên tài liệu kiến thức trong Obsidian Vault.
    """

    # --- Bước 5.1: RETRIEVAL - Đọc file kiến thức từ Obsidian Vault ---
    file_path = os.path.join(BASE_VAULT_PATH, request.obsidian_source_path)

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            knowledge_context = f.read()
    except FileNotFoundError:
        # Trả về lỗi 404 nếu không tìm thấy file tài liệu
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy file kiến thức tại đường dẫn: '{request.obsidian_source_path}'. "
                   f"Vui lòng kiểm tra lại giá trị obsidian_source_path."
        )

    # --- Bước 5.2: TẠO PROMPT ---
    # Kết hợp tài liệu kiến thức + thông tin câu hỏi thành một prompt hoàn chỉnh
    prompt = f"""
Bạn là một gia sư thông minh và kiên nhẫn, chuyên giúp học sinh ôn thi THPTQG.
Nhiệm vụ của bạn là phân tích lỗi sai của học sinh và giải thích lại bài bằng tiếng Việt.

--- TÀI LIỆU KIẾN THỨC (Knowledge Context) ---
{knowledge_context}
--- KẾT THÚC TÀI LIỆU ---

--- THÔNG TIN BÀI TẬP ---
Câu hỏi     : {request.question_content}
Đáp án đúng : {request.correct_answer}
Đáp án học sinh chọn (SAI): {request.student_answer}

--- YÊU CẦU ---
Dựa chặt chẽ vào Tài liệu Kiến thức ở trên (KHÔNG dùng kiến thức ngoài tài liệu),
hãy thực hiện đầy đủ 3 phần sau:

1. **Phân tích lỗi sai**: Giải thích tại sao đáp án học sinh chọn là sai.
2. **Kiến thức cần nhớ**: Trích dẫn và nhấn mạnh khái niệm / công thức liên quan từ tài liệu.
3. **Hướng dẫn giải đúng**: Trình bày từng bước để đi đến đáp án đúng một cách rõ ràng, dễ hiểu.

Hãy trình bày lời giải thích một cách thân thiện, khuyến khích học sinh.
"""

    # --- Bước 5.3: GỌI GOOGLE GEMINI API ---
    try:
        response = model.generate_content(prompt)
        explanation_text = response.text
    except Exception as e:
        # Trả về lỗi 500 nếu có vấn đề khi gọi Gemini API
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi gọi Gemini API: {str(e)}"
        )

    # --- Bước 5.4: TRẢ VỀ KẾT QUẢ CHO CLIENT (Java) ---
    return {
        "status": "success",
        "explanation": explanation_text,
    }


# ------------------------------------------------------------------------------
# 6. CHẠY SERVER (chỉ dùng khi chạy trực tiếp bằng `python main.py`)
#    Khuyến nghị dùng: uvicorn main:app --reload --port 8000
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
