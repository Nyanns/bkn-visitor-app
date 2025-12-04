# Dokumentasi Sementara

## Update Terakhir (Security & Bug Fixes)

Berikut adalah perubahan penting yang telah dilakukan untuk meningkatkan keamanan dan stabilitas aplikasi:

### 1. Perbaikan Bug (Bug Fixes)
- **Admin Setup Error (500 -> 400):** Memperbaiki logika pada endpoint `/setup-admin`. Sebelumnya, jika admin sudah ada, sistem mengembalikan error 500. Sekarang sistem mengembalikan error 400 (Bad Request) dengan pesan yang jelas: "Admin sudah ada. Gunakan login."
- **Password Hashing:** Mengganti library `passlib` dengan `bcrypt` secara langsung untuk mengatasi masalah kompatibilitas versi yang menyebabkan error "password cannot be longer than 72 bytes".

### 2. Peningkatan Keamanan (Security Hardening)
- **Environment Variables:** `SECRET_KEY` tidak lagi hardcoded di dalam `main.py`. Sekarang kunci rahasia diambil dari file `.env`.
- **Proteksi Setup Admin:** Endpoint `/setup-admin` **dinonaktifkan secara default** untuk mencegah pembuatan admin tanpa izin di production.
    - Untuk mengaktifkan fitur ini (misalnya saat pertama kali deploy), Anda harus menambahkan baris berikut di file `backend/.env`:
      ```
      ALLOW_SETUP_ADMIN=true
      ```
- **Rate Limiting (Brute-Force Protection):** Login endpoint (`/token`) dibatasi maksimal **5 percobaan per menit** untuk mencegah serangan brute-force.
- **File Upload Validation:** Validasi file upload sekarang menggunakan **magic bytes** (bukan hanya ekstensi) untuk mencegah upload file berbahaya yang disamarkan.

## Cara Menjalankan Aplikasi

### Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Pastikan virtual environment aktif dan dependencies terinstall:
   ```bash
   pip install -r requirements.txt
   ```
   
   **Dependencies Baru (Security Phase 2):**
   - `slowapi` - Rate limiting untuk API endpoints
   - `python-magic-bin` - Validasi file berdasarkan konten (magic bytes)
3. Buat file `.env` (jika belum ada) dan isi konfigurasi:
   ```env
   SECRET_KEY=isi_dengan_string_acak_yang_panjang_dan_rahasia
   DATABASE_URL=postgresql://postgres:passwordmu@localhost:5432/postgres
   ALLOW_SETUP_ADMIN=true  # Hapus atau set false setelah admin dibuat
   ```
4. Jalankan server:
   ```bash
   python -m uvicorn main:app --reload
   ```

### Frontend
1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies (jika belum):
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```

## Catatan Penting
- Pastikan file `.env` tidak ikut ter-upload ke repository publik (sudah di-ignore di `.gitignore`).

### 3. Fitur Tambahan (Baru)

#### a. Logging System
Aplikasi sekarang mencatat aktivitas penting di folder `backend/logs/app.log`.
- **Loguru** digunakan untuk pencatatan log yang lebih rapi.
- Log mencakup: Login sukses/gagal, Check-in/out, Upload file, dan Error.
- Log akan di-rotasi otomatis setiap 500MB atau 7 hari.

#### b. Database Backup
Script backup otomatis tersedia di `backend/backup_database.py`.
- Menjalankan backup:
  ```bash
  python backup_database.py
  ```
- File backup disimpan di `backend/backups/` dengan timestamp.
- Script otomatis menghapus backup yang lebih lama dari 7 hari.
- **Rekomendasi:** Setup cron job / Task Scheduler untuk menjalankan script ini setiap malam.

#### c. Export to Excel
Admin dapat mendownload laporan kunjungan dalam format Excel.
- Akses via Dashboard Admin -> Klik tombol **"Export Excel"**.
- File berisi: NIK, Nama, Instansi, Waktu Masuk, Waktu Keluar, dan Status.
