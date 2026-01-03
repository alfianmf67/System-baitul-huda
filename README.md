# Sistem Absensi Majelis Taklim Baitul Huda

Sistem absensi otomatis menggunakan Face Recognition (MobileFaceNet & MTCNN) dengan Frontend React + Vite dan Backend FastAPI.

## Struktur Project
- `/backend`: API Server (FastAPI) & AI Logic
- `/frontend`: User Interface (React)

## Cara Jalankan Aplikasi

### 1. Backend
```bash
cd backend
# Buat virtual environment (opsional tapi disarankan)
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Buat file `.env` di dalam folder `backend` jika diperlukan konfigurasi khusus.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Panduan Upload ke GitHub (LENGKAP & AMAN)

Ikuti langkah-langkah ini untuk meng-upload project ke GitHub dengan aman (database dan password tidak akan ikut ter-upload).

### 1. Persiapan Keamanan (PENTING)
Project ini sudah memiliki file `.gitignore` di folder `root`, `backend`, dan `frontend` yang berfungsi memblokir file sensitif.
**JANGAN PERNAH MENGHAPUS** file `.gitignore` atau baris berikut di dalamnya:
- `.env` (Berisi password/konfigurasi rahasia)
- `*.db` / `majelis.db` (Database asli)
- `node_modules` & `venv` (Library dependency yang berat)

### 2. Inisialisasi Git
Buka terminal di folder utama `majelis-talim-baitul-huda`, lalu jalankan:

```bash
# 1. Inisialisasi Git
git init

# 2. Cek status file yang akan di-upload
git status
```
*Pastikan di daftar "new file" TIDAK ADA file `.env` atau `majelis.db`.*

### 3. Commit Perubahan
Simpan perubahan Anda ke dalam history Git lokal:

```bash
# Tambahkan semua file
git add .

# Simpan dengan pesan
git commit -m "Upload Initial Project Majelis Talim"
```

### 4. Hubungkan ke GitHub
1.  Buka [github.com/new](https://github.com/new).
2.  Beri nama repository (misal: `sistem-absensi-majelis`).
3.  **JANGAN** centang "Add a README file" atau "Add .gitignore". Biarkan *default*.
4.  Klik **Create repository**.
5.  Salin URL repository (yang berakhiran `.git`).
6.  Kembali ke terminal VS Code, jalankan perintah berikut (ganti `<URL_REPO>` dengan link Anda):

```bash
# Ganti nama branch utama ke 'main'
git branch -M main

# Sambungkan ke GitHub
git remote add origin <URL_REPOSITORY_ANDA>

# Upload kode
git push -u origin main
```

### 5. Cara Update Project di Masa Depan
Jika Anda melakukan perubahan kode di kemudian hari (misal: edit fitur), lakukan ini untuk update di GitHub:

```bash
git add .
git commit -m "Update fitur X"
git push
```

### ⚠️ Troubleshooting
Jika tidak sengaja file `.env` ikut ter-upload:
1.  Tambahkan `.env` ke `.gitignore`.
2.  Jalankan perintah ini untuk menghapus dari Git (file asli TETAP ADA):
    ```bash
    git rm -r --cached .
    git add .
    git commit -m "Fix: Remove sensitive files"
    git push
    ```

