import os
import sys
import json
import re
import time
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai

# Load env variables
for env_path in [".env", "web-app/.env", "web-app/.env.local", "ai_service/.env"]:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env")
    sys.exit(1)

if not GEMINI_API_KEY:
    print("❌ Thiếu GEMINI_API_KEY trong ai_service/.env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)

# Topics dictionary
TOPICS = {
    'VAT_LY': [
        'Vật lí nhiệt',
        'Khí lí tưởng',
        'Từ trường',
        'Vật lí hạt nhân',
        'Dao động cơ',
        'Sóng cơ và sóng âm',
        'Dòng điện xoay chiều',
        'Dao động và sóng điện từ',
        'Sóng ánh sáng',
        'Lượng tử ánh sáng',
    ],
    'HOA_HOC': [
        'Ester – Lipid',
        'Carbohydrate',
        'Hợp chất chứa nitrogen',
        'Polymer',
        'Pin điện và điện phân',
        'Đại cương về kim loại',
        'Nguyên tố nhóm IA và nhóm IIA',
        'Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất',
        'Sắt và một số kim loại quan trọng',
    ]
}

def slugify(text):
    import unicodedata
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def generate_questions(subject_code, topic):
    subject_name = "Vật Lý" if subject_code == "VAT_LY" else "Hóa Học"
    prompt = f"""Bạn là một giáo viên chuyên ra đề thi THPT Quốc Gia môn {subject_name} theo định hướng đổi mới năm 2025 của Bộ GD&ĐT Việt Nam.
Hãy tạo 10 câu hỏi trắc nghiệm (Phần 1: Trắc nghiệm nhiều lựa chọn, 4 đáp án A, B, C, D) cho chuyên đề: "{topic}".
Mức độ: Phân bổ từ Nhận biết, Thông hiểu đến Vận dụng. Nội dung phải chuẩn xác, có tính ứng dụng thực tiễn nếu phù hợp với định hướng 2025.

Chỉ trả về ĐÚNG MỘT MẢNG JSON, KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI (không markdown, không code block).
Định dạng JSON:
[
  {{
    "question_text": "Nội dung câu hỏi...",
    "correct_answer": "A",
    "options": [
      {{"label": "A", "text": "Nội dung đáp án A"}},
      {{"label": "B", "text": "Nội dung đáp án B"}},
      {{"label": "C", "text": "Nội dung đáp án C"}},
      {{"label": "D", "text": "Nội dung đáp án D"}}
    ]
  }},
  ...
]
"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt, generation_config={"temperature": 0.3})
    
    try:
        text = response.text.strip()
        # Xóa markdown json
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        questions = json.loads(text.strip())
        return questions
    except Exception as e:
        print(f"Lỗi khi parse JSON cho chuyên đề {topic}: {e}")
        print("Raw response:", response.text)
        return []

def seed_db():
    for subject_code, topics in TOPICS.items():
        subject_name = "Vật Lý" if subject_code == "VAT_LY" else "Hóa Học"
        for topic in topics:
            print(f"\n[{subject_name}] Đang tạo 10 câu hỏi cho chuyên đề: {topic}...")
            exam_id = f"supplemental-{slugify(topic)}-manual"
            
            # Check if exam exists
            existing = supabase.table('school_exams').select('exam_id').eq('exam_id', exam_id).execute()
            if existing.data:
                print(f"  -> Bỏ qua, chuyên đề này đã có dữ liệu (exam_id: {exam_id})")
                continue
                
            questions = generate_questions(subject_code, topic)
            if not questions or len(questions) != 10:
                print(f"  -> Lỗi: AI không trả về đủ 10 câu hỏi. (Trả về {len(questions)} câu)")
                continue
                
            # 1. Insert Exam
            print("  -> Đang lưu vào cơ sở dữ liệu...")
            supabase.table('school_exams').insert({
                'exam_id': exam_id,
                'title': f"Ôn tập: {topic}",
                'school_name': 'Hệ Thống',
                'city': 'Toàn Quốc',
                'subject_code': subject_code,
                'subject_name': subject_name,
                'year': 2025,
                'duration_minutes': 15,
                'display_variant_code': 'REV',
                'pdf_url': '',
                'is_active': True
            }).execute()
            
            # 2. Insert Questions
            for i, q in enumerate(questions):
                question_number = i + 1
                question_id = f"{exam_id}-q{question_number:02d}"
                
                supabase.table('school_exam_questions').insert({
                    'question_id': question_id,
                    'exam_id': exam_id,
                    'topic': topic,
                    'question_number': question_number,
                    'question_type': 'multiple_choice',
                    'question_text': q['question_text'],
                    'correct_answer': q['correct_answer'].upper(),
                    'metadata': {'ai_generated': True}
                }).execute()
                
                # 3. Insert Options
                options_to_insert = []
                for idx, opt in enumerate(q['options']):
                    label = opt['label'].upper()
                    options_to_insert.append({
                        'option_id': f"{question_id}-option-{label.lower()}",
                        'question_id': question_id,
                        'option_label': label,
                        'option_text': opt['text'],
                        'display_order': idx + 1
                    })
                if options_to_insert:
                    supabase.table('school_exam_question_options').insert(options_to_insert).execute()
                    
            print(f"  ✅ Đã lưu 10 câu hỏi cho chuyên đề {topic}.")
            # Sleep to avoid rate limits
            time.sleep(2)

if __name__ == "__main__":
    seed_db()
