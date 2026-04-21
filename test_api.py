import requests
import json

URL = "http://127.0.0.1:8000/api/explain"

payload = {
    "question_content": "Hàm số y = x^3 - 3x đạt cực tiểu tại đâu?",
    "student_answer": "x = -1",
    "correct_answer": "x = 1",
    "obsidian_source_path": "Toan_Hoc/1_Ham_So/2_cuc_tri_ham_so.md"
}

headers = {
    "Content-Type": "application/json"
}

print("=" * 60)
print("  🚀  GỬI REQUEST ĐẾN API")
print("=" * 60)
print(f"  URL    : {URL}")
print(f"  Payload:")
print(json.dumps(payload, ensure_ascii=False, indent=4))
print("=" * 60)

try:
    response = requests.post(URL, headers=headers, json=payload)

    print(f"\n  📡  STATUS CODE: {response.status_code}")
    print("-" * 60)

    if response.status_code == 200:
        data = response.json()
        explanation = data.get("explanation", "[Không tìm thấy trường 'explanation' trong response]")
        print("\n  ✅  KẾT QUẢ GIẢI THÍCH TỪ API:\n")
        print(explanation)
    else:
        print(f"\n  ❌  LỖI! Server trả về mã lỗi: {response.status_code}")
        print(f"  Chi tiết: {response.text}")

except requests.exceptions.ConnectionError:
    print("\n  ❌  LỖI KẾT NỐI: Không thể kết nối tới server.")
    print("  Hãy chắc chắn rằng FastAPI đang chạy tại http://127.0.0.1:8000")
except Exception as e:
    print(f"\n  ❌  LỖI KHÔNG XÁC ĐỊNH: {e}")

print("\n" + "=" * 60)
