# THPT Van Lang - Ha Noi

Thu muc nay chua asset crop cho mot bo de cu the.

## Quy uoc dung trong thu muc nay

- `TN_CauXX.png`: anh toan bo cau trac nghiem.
- `TN_CauXX_hinh*.png`: anh hinh phu duoc tach rieng tu cau do.
- Neu sau nay co phan Dung/Sai hoac Tra loi ngan co hinh, giu cung quy uoc:
  - `DS_CauXX.png`
  - `DS_CauXX_hinh1.png`
  - `TLN_CauXX.png`

## Nguyen tac ingest

- File anh toan cau la nguon uu tien de OCR / parse.
- File `*_hinh*.png` la asset phu tro cho web va AI.
- Sau khi cào du lieu, text cau hoi va dap an khong luu trong thu muc nay.
- Du lieu co cau truc se duoc dua vao DB va/hoac file JSON parsed rieng.

## File di kem

- `manifest.json`: metadata nhanh cho asset.
- `questions.template.json`: khung de dien text cau hoi, dap an va lien ket asset.
