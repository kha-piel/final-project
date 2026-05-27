import json
import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(override=True)
client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

pdf_path = 'c:/Users/ADMIIN/VScode/final-project/data_scraper/input/school_exams/chuyen-le-khiet-quang-2025.pdf'
f = client.files.upload(file=pdf_path, config={'mime_type': 'application/pdf'})

while f.state.name == 'PROCESSING':
    time.sleep(2)
    f = client.files.get(name=f.name)

prompt = """
Ban la AI trich xuat de thi THPT tu PDF cho he thong giao vien.
Nguon PDF: chuyen-le-khiet-quang-2025.pdf
Mon: TOAN - Toán học

NHIEM VU:
- Doc PDF va trich xuat day du cac cau hoi.
- Ho tro 3 loai cau: multiple_choice, true_false, short_answer.

QUY TAC BAT BUOC:
1. Chi tra ve DUY NHAT JSON hop le, khong markdown.

DINH DANG JSON:
{
  "warnings": ["string"],
  "questions": [
    {
      "questionNumber": 1,
      "questionType": "multiple_choice",
      "questionText": "string",
      "options": [
        {"label": "A", "text": "string"}
      ],
      "correctAnswer": "A"
    }
  ]
}

Day la file PDF ban goc dang anh/scan. Hay tu dong nhan dien chu trong hinh (OCR) va boc tach thanh cac cau hoi dang text, bo qua hinh anh do thi (tuong tu nhu quet text). Tuyet doi khong giai thich gi them, chi tra ve JSON hop le.
"""

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[f, prompt],
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            temperature=0,
        ),
    )
    text = getattr(response, 'text', '')
    with open('test_output.json', 'w', encoding='utf-8') as out:
        out.write(text)
    print('Output written to test_output.json')
except Exception as e:
    print('Error:', e)
finally:
    client.files.delete(name=f.name)
