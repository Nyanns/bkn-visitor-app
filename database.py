# FILE: backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Load file .env
from pathlib import Path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# 2. Ambil alamat database dari .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Cek keamanan: Pastikan URL ditemukan
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL tidak ditemukan di file .env! Cek konfigurasi.")

# 3. Buat mesin koneksi dengan connection pooling
# Pool configuration untuk production-ready performance
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,          # Number of connections to keep open
    max_overflow=20,       # Max connections beyond pool_size
    pool_pre_ping=True,    # Verify connections before using
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False             # Set to True for debugging SQL queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency (Fungsi untuk dipanggil di main.py nanti)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()