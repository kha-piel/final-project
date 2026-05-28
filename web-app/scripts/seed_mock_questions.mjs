import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from root
dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const topicsBySubject = {
  TOAN: [
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
  VAT_LY: [
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
  HOA_HOC: [
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
};

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  for (const [subjectCode, topics] of Object.entries(topicsBySubject)) {
    const subjectName = {
      TOAN: 'Toán học',
      VAT_LY: 'Vật lý',
      HOA_HOC: 'Hóa học'
    }[subjectCode];

    for (const topic of topics) {
      const examId = `supplemental-${slugify(topic)}-manual`;
      
      const examData = {
        exam_id: examId,
        title: `Ôn tập: ${topic}`,
        school_name: "Nội bộ hệ thống",
        city: "Hệ thống",
        subject_code: subjectCode,
        subject_name: subjectName,
        year: 2026,
        duration_minutes: 0,
        pdf_url: "",
        answer_key_provided: true,
        source_path: `admin-review-import:${examId}`,
        tags: ['supplemental', 'knowledge-review', 'manual-import'],
        is_active: true,
        variant_code: "DEFAULT"
      };

      await supabase.from("school_exams").upsert(examData);
      
      const sectionId = `${examId}-MCQ`;
      const sectionData = {
        section_id: sectionId,
        exam_id: examId,
        part_code: "multiple_choice",
        part_name: "Phần I. Câu trắc nghiệm nhiều phương án lựa chọn",
        display_order: 1
      };
      
      await supabase.from("school_exam_sections").upsert(sectionData);
      
      for (let i = 1; i <= 10; i++) {
        const questionId = `${examId}-q${i}`;
        const questionData = {
          question_id: questionId,
          exam_id: examId,
          section_id: sectionId,
          question_number: i,
          difficulty_level: null,
          question_type: "multiple_choice",
          question_text: `Câu hỏi mẫu số ${i} cho chuyên đề: ${topic}. Chọn đáp án đúng nhất.`,
          correct_answer: "A",
          statement_json: [],
          explanation: null,
          topic: topic,
          obsidian_source_path: null,
          has_image: false,
          metadata: {
            source_question_number: i,
            import_source: "manual_review_import",
            review_status: "reviewed",
            correct_answer_fallback: "A"
          }
        };

        await supabase.from("school_exam_questions").upsert(questionData);
        
        const optionsData = ['A', 'B', 'C', 'D'].map((label, idx) => ({
          option_id: `${questionId}-option-${label.toLowerCase()}`,
          question_id: questionId,
          option_label: label,
          option_text: `Đáp án mẫu ${label} của câu ${i}`,
          display_order: idx + 1
        }));

        await supabase.from("school_exam_question_options").upsert(optionsData);
      }
      console.log(`Generated 10 questions for topic: ${topic}`);
    }
  }
  console.log("Done generating mock questions!");
}

run().catch(console.error);
