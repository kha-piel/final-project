import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(r"c:\Users\ADMIIN\VScode\final-project\.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

topics_by_subject = {
    'TOAN': [
        'Cấp số cộng và cấp số nhân',
        'Cực trị, GTLN và GTNN',
        'Đường tiệm cận',
        'Giới hạn dãy số',
        'Hệ trục tọa độ Oxyz',
        'Hình học không gian - véctơ',
        'Khảo sát và đọc đồ thị hàm số',
        'Mũ và logarit',
        'Nguyên hàm và tích phân',
        'Phương trình mặt phẳng trong Oxyz',
        'Phương trình mũ và logarit',
        'Quan hệ vuông góc và khối đa diện',
        'Quy hoạch tuyến tính và bài toán tối ưu',
        'Tích phân và diện tích hình phẳng',
        'Tổ hợp, xác suất và đếm',
    ],
    'VAT_LY': [
        'Dao động cơ',
        'Sóng cơ',
        'Điện xoay chiều',
        'Dao động và sóng điện từ',
        'Sóng ánh sáng',
        'Lượng tử ánh sáng',
        'Hạt nhân nguyên tử',
        'Nhiệt học và chất khí',
        'Điện tích và điện trường',
        'Dòng điện không đổi',
        'Từ trường',
        'Cảm ứng điện từ',
        'Quang học',
    ],
    'HOA_HOC': [
        'Cấu tạo nguyên tử, bảng tuần hoàn và liên kết hóa học',
        'Phản ứng oxi hóa khử',
        'Tốc độ phản ứng và cân bằng hóa học',
        'Dung dịch, pH và chuẩn độ',
        'Este và lipit',
        'Cacbohidrat',
        'Amin, amino axit và protein',
        'Polime',
        'Đại cương kim loại',
        'Kim loại kiềm, kiềm thổ và nhôm',
        'Sắt và hợp chất của sắt',
        'Điện phân',
        'Tổng hợp hóa vô cơ',
        'Tổng hợp hóa hữu cơ',
        'Hóa học với thực tiễn',
    ]
}

def slugify(text):
    import unicodedata
    import re
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = re.sub(r'đ', 'd', text, flags=re.IGNORECASE)
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

for subject_code, topics in topics_by_subject.items():
    subject_name = {
        'TOAN': 'Toán học',
        'VAT_LY': 'Vật lý',
        'HOA_HOC': 'Hóa học'
    }[subject_code]

    for topic in topics:
        exam_id = f"supplemental-{slugify(topic)}-manual"
        
        # Upsert exam
        exam_data = {
            "exam_id": exam_id,
            "title": f"Ôn tập: {topic}",
            "school_name": "Nội bộ hệ thống",
            "city": "Hệ thống",
            "subject_code": subject_code,
            "subject_name": subject_name,
            "year": 2026,
            "duration_minutes": 0,
            "pdf_url": "",
            "answer_key_provided": True,
            "source_path": f"admin-review-import:{exam_id}",
            "tags": ['supplemental', 'knowledge-review', 'manual-import'],
            "is_active": True,
            "variant_code": "DEFAULT"
        }
        
        supabase.table("school_exams").upsert(exam_data).execute()
        
        # Upsert section
        section_id = f"{exam_id}-MCQ"
        section_data = {
            "section_id": section_id,
            "exam_id": exam_id,
            "part_code": "multiple_choice",
            "part_name": "Phần I. Câu trắc nghiệm nhiều phương án lựa chọn",
            "display_order": 1
        }
        supabase.table("school_exam_sections").upsert(section_data).execute()
        
        # Insert 10 questions
        for i in range(1, 11):
            question_id = f"{exam_id}-q{i}"
            
            question_data = {
                "question_id": question_id,
                "exam_id": exam_id,
                "section_id": section_id,
                "question_number": i,
                "difficulty_level": None,
                "question_type": "multiple_choice",
                "question_text": f"Câu hỏi mẫu số {i} cho chuyên đề: {topic}. Chọn đáp án đúng nhất.",
                "correct_answer": "A",
                "statement_json": [],
                "explanation": None,
                "topic": topic,
                "obsidian_source_path": None,
                "has_image": False,
                "metadata": {
                    "source_question_number": i,
                    "import_source": "manual_review_import",
                    "review_status": "reviewed",
                    "correct_answer_fallback": "A"
                }
            }
            supabase.table("school_exam_questions").upsert(question_data).execute()
            
            # Insert options
            options_data = []
            for idx, label in enumerate(['A', 'B', 'C', 'D']):
                options_data.append({
                    "option_id": f"{question_id}-option-{label.lower()}",
                    "question_id": question_id,
                    "option_label": label,
                    "option_text": f"Đáp án mẫu {label} của câu {i}",
                    "display_order": idx + 1
                })
            supabase.table("school_exam_question_options").upsert(options_data).execute()
            
        print(f"Generated 10 questions for topic: {topic}")

print("Done generating mock questions!")
