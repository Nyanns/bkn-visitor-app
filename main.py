# FILE: backend/main.py (FINAL PRODUCTION VERSION)
import shutil
import os
import uuid
import pytz
import re  # Library untuk cek pola teks (Regex)
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Import file lokal
from database import engine, get_db
import models

# Inisialisasi Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BKN Visitor System", 
    description="Sistem Buku Tamu Digital Direktorat Pengelolaan Data ASN",
    version="2.0.0 (Stable)"
)

# --- 1. KONFIGURASI UTAMA ---
JAKARTA_TZ = pytz.timezone('Asia/Jakarta')
MAX_FILE_SIZE = 2 * 1024 * 1024  # Batas File: 2 MB
UPLOAD_DIR = "uploads"

# Pastikan folder upload ada
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- 2. KEAMANAN CORS ---
# Hanya izinkan frontend kita untuk mengakses backend ini
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"], # Batasi hanya boleh baca (GET) dan kirim (POST)
    allow_headers=["*"],
)

# --- 3. SCHEMAS (Struktur Response) ---
# Agar output API rapi dan konsisten
class StandardResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None

class CheckInOutResponse(BaseModel):
    status: str
    message: str
    time: str

# --- 4. FUNGSI VALIDASI ---

def validate_nik(nik: str):
    """Memastikan NIK hanya berisi angka"""
    if not nik.isdigit():
        raise HTTPException(status_code=400, detail="Format NIK salah! Harus berupa angka.")
    return nik

def validate_and_save_file(upload_file: UploadFile) -> str:
    """
    Validasi File Super Ketat:
    1. Cek Ukuran (Max 2MB)
    2. Cek Tipe (JPG/PNG Only)
    3. Rename Acak (UUID)
    """
    if not upload_file:
        raise HTTPException(status_code=400, detail="File wajib diupload!")

    # Cek Ukuran File
    # Geser kursor ke akhir file untuk tahu ukurannya
    upload_file.file.seek(0, 2)
    file_size = upload_file.file.tell()
    # Geser balik ke awal biar bisa dibaca lagi nanti
    upload_file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File terlalu besar! Maksimal 2MB. (File Anda: {file_size/1024/1024:.2f} MB)")

    # Cek Tipe File
    valid_types = ["image/jpeg", "image/png", "image/jpg"]
    if upload_file.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Format file tidak didukung. Gunakan JPG atau PNG.")

    # Simpan dengan Nama Unik
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    unique_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal menyimpan file ke server.")
        
    return file_path


# --- 5. API ENDPOINTS (Logic Utama) ---

@app.get("/", tags=["General"])
def read_root():
    return {"status": "online", "system": "BKN Visitor App v2.0", "time": datetime.now(JAKARTA_TZ)}

@app.get("/visitors/{nik}", tags=["Visitor"])
def get_visitor(nik: str, db: Session = Depends(get_db)):
    # Validasi NIK angka
    validate_nik(nik)
    
    # 1. Cari Data Visitor
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Data tamu tidak ditemukan. Silakan lapor Admin.")

    # 2. Cek Status Check-In Hari Ini (Logic Pintar)
    now_jkt = datetime.now(JAKARTA_TZ)
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()

    return {
        "nik": visitor.nik,
        "full_name": visitor.full_name,
        "institution": visitor.institution,
        "photo_path": visitor.photo_path,
        "is_checked_in": active_visit is not None # True jika sudah masuk tapi belum keluar
    }

@app.post("/visitors/", status_code=status.HTTP_201_CREATED, tags=["Admin"])
def create_visitor(
    nik: str = Form(..., min_length=3, max_length=20),
    full_name: str = Form(...),
    institution: str = Form(...),
    phone: str = Form(None),
    photo: UploadFile = File(...),      # Foto Wajah WAJIB
    ktp: UploadFile = File(None),       # Opsional
    task_letter: UploadFile = File(None), # Opsional
    db: Session = Depends(get_db)
):
    # 1. Validasi Input
    validate_nik(nik)
    
    # 2. Cek Duplikasi
    if db.query(models.Visitor).filter(models.Visitor.nik == nik).first():
        raise HTTPException(status_code=400, detail=f"NIK {nik} sudah terdaftar!")

    # 3. Proses Upload File
    photo_path = validate_and_save_file(photo)
    ktp_path = validate_and_save_file(ktp) if ktp else None
    task_letter_path = validate_and_save_file(task_letter) if task_letter else None

    # 4. Simpan ke Database
    new_visitor = models.Visitor(
        nik=nik,
        full_name=full_name.strip(), # Hapus spasi depan/belakang nama
        institution=institution.strip(),
        phone=phone,
        photo_path=photo_path,
        ktp_path=ktp_path,
        task_letter_path=task_letter_path
    )
    
    db.add(new_visitor)
    db.commit()
    db.refresh(new_visitor)
    
    return StandardResponse(
        status="success",
        message="Registrasi Tamu Berhasil",
        data={"nik": new_visitor.nik, "nama": new_visitor.full_name}
    )

@app.post("/check-in/", tags=["Attendance"])
def check_in(nik: str = Form(...), db: Session = Depends(get_db)):
    validate_nik(nik)
    
    # Cek User
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="NIK tidak ditemukan.")

    # Waktu Jakarta
    now_jkt = datetime.now(JAKARTA_TZ)
    
    # Cek Double Check-in
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()

    if active_visit:
        # Jika sudah masuk, kita return info santai (bukan error 400 keras)
        return CheckInOutResponse(
            status="info", 
            message=f"Halo {visitor.full_name}, Anda sudah tercatat masuk.",
            time=active_visit.check_in_time.strftime("%H:%M:%S")
        )

    # Catat Masuk
    new_log = models.VisitLog(
        visitor_nik=nik,
        check_in_time=now_jkt.replace(tzinfo=None), # Hapus info timezone agar DB Postgres senang
        visit_date=now_jkt.date()
    )
    db.add(new_log)
    db.commit()
    
    return CheckInOutResponse(
        status="success", 
        message=f"Selamat Datang, {visitor.full_name}!", 
        time=now_jkt.strftime("%H:%M:%S")
    )

@app.post("/check-out/", tags=["Attendance"])
def check_out(nik: str = Form(...), db: Session = Depends(get_db)):
    validate_nik(nik)
    
    now_jkt = datetime.now(JAKARTA_TZ)
    
    # Cari sesi aktif
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()

    if not active_visit:
        raise HTTPException(status_code=400, detail="Gagal Check-Out. Anda belum Check-In hari ini.")

    # Update Waktu Keluar
    active_visit.check_out_time = now_jkt.replace(tzinfo=None)
    db.commit()

    return CheckInOutResponse(
        status="success", 
        message="Terima kasih, hati-hati di jalan!",
        time=now_jkt.strftime("%H:%M:%S")
    )