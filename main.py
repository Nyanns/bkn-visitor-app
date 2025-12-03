# FILE: backend/main.py (SECURE WITH JWT)
import shutil
import os
import uuid
import pytz
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt

# Import file lokal
from database import engine, get_db
import models

# Inisialisasi Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BKN Visitor System", version="2.1.0 (Secure Auth)")

# --- 1. KONFIGURASI KEAMANAN (JWT) ---
SECRET_KEY = "RAHASIA_NEGARA_BKN_GANTI_INI_DENGAN_STRING_ACAK_PANJANG"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Login berlaku 1 jam

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # URL untuk login

# --- 2. KONFIGURASI UTAMA ---
JAKARTA_TZ = pytz.timezone('Asia/Jakarta')
MAX_FILE_SIZE = 2 * 1024 * 1024  
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- 3. CORS ---
origins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, 
    allow_methods=["GET", "POST"], allow_headers=["*"]
)

# --- 4. SCHEMAS ---
class StandardResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None

class CheckInOutResponse(BaseModel):
    status: str
    message: str
    time: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- 5. FUNGSI KEAMANAN (HELPER) ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- DEPENDENCY: PENJAGA PINTU (Cek Token) ---
async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Login kadaluarsa atau tidak valid",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if admin is None:
        raise credentials_exception
    return admin

# --- 6. FUNGSI VALIDASI LAINNYA ---
def validate_nik(nik: str):
    if not nik.isdigit():
        raise HTTPException(status_code=400, detail="Format NIK salah! Harus angka.")
    return nik

def validate_and_save_file(upload_file: UploadFile) -> str:
    # (Kode validasi file sama seperti sebelumnya, dipersingkat di sini)
    if not upload_file: raise HTTPException(status_code=400, detail="File wajib!")
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    unique_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    try:
        with open(file_path, "wb") as buffer: shutil.copyfileobj(upload_file.file, buffer)
    except: raise HTTPException(500, "Gagal simpan file")
    return file_path


# --- 7. API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "online", "system": "BKN Visitor App v2.1 Secure"}

# === LOGIN ADMIN (Baru) ===
@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Cari admin di database
    admin = db.query(models.Admin).filter(models.Admin.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Username atau Password Salah")
    
    # Buat token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": admin.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# === BUAT ADMIN PERTAMA KALI (Hanya bisa sekali jalan via docs, atau matikan nanti) ===
@app.post("/setup-admin")
def create_initial_admin(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    try:
        if db.query(models.Admin).first():
            raise HTTPException(status_code=400, detail="Admin sudah ada. Gunakan login.")
        
        hashed_password = get_password_hash(password)
        new_admin = models.Admin(username=username, password_hash=hashed_password)
        db.add(new_admin)
        db.commit()
        return {"status": "success", "message": f"Admin {username} berhasil dibuat"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR CREATING ADMIN: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


# === API YANG DILINDUNGI (Ada Gemboknya) ===

# Tambahkan `Depends(get_current_admin)` untuk mengunci endpoint ini
@app.get("/admin/logs", tags=["Admin"])
def get_admin_logs(current_admin: models.Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # (Isi sama seperti sebelumnya, cuma nambah parameter current_admin)
    results = db.query(models.VisitLog, models.Visitor)\
        .join(models.Visitor, models.VisitLog.visitor_nik == models.Visitor.nik)\
        .order_by(models.VisitLog.check_in_time.desc()).all()
    
    logs_data = []
    for log, visitor in results:
        status_visit = "Selesai" if log.check_out_time else "Sedang Berkunjung"
        photo_url = f"/uploads/{os.path.basename(visitor.photo_path)}" if visitor.photo_path else None
        logs_data.append({
            "id": log.id, "nik": visitor.nik, "full_name": visitor.full_name,
            "institution": visitor.institution, "check_in_time": log.check_in_time,
            "check_out_time": log.check_out_time, "status": status_visit, "photo_url": photo_url
        })
    return logs_data

@app.post("/visitors/", status_code=status.HTTP_201_CREATED, tags=["Admin"])
def create_visitor(
    # ... Parameter Form sama ...
    nik: str = Form(..., min_length=3, max_length=20),
    full_name: str = Form(...), institution: str = Form(...), phone: str = Form(None),
    photo: UploadFile = File(...), ktp: UploadFile = File(None), task_letter: UploadFile = File(None),
    # ... Dependency Kunci ...
    current_admin: models.Admin = Depends(get_current_admin), # <--- KUNCI PENGAMAN
    db: Session = Depends(get_db)
):
    # (Isi logika sama persis seperti main.py sebelumnya)
    validate_nik(nik)
    if db.query(models.Visitor).filter(models.Visitor.nik == nik).first():
        raise HTTPException(400, f"NIK {nik} sudah terdaftar!")

    photo_path = validate_and_save_file(photo)
    ktp_path = validate_and_save_file(ktp) if ktp else None
    task_letter_path = validate_and_save_file(task_letter) if task_letter else None

    new_visitor = models.Visitor(
        nik=nik, full_name=full_name.strip(), institution=institution.strip(),
        phone=phone, photo_path=photo_path, ktp_path=ktp_path, task_letter_path=task_letter_path
    )
    db.add(new_visitor)
    db.commit()
    return StandardResponse(status="success", message="Registrasi Tamu Berhasil")

# === API PUBLIK (Bebas Akses untuk Kiosk) ===
@app.get("/visitors/{nik}", tags=["Visitor"])
def get_visitor(nik: str, db: Session = Depends(get_db)):
    # (Kode sama, tidak perlu digembok karena untuk User)
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor: raise HTTPException(404, "Data tidak ditemukan")
    now_jkt = datetime.now(JAKARTA_TZ)
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik, models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()
    return {"nik": visitor.nik, "full_name": visitor.full_name, "institution": visitor.institution,
            "photo_path": visitor.photo_path, "is_checked_in": active_visit is not None}

@app.post("/check-in/", tags=["Attendance"])
def check_in(nik: str = Form(...), db: Session = Depends(get_db)):
    # (Kode sama, ini API publik)
    validate_nik(nik)
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor: raise HTTPException(404, "NIK tidak ditemukan.")
    now_jkt = datetime.now(JAKARTA_TZ)
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik, models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()
    if active_visit: return CheckInOutResponse(status="info", message="Sudah masuk.", time=str(now_jkt))
    
    new_log = models.VisitLog(visitor_nik=nik, check_in_time=now_jkt.replace(tzinfo=None), visit_date=now_jkt.date())
    db.add(new_log); db.commit()
    return CheckInOutResponse(status="success", message=f"Selamat Datang {visitor.full_name}!", time=now_jkt.strftime("%H:%M:%S"))

@app.post("/check-out/", tags=["Attendance"])
def check_out(nik: str = Form(...), db: Session = Depends(get_db)):
    # (Kode sama, API publik)
    now_jkt = datetime.now(JAKARTA_TZ)
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik, models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()
    if not active_visit: raise HTTPException(400, "Belum Check-In.")
    active_visit.check_out_time = now_jkt.replace(tzinfo=None)
    db.commit()
    return CheckInOutResponse(status="success", message="Hati-hati di jalan!", time=now_jkt.strftime("%H:%M:%S"))