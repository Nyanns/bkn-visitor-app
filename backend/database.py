# FILE: backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Load file .env
load_dotenv()

# 2. Ambil alamat database dari .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Cek keamanan: Pastikan URL ditemukan
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL tidak ditemukan di file .env! Cek konfigurasi.")

# 3. Buat mesin koneksi
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency (Fungsi untuk dipanggil di main.py nanti)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()