# BKN Visitor App

Aplikasi Buku Tamu Digital untuk Direktorat Pengelolaan Data ASN - BKN. Aplikasi ini mencatat kunjungan tamu, menyediakan dashboard admin untuk monitoring, dan fitur check-in/check-out mandiri.

## Fitur Utama

- **Visitor Kiosk**: Halaman depan untuk tamu melakukan Check-In dan Check-Out mandiri menggunakan NIK.
- **Admin Dashboard**: Panel admin yang dilindungi password untuk memantau log kunjungan secara real-time.
- **Registrasi Tamu**: Admin dapat mendaftarkan tamu baru beserta foto wajah.
- **Keamanan**: Autentikasi Admin menggunakan JWT (JSON Web Token) dan password hashing yang aman.

## Teknologi

- **Backend**: Python (FastAPI), SQLAlchemy, SQLite
- **Frontend**: React (Vite), Chakra UI
- **Database**: SQLite (default)

## Cara Menjalankan Aplikasi

### 1. Persiapan Backend

Pastikan Python 3.10+ sudah terinstall.

```bash
cd backend
# Buat virtual environment (opsional tapi disarankan)
python -m venv venv
# Aktifkan venv (Windows)
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
```

### 2. Menjalankan Backend

```bash
cd backend
python -m uvicorn main:app --reload
```
Server akan berjalan di `http://127.0.0.1:8000`.

### 3. Setup Admin Pertama Kali

Untuk keamanan, Anda perlu membuat akun admin pertama kali melalui API (karena belum ada UI register admin).

Gunakan **Postman** atau **Curl** untuk menembak endpoint berikut:

**POST** `http://127.0.0.1:8000/setup-admin`

**Body (x-www-form-urlencoded):**
- `username`: (username pilihan Anda, misal: `admin`)
- `password`: (password pilihan Anda)

Atau gunakan perintah Curl di terminal:
```bash
curl -X POST "http://127.0.0.1:8000/setup-admin" -H "Content-Type: application/x-www-form-urlencoded" -d "username=admin&password=rahasia"
```

> **Catatan**: Endpoint ini hanya bisa digunakan jika belum ada admin sama sekali di database.

### 4. Menjalankan Frontend

Pastikan Node.js sudah terinstall.

```bash
cd frontend
npm install
npm run dev
```
Aplikasi frontend akan berjalan di `http://localhost:5173`.

## Struktur Folder

- `/backend`: Kode sumber API server (FastAPI)
  - `main.py`: Entry point aplikasi
  - `models.py`: Definisi tabel database
  - `database.py`: Koneksi database
  - `uploads/`: Folder penyimpanan foto tamu
- `/frontend`: Kode sumber antarmuka pengguna (React)
  - `src/pages`: Halaman-halaman aplikasi (Login, Dashboard, Admin)
  - `src/components`: Komponen UI yang dapat digunakan kembali

## Lisensi

Badan Kepegawaian Negara © 2025
