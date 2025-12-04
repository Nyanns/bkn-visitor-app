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
3. Buat file `.env` (jika belum ada) dan isi konfigurasi:
   ```env
   SECRET_KEY=isi_dengan_string_acak_yang_panjang_dan_rahasia
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
- Jangan lupa untuk **menghapus** atau mengubah `ALLOW_SETUP_ADMIN=false` di `.env` setelah Anda berhasil membuat akun admin pertama kali.
- Pastikan file `.env` tidak ikut ter-upload ke repository publik (sudah di-ignore di `.gitignore`).
