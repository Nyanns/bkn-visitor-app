import shutil
import os
import uuid  # Library untuk bikin nama file acak & unik
from datetime import datetime
from typing import List

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

# Import file lokal
from database import engine, get_db
import models

# Tambahkan import ini di paling atas main.py
import pytz

# Buat konstanta timezone
JAKARTA_TZ = pytz.timezone('Asia/Jakarta')

# Inisialisasi Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BKN Visitor System", version="1.1.0 (Secure)")

# --- TAMBAHAN: ENDPOINT HALAMAN UTAMA ---
@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Server BKN Visitor App Berjalan Normal!",
        "docs": "Buka /docs untuk dokumentasi API"
    }

# --- KEAMANAN 1: CORS (Membatasi Siapa yang Boleh Akses) ---
# Di Production nanti, ubah allow_origins=["*"] menjadi domain asli, misal ["https://bkn.go.id"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Folder Upload
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# --- KEAMANAN 2: VALIDASI FILE (Mencegah Virus) ---
# Hanya izinkan file gambar
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}

def validate_and_save_file(upload_file: UploadFile, destination_folder: str) -> str:
    """
    Fungsi ini mengecek tipe file dan menyimpannya dengan nama acak
    agar hacker tidak bisa menimpa file sistem.
    """
    if not upload_file:
        return None
    
    # 1. Cek Content-Type (Header file)
    if upload_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipe file {upload_file.filename} tidak valid! Hanya boleh JPG/PNG."
        )

    # 2. Cek Ekstensi File
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Ekstensi file {upload_file.filename} harus .jpg atau .png"
        )
    
    # 3. Rename File (PENTING: Gunakan UUID agar nama file tidak bisa ditebak)
    # Contoh hasil: a1b2-c3d4-e5f6.jpg
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(destination_folder, unique_filename)
    
    # 4. Simpan File
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Gagal menyimpan file ke server.")
        
    return file_path


# --- API ENDPOINTS ---

@app.post("/visitors/", status_code=status.HTTP_201_CREATED)
def create_visitor(
    nik: str = Form(..., min_length=3, max_length=20), # Validasi panjang NIK
    full_name: str = Form(...),
    institution: str = Form(...),
    phone: str = Form(None),
    photo: UploadFile = File(...),      # Foto Wajah WAJIB ada
    ktp: UploadFile = File(None),
    task_letter: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # OPTIMASI: Cek NIK dulu sebelum proses upload file (biar hemat resource server)
    existing_visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if existing_visitor:
        raise HTTPException(status_code=400, detail="NIK ini sudah terdaftar sebelumnya.")

    # Proses Upload dengan Validasi Keamanan
    photo_path = validate_and_save_file(photo, UPLOAD_DIR)
    ktp_path = validate_and_save_file(ktp, UPLOAD_DIR)
    task_letter_path = validate_and_save_file(task_letter, UPLOAD_DIR)

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
    
    return {"status": "success", "message": "Data tamu berhasil diamankan dan disimpan.", "data_nik": new_visitor.nik}


@app.get("/visitors/{nik}")
def get_visitor(nik: str, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Data tamu tidak ditemukan.")
    return visitor

# --- UPDATE DI FUNGSI CHECK-IN ---
@app.post("/check-in/")
def check_in(nik: str = Form(...), db: Session = Depends(get_db)):
    # ... (kode validasi user tetap sama) ...

    # GANTI: today = datetime.now().date()
    now_jkt = datetime.now(JAKARTA_TZ) # Ambil waktu Jakarta sekarang
    today = now_jkt.date()

    active_visit = db.query(models.VisitLog.id).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == today,
        models.VisitLog.check_out_time == None
    ).first()

    if active_visit:
        raise HTTPException(status_code=400, detail="Anda tercatat masih di dalam gedung.")

    # GANTI: new_log = models.VisitLog(visitor_nik=nik) 
    # Kita harus isi waktunya manual biar masuknya waktu Jakarta, bukan waktu Server default
    new_log = models.VisitLog(
        visitor_nik=nik,
        check_in_time=now_jkt,  # Pakai waktu Jakarta
        visit_date=today
    )
    
    db.add(new_log)
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Selamat Datang, {visitor.full_name}", 
        "time": now_jkt.strftime("%H:%M:%S") # Kirim format jam yang cantik ke frontend
    }

# --- UPDATE DI FUNGSI CHECK-OUT ---
@app.post("/check-out/")
def check_out(nik: str = Form(...), db: Session = Depends(get_db)):
    # GANTI: today = datetime.now().date()
    now_jkt = datetime.now(JAKARTA_TZ)
    today = now_jkt.date()
    
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik,
        models.VisitLog.visit_date == today,
        models.VisitLog.check_out_time == None
    ).first()

    if not active_visit:
        raise HTTPException(status_code=400, detail="Gagal Check-Out. Belum Check-In atau sudah keluar.")

    # GANTI: active_visit.check_out_time = datetime.now()
    active_visit.check_out_time = now_jkt # Pakai waktu Jakarta
    db.commit()

    return {"status": "success", "message": "Terima kasih, hati-hati di jalan!"}