import os
import sys

try:
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError:
    print("Cần cài đặt thư viện: pip install supabase python-dotenv")
    sys.exit(1)

# Load env từ nhiều vị trí
for env_path in [".env", "web-app/.env", "web-app/.env.local"]:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def delete_review_questions(subject_codes):
    print(f"Bắt đầu xóa câu hỏi ôn tập cho các môn: {subject_codes}")
    
    # 1. Lấy danh sách exam_id cần xóa
    exams = []
    for code in subject_codes:
        response = supabase.table('school_exams').select('exam_id').eq('subject_code', code).like('exam_id', 'supplemental-%-manual').execute()
        if response.data:
            exams.extend([row['exam_id'] for row in response.data])
            
    if not exams:
        print("Không tìm thấy chuyên đề ôn tập nào cần xóa.")
        return
        
    print(f"Tìm thấy {len(exams)} chuyên đề ôn tập. Đang xóa dữ liệu...")
    
    # 2. Xóa từng exam
    for exam_id in exams:
        # Lấy question_id để xóa options và assets
        q_resp = supabase.table('school_exam_questions').select('question_id').eq('exam_id', exam_id).execute()
        if q_resp.data:
            q_ids = [row['question_id'] for row in q_resp.data]
            print(f"  - Exam {exam_id}: Có {len(q_ids)} câu hỏi.")
            
            # Xóa options và assets
            for q_id in q_ids:
                supabase.table('school_exam_question_options').delete().eq('question_id', q_id).execute()
                supabase.table('school_exam_question_assets').delete().eq('question_id', q_id).execute()
                
        # Xóa câu hỏi
        supabase.table('school_exam_questions').delete().eq('exam_id', exam_id).execute()
        
        # Xóa exam
        supabase.table('school_exams').delete().eq('exam_id', exam_id).execute()
        print(f"  ✅ Đã xóa hoàn toàn {exam_id}")

    print("Hoàn tất.")

if __name__ == "__main__":
    delete_review_questions(['VAT_LY', 'HOA_HOC'])
