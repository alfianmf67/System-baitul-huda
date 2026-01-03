# Panduan Deployment Website (Full Stack)

Panduan ini menjelaskan tahapan deploy aplikasi Face Recognition (FastAPI + React) ke Server VPS (Ubuntu 20.04/22.04).

## 1. Persiapan Server (VPS)
Pastikan Anda memiliki:
-   VPS dengan OS Ubuntu (disarankan minimal 2GB RAM untuk MobileFaceNet).
-   Akses SSH ke server (`ssh root@ip_address`).
-   Domain yang sudah diarahkan ke IP VPS (opsional, tapi disarankan).

## 2. Setup Lingkungan Server

Update paket sistem dan install dependencies dasar:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git -y
```

---

## 3. Deployment Backend (FastAPI)

### a. Clone Repository
```bash
cd /var/www
git clone <URL_GITHUB_ANDA> majelis-app
cd majelis-app/backend
```

### b. Setup Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn uvicorn
```

### c. Setup .env
Buat file `.env` produksi:
```bash
nano .env
```
Isi dengan konfigurasi database atau secret key yang sesuai.

### d. Setup Systemd (Service)
Agar backend berjalan otomatis di background.
```bash
sudo nano /etc/systemd/system/majelis-backend.service
```

Isi file:
```ini
[Unit]
Description=Gunicorn instance to serve FastAPI
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/var/www/majelis-app/backend
Environment="PATH=/var/www/majelis-app/backend/venv/bin"
ExecStart=/var/www/majelis-app/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2

[Install]
WantedBy=multi-user.target
```

Jalankan service:
```bash
sudo systemctl start majelis-backend
sudo systemctl enable majelis-backend
sudo systemctl status majelis-backend
```

---

## 4. Deployment Frontend (React + Vite)

### a. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### b. Build Project
```bash
cd /var/www/majelis-app/frontend
npm install
npm run build
```
Hasil build akan ada di folder `dist`.

---

## 5. Konfigurasi Nginx (Reverse Proxy)

Nginx akan berfungsi untuk:
1.  Menyajikan file statis Frontend (dari folder `dist`).
2.  Meneruskan request `/api` ke Backend (port 8000).

Buat konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/majelis
```

Isi konfigurasi:
```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com; # Ganti dengan IP jika tidak ada domain

    # Frontend (React)
    location / {
        root /var/www/majelis-app/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (FastAPI)
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/majelis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Setup HTTPS (SSL) - Opsional
Jika menggunakan domain, gunakan Certbot untuk HTTPS gratis.

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domain-anda.com
```

## 7. Troubleshooting
-   **Cek Log Backend**: `journalctl -u majelis-backend -f`
-   **Cek Log Nginx**: `tail -f /var/log/nginx/error.log`
-   **Restart Service**: `sudo systemctl restart majelis-backend`

Selesai! Website Anda sekarang dapat diakses melalui browser.
