# [YEU CAU VIET SCRIPT TRICH XUAT DE THI TU PDF SANG MARKDOWN BANG GEMINI API]

Chao AI, toi can xay dung mot Data Pipeline de trich xuat ngan hang cau hoi tu cac file PDF de thi that/thi thu sang dinh dang Markdown (`.md`) chuan de nap vao he thong RAG va hien thi len Web React.

## 1. YEU CAU CONG CU

Viet mot script bang Python (ten file: `pdf_to_md_extractor.py`).

Su dung thu vien `google-generativeai` (Gemini API) ban moi nhat (Gemini 1.5 Flash hoac Pro) vi no ho tro doc file PDF rat tot.

Su dung `dotenv` de load `GEMINI_API_KEY`.

## 2. LUONG HOAT DONG

Script se quet mot thu muc dau vao (VD: `./raw_pdfs/Toan/`).

Voi moi file PDF, script se upload len Gemini qua API.

Prompt he thong gui cho Gemini:

`Ban la chuyen gia trich xuat du lieu. Hay doc file de thi PDF nay va trich xuat tat ca cac cau hoi ra dinh dang Markdown. Yeu cau BAT BUOC: 1) Moi cong thuc toan hoc, vat ly, hoa hoc phai duoc format chuan LaTeX (boc bang $). 2) Phan loai cau truc: Moi cau hoi phai ro rang cac phuong an A, B, C, D (neu la trac nghiem), hoac phan dinh dang Dung/Sai, Tra loi ngan. 3) Co gang nhan dien Muc do (Thong hieu, Van dung, v.v.) dua vao do kho cua cau neu co the.`

Ket qua tra ve tu API se duoc luu thanh cac file `.md` trong thu muc dau ra (VD: `./obsidian_vault/Toan/`).

## 3. HANH DONG CUA BAN

Viet ma nguon Python day du, bao gom xu ly loi `try-catch`, delay de tranh rate limit cua API.

Huong dan toi cach cai dat thu vien (`pip install ...`) va cach lay Gemini API Key mien phi tu Google AI Studio neu can.
