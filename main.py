# FILE: backend/main.py (SECURE WITH JWT + LOGGING)
import shutil
import os
import uuid
import pytz
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, status, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import magic
from loguru import logger
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill

# Setup Logging
os.makedirs("logs", exist_ok=True)
logger.add(
    "logs/app.log",
    rotation="500 MB",
    retention="7 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    level="INFO"
)

# Load Environment Variables
load_dotenv()

# Import file lokal
from database import engine, get_db
import models

# Inisialisasi Database
models.Base.metadata.create_all(bind=engine)

# --- 1. KONFIGURASI KEAMANAN (JWT) ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Error kalau lupa bikin .env
    raise ValueError("FATAL: SECRET_KEY belum disetting di file .env!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- 2. KONFIGURASI UTAMA ---
JAKARTA_TZ = pytz.timezone('Asia/Jakarta')
MAX_FILE_SIZE = 2 * 1024 * 1024  
UPLOAD_DIR = "uploads"
BACKUP_DIR = "backups"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

# Setup Limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI with API Documentation
app = FastAPI(
    title="BKN Visitor System",
    version="1.0.0",
    description="Sistem Manajemen Tamu BKN - Direktorat INTIKAMI",
    docs_url="/api/docs",      # Swagger UI
    redoc_url="/api/redoc",    # ReDoc (alternative docs)
    openapi_url="/api/openapi.json"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# SECURITY: Public access removed - use protected endpoint instead
# app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- 3. CORS ---
# Load allowed origins from environment variable (comma-separated)
# Default to localhost for development
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
).split(",")

app.add_middleware(
    CORSMiddleware, 
    allow_origins=ALLOWED_ORIGINS, 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
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
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_password_hash(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

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
    if not upload_file: 
        raise HTTPException(status_code=400, detail="File wajib!")
    
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
    if file_ext not in ALLOWED_EXTENSIONS:
        logger.error(f"File upload rejected: invalid extension {file_ext}")
        raise HTTPException(status_code=400, detail=f"Ekstensi file tidak diizinkan: {file_ext}")

    try:
        header = upload_file.file.read(2048)
        upload_file.file.seek(0)
        mime_type = magic.from_buffer(header, mime=True)
        
        ALLOWED_MIMES = {"image/jpeg", "image/png", "application/pdf"}
        if mime_type not in ALLOWED_MIMES:
            logger.error(f"File upload rejected: invalid MIME type {mime_type}")
            raise HTTPException(status_code=400, detail=f"Tipe file tidak valid (terdeteksi: {mime_type})")
             
    except Exception as e:
        logger.error(f"Error validating file: {e}")
        raise HTTPException(status_code=400, detail="Gagal memvalidasi file.")

    unique_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    try:
        with open(file_path, "wb") as buffer: 
            shutil.copyfileobj(upload_file.file, buffer)
        logger.info(f"File uploaded successfully: {unique_name}")
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(500, "Gagal simpan file")
    return file_path


# --- 7. API ENDPOINTS ---

@app.get("/", tags=["System"])
def read_root():
    """Root endpoint - API Status"""
    return {"status": "online", "system": "BKN Visitor App v1.0.0", "docs": "/api/docs"}

# === MONITORING ENDPOINTS ===
@app.get("/health", tags=["Monitoring"])
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for monitoring tools (e.g., Docker, Kubernetes)
    Returns HTTP 200 if system is healthy, 503 otherwise
    """
    try:
        # Check database connectivity
        db.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(JAKARTA_TZ).isoformat(),
            "checks": {
                "database": "ok",
                "api": "ok"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503, 
            detail={"status": "unhealthy", "error": "Database connection failed"}
        )

@app.get("/metrics", tags=["Monitoring"])
def get_metrics(db: Session = Depends(get_db)):
    """
    Basic metrics endpoint for monitoring
    Returns counts of visitors, visits, and active sessions
    """
    try:
        total_visitors = db.query(models.Visitor).count()
        total_visits = db.query(models.VisitLog).count()
        
        # Active visits today
        today = datetime.now(JAKARTA_TZ).date()
        active_visits = db.query(models.VisitLog).filter(
            models.VisitLog.visit_date == today,
            models.VisitLog.check_out_time == None
        ).count()
        
        return {
            "timestamp": datetime.now(JAKARTA_TZ).isoformat(),
            "metrics": {
                "total_visitors": total_visitors,
                "total_visits": total_visits,
                "active_visits_today": active_visits
            }
        }
    except Exception as e:
        logger.error(f"Metrics collection failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to collect metrics")

# === LOGIN ADMIN ===
@app.post("/token", response_model=Token)
@limiter.limit("5/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    client_ip = request.client.host
    admin = db.query(models.Admin).filter(models.Admin.username == form_data.username).first()
    
    if not admin or not verify_password(form_data.password, admin.password_hash):
        logger.warning(f"Failed login attempt for user '{form_data.username}' from {client_ip}")
        raise HTTPException(status_code=400, detail="Username atau Password Salah")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": admin.username}, expires_delta=access_token_expires)
    logger.info(f"Successful login: {admin.username} from {client_ip}")
    return {"access_token": access_token, "token_type": "bearer"}

# === SETUP ADMIN ===
@app.post("/setup-admin")
def create_initial_admin(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    if os.getenv("ALLOW_SETUP_ADMIN") != "true":
        logger.warning("Attempt to access /setup-admin with feature disabled")
        raise HTTPException(status_code=403, detail="Fitur setup admin dinonaktifkan.")

    if db.query(models.Admin).first():
        raise HTTPException(status_code=400, detail="Admin sudah ada. Gunakan login.")

    try:
        hashed_password = get_password_hash(password)
        new_admin = models.Admin(username=username, password_hash=hashed_password)
        db.add(new_admin)
        db.commit()
        logger.info(f"New admin created: {username}")
        return {"status": "success", "message": f"Admin {username} berhasil dibuat"}
    except Exception as e:
        logger.error(f"Error creating admin: {e}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan server. Silakan coba lagi.")

# === HELPER: CLEANUP EXCEL FILES ===
def cleanup_excel_file(filepath: str):
    """
    Background task to delete Excel file after download.
    Prevents disk space accumulation from exported files.
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Cleaned up Excel file: {filepath}")
    except Exception as e:
        logger.error(f"Error cleaning up Excel file {filepath}: {e}")

# === EXPORT TO EXCEL ===
@app.get("/admin/export-excel", tags=["Admin"])
def export_to_excel(background_tasks: BackgroundTasks, current_admin: models.Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    try:
        results = db.query(models.VisitLog, models.Visitor)\
            .join(models.Visitor, models.VisitLog.visitor_nik == models.Visitor.nik)\
            .order_by(models.VisitLog.check_in_time.desc()).all()
        
        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Data Tamu"
        
        # Header styling
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF")
        
        # Headers
        headers = ["No", "NIK", "Nama Lengkap", "Instansi", "Check-in", "Check-out", "Status"]
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")
        
        # Data rows with timezone conversion
        jakarta_tz = pytz.timezone('Asia/Jakarta')
        
        for idx, (log, visitor) in enumerate(results, 2):
            ws.cell(row=idx, column=1, value=idx-1)
            ws.cell(row=idx, column=2, value=visitor.nik)
            ws.cell(row=idx, column=3, value=visitor.full_name)
            ws.cell(row=idx, column=4, value=visitor.institution)
            
            # Convert UTC to Jakarta timezone for display
            if log.check_in_time:
                check_in_utc = log.check_in_time.replace(tzinfo=pytz.UTC)
                check_in_jkt = check_in_utc.astimezone(jakarta_tz)
                ws.cell(row=idx, column=5, value=check_in_jkt.strftime("%Y-%m-%d %H:%M"))
            else:
                ws.cell(row=idx, column=5, value="-")
                
            if log.check_out_time:
                check_out_utc = log.check_out_time.replace(tzinfo=pytz.UTC)
                check_out_jkt = check_out_utc.astimezone(jakarta_tz)
                ws.cell(row=idx, column=6, value=check_out_jkt.strftime("%Y-%m-%d %H:%M"))
            else:
                ws.cell(row=idx, column=6, value="-")
                
            ws.cell(row=idx, column=7, value="Sedang Berkunjung" if not log.check_out_time else "Selesai")
        
        # Adjust column widths
        ws.column_dimensions['A'].width = 5
        ws.column_dimensions['B'].width = 18
        ws.column_dimensions['C'].width = 25
        ws.column_dimensions['D'].width = 30
        ws.column_dimensions['E'].width = 18
        ws.column_dimensions['F'].width = 18
        ws.column_dimensions['G'].width = 18
        
        # Save file
        filename = f"Laporan_Tamu_{datetime.now().strftime('%Y-%m-%d')}.xlsx"
        filepath = os.path.join(BACKUP_DIR, filename)
        wb.save(filepath)
        
        logger.info(f"Excel exported by {current_admin.username}: {filename}")
        
        # Add background task to cleanup file after download
        background_tasks.add_task(cleanup_excel_file, filepath)
        
        return FileResponse(
            filepath, 
            filename=filename, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    
    except Exception as e:
        logger.error(f"Error exporting Excel: {e}")
        raise HTTPException(status_code=500, detail="Gagal export Excel")


# === PROTECTED ENDPOINTS ===
@app.get("/admin/logs", tags=["Admin"])
def get_admin_logs(current_admin: models.Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    results = db.query(models.VisitLog, models.Visitor)\
        .join(models.Visitor, models.VisitLog.visitor_nik == models.Visitor.nik)\
        .order_by(models.VisitLog.check_in_time.desc()).all()
    
    logs_data = []
    jakarta_tz = pytz.timezone('Asia/Jakarta')
    
    for log, visitor in results:
        status_visit = "Selesai" if log.check_out_time else "Sedang Berkunjung"
        photo_url = f"/uploads/{os.path.basename(visitor.photo_path)}" if visitor.photo_path else None
        
        # Convert UTC (stored as naive datetime) to Jakarta timezone
        if log.check_in_time:
            check_in_utc = log.check_in_time.replace(tzinfo=pytz.UTC)
            check_in_jkt = check_in_utc.astimezone(jakarta_tz)
        else:
            check_in_jkt = None
            
        if log.check_out_time:
            check_out_utc = log.check_out_time.replace(tzinfo=pytz.UTC)
            check_out_jkt = check_out_utc.astimezone(jakarta_tz)
        else:
            check_out_jkt = None
        
        logs_data.append({
            "id": log.id, 
            "nik": visitor.nik, 
            "full_name": visitor.full_name,
            "institution": visitor.institution, 
            "check_in_time": check_in_jkt,  # Send Jakarta time
            "check_out_time": check_out_jkt,  # Send Jakarta time
            "status": status_visit, 
            "photo_url": photo_url
        })
    return logs_data

@app.post("/visitors/", status_code=status.HTTP_201_CREATED, tags=["Admin"])
def create_visitor(
    nik: str = Form(..., min_length=3, max_length=20),
    full_name: str = Form(...), institution: str = Form(...), phone: str = Form(None),
    photo: UploadFile = File(...), ktp: UploadFile = File(None), task_letter: UploadFile = File(None),
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
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
    logger.info(f"New visitor registered: {full_name} (NIK: {nik}) by {current_admin.username}")
    return StandardResponse(status="success", message="Registrasi Tamu Berhasil")

# === PUBLIC ENDPOINTS ===
@app.get("/visitors/{nik}", tags=["Visitor"])
def get_visitor(nik: str, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor: raise HTTPException(404, "Data tidak ditemukan")
    now_jkt = datetime.now(JAKARTA_TZ)
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik, models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()
    return {"nik": visitor.nik, "full_name": visitor.full_name, "institution": visitor.institution, "phone": visitor.phone,
            "photo_path": visitor.photo_path, "is_checked_in": active_visit is not None}

@app.get("/visitors/{nik}/photo", tags=["Visitor"])
def get_visitor_photo(nik: str, db: Session = Depends(get_db)):
    """
    Public endpoint for visitors to access their own photo.
    No admin authentication required - validates by NIK.
    """
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    if not visitor.photo_path:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Check if file exists
    if not os.path.exists(visitor.photo_path):
        logger.warning(f"Photo file missing for visitor {nik}: {visitor.photo_path}")
        raise HTTPException(status_code=404, detail="Photo file not found")
    
    # Return photo with proper headers
    return FileResponse(
        visitor.photo_path,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
            "X-Content-Type-Options": "nosniff"
        }
    )


@app.post("/check-in/", tags=["Attendance"])
def check_in(nik: str = Form(...), db: Session = Depends(get_db)):
    validate_nik(nik)
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor: raise HTTPException(404, "NIK tidak ditemukan.")
    
    # Get current time in Jakarta timezone
    now_jkt = datetime.now(JAKARTA_TZ)
    
    # Convert to UTC for storage (consistent timezone in database)
    now_utc = now_jkt.astimezone(pytz.UTC).replace(tzinfo=None)
    
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik, 
        models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()
    if active_visit: 
        return CheckInOutResponse(status="info", message="Sudah masuk.", time=now_jkt.strftime("%H:%M:%S"))
    
    # Store UTC time in database
    new_log = models.VisitLog(
        visitor_nik=nik, 
        check_in_time=now_utc, 
        visit_date=now_jkt.date()
    )
    db.add(new_log)
    db.commit()
    logger.info(f"Check-in: {visitor.full_name} (NIK: {nik}) at {now_jkt.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    return CheckInOutResponse(status="success", message=f"Selamat Datang {visitor.full_name}!", time=now_jkt.strftime("%H:%M:%S"))

@app.post("/check-out/", tags=["Attendance"])
def check_out(nik: str = Form(...), db: Session = Depends(get_db)):
    # Get current time in Jakarta timezone
    now_jkt = datetime.now(JAKARTA_TZ)
    
    # Convert to UTC for storage
    now_utc = now_jkt.astimezone(pytz.UTC).replace(tzinfo=None)
    
    active_visit = db.query(models.VisitLog).filter(
        models.VisitLog.visitor_nik == nik, 
        models.VisitLog.visit_date == now_jkt.date(),
        models.VisitLog.check_out_time == None
    ).first()
    if not active_visit: raise HTTPException(400, "Belum Check-In.")
    
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    
    # Store UTC time in database
    active_visit.check_out_time = now_utc
    db.commit()
    logger.info(f"Check-out: {visitor.full_name if visitor else 'Unknown'} (NIK: {nik}) at {now_jkt.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    return CheckInOutResponse(status="success", message="Hati-hati di jalan!", time=now_jkt.strftime("%H:%M:%S"))

# === GET VISITOR HISTORY ===
@app.get("/visitors/{nik}/history", tags=["Visitor"])
def get_visitor_history(nik: str, db: Session = Depends(get_db)):
    """Get complete visit history for a visitor"""
    # Check if visitor exists
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    # Get all visit logs for this visitor, ordered by date descending
    logs = db.query(models.VisitLog)\
        .filter(models.VisitLog.visitor_nik == nik)\
        .order_by(models.VisitLog.check_in_time.desc())\
        .all()
    
    # Format history
    history = []
    jakarta_tz = pytz.timezone('Asia/Jakarta')
    
    for log in logs:
        # Database stores naive datetime (UTC)
        # Convert to Jakarta timezone for display
        if log.check_in_time:
            # Treat naive datetime as UTC, then convert to Jakarta
            check_in_utc = log.check_in_time.replace(tzinfo=pytz.UTC)
            check_in_jkt = check_in_utc.astimezone(jakarta_tz)
        else:
            check_in_jkt = None
            
        if log.check_out_time:
            check_out_utc = log.check_out_time.replace(tzinfo=pytz.UTC)
            check_out_jkt = check_out_utc.astimezone(jakarta_tz)
        else:
            check_out_jkt = None
        
        # Determine status
        status = "Selesai" if log.check_out_time else "Sedang Berkunjung"
        
        history.append({
            "date": check_in_jkt.strftime("%d/%m/%Y") if check_in_jkt else "-",
            "check_in": check_in_jkt.strftime("%H:%M:%S") if check_in_jkt else "-",
            "check_out": check_out_jkt.strftime("%H:%M:%S") if check_out_jkt else None,
            "status": status
        })
    
    return {"history": history}

# === SECURE FILE ACCESS ===
@app.get("/uploads/{filename}", tags=["Files"])
def get_uploaded_file(filename: str, current_admin: models.Admin = Depends(get_current_admin)):
    """
    Protected endpoint for accessing uploaded files.
    Requires admin authentication to prevent unauthorized access to KTP/visitor photos.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Security: Prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        logger.warning(f"Directory traversal attempt blocked: {filename}")
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Security: Force download to prevent XSS (especially for PDFs/SVGs)
    # Use inline for images to display in browser
    media_type = None
    disposition = "inline"  # For images, show in browser
    
    # Detect file type
    file_ext = filename.lower().split('.')[-1]
    if file_ext in ['jpg', 'jpeg', 'png', 'gif']:
        media_type = f"image/{file_ext}" if file_ext != 'jpg' else "image/jpeg"
        disposition = "inline"  # Display images
    elif file_ext == 'pdf':
        media_type = "application/pdf"
        disposition = "attachment"  # Force download PDFs
    
    headers = {
        "Content-Disposition": f"{disposition}; filename={filename}",
        "X-Content-Type-Options": "nosniff",  # Prevent MIME sniffing
        "Cache-Control": "private, max-age=3600"  # Cache for 1 hour
    }
    
    logger.info(f"File access: {filename} by admin {current_admin.username}")
    return FileResponse(file_path, media_type=media_type, headers=headers)

# UPDATE Visitor
@app.put("/visitors/{nik}", tags=["Admin"])
def update_visitor(
    nik: str, 
    full_name: str = Form(...), 
    institution: str = Form(...), 
    phone: str = Form(None),
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    visitor.full_name = full_name
    visitor.institution = institution
    visitor.phone = phone
    
    db.commit()
    return {"status": "success", "message": "Data berhasil diperbarui"}

# DELETE Visitor
@app.delete("/visitors/{nik}", tags=["Admin"])
def delete_visitor(
    nik: str, 
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    visitor = db.query(models.Visitor).filter(models.Visitor.nik == nik).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    # Hapus log kunjungan terkait terlebih dahulu (Cascade delete manual)
    db.query(models.VisitLog).filter(models.VisitLog.visitor_nik == nik).delete()
    
    # Hapus file foto fisik jika ada
    if visitor.photo_path and os.path.exists(visitor.photo_path):
        try:
            os.remove(visitor.photo_path)
        except OSError:
            pass
            
    if visitor.ktp_path and os.path.exists(visitor.ktp_path):
        try:
            os.remove(visitor.ktp_path)
        except OSError:
            pass

    if visitor.task_letter_path and os.path.exists(visitor.task_letter_path):
        try:
            os.remove(visitor.task_letter_path)
        except OSError:
            pass
        
    db.delete(visitor)
    db.commit()
    return {"status": "success", "message": "Data pengunjung berhasil dihapus"}
