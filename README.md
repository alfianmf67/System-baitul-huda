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
.....................................
