import shutil
import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Import file buatan kita sendiri
from database import engine, get_db
import models

# 1. Inisialisasi Database (Otomatis buat tabel jika belum ada)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BKN Visitor System", version="1.0.0")

# 2. Setup CORS (Agar React nanti bisa akses API ini)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Di production, ganti '*' dengan domain website aslinya
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Setup Folder Upload (Agar foto bisa dibuka di browser)
# Pastikan folder 'uploads' sudah dibuat sebelumnya
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# --- HELPER: FUNGSI SIMPAN FILE ---
def save_upload_file(upload_file: UploadFile, destination_folder: str = "uploads"):
    if not upload_file:
        return None
    
    # Buat nama file unik: nik_namafile.jpg (untuk menghindari nama kembar)
    # Tapi demi kesederhanaan, kita pakai timestamp + nama asli
    timestamp = int(datetime.now().timestamp())
    filename = f"{timestamp}_{upload_file.filename}"
    file_path = os.path.join(destination_folder, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path


# --- ENDPOINT 1: REGISTRASI TAMU BARU (ADMIN) ---
@app.post("/visitors/")
def create_visitor(
    nik: str = Form(...),
    full_name: str = Form(...),
    institution: str = Form(...),
    phone: str = Form(None),
    photo: UploadFile = File(None),
    ktp: UploadFile = File(None),
    task_letter: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Cek apakah NIK sudah ada
    existing_visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if existing_visitor:
        raise HTTPException(status_code=400, detail="NIK sudah terdaftar!")

    # Simpan file-file (jika ada yang diupload)
    photo_path = save_upload_file(photo)
    ktp_path = save_upload_file(ktp)
    task_letter_path = save_upload_file(task_letter)

    # Simpan data ke Database
    new_visitor = models.Visitor(
        nik=nik,
        full_name=full_name,
        institution=institution,
        phone=phone,
        photo_path=photo_path,
        ktp_path=ktp_path,
        task_letter_path=task_letter_path
    )
    
    db.add(new_visitor)
    db.commit()
    db.refresh(new_visitor)
    
    return {"message": "Tamu berhasil didaftarkan", "data": new_visitor}


# --- ENDPOINT 2: LOGIN TAMU (CEK DATA) ---
@app.get("/visitors/{nik}")
def get_visitor(nik: str, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Data tamu tidak ditemukan. Silakan lapor Admin.")
    return visitor


# --- ENDPOINT 3: CHECK-IN (MASUK) ---
@app.post("/check-in/")
def check_in(nik: str = Form(...), db: Session = Depends(get_db)):
    # 1. Cek User ada atau tidak
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="NIK tidak ditemukan")

    # 2. Cek apakah dia sudah check-in tapi belum check-out hari ini?
    today = datetime.now().date()
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == today,
        models.VisitLog.check_out_time == None
    ).first()

    if active_visit:
        raise HTTPException(status_code=400, detail="Anda sudah Check-In dan belum Check-Out!")

    # 3. Catat Masuk
    new_log = models.VisitLog(visitor_nik=nik)
    db.add(new_log)
    db.commit()
    
    return {"message": f"Selamat Datang, {visitor.full_name}!", "status": "Check-In Berhasil"}


# --- ENDPOINT 4: CHECK-OUT (KELUAR) ---
@app.post("/check-out/")
def check_out(nik: str = Form(...), db: Session = Depends(get_db)):
    # Cari log hari ini yang check_out-nya masih Kosong (None)
    today = datetime.now().date()
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == today,
        models.VisitLog.check_out_time == None
    ).first()

    if not active_visit:
        raise HTTPException(status_code=400, detail="Anda belum melakukan Check-In hari ini atau sudah Check-Out.")

    # Update waktu keluar
    active_visit.check_out_time = datetime.now()
    db.commit()

    return {"message": "Hati-hati di jalan!", "status": "Check-Out Berhasil"}