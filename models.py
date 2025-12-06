# FILE: backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# Tabel 1: Pengunjung (Visitor)
class Visitor(Base):
    __tablename__ = "visitors"

    nik = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    # Path Foto
    photo_path = Column(String, nullable=True)
    ktp_path = Column(String, nullable=True)
    task_letter_path = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.now)

    logs = relationship("VisitLog", back_populates="visitor")

# Tabel 2: Log Kunjungan
# TIMEZONE CONVENTION: All DateTime fields store naive datetime (UTC)
# Application layer converts to Jakarta timezone (UTC+7) for display
class VisitLog(Base):
    __tablename__ = "visit_logs"

    id = Column(Integer, primary_key=True, index=True)
    visitor_nik = Column(String, ForeignKey("visitors.nik"))
    visit_date = Column(Date, default=datetime.now().date)
    
    # Stored as naive datetime (UTC) - converted to Jakarta (UTC+7) when displayed
    check_in_time = Column(DateTime, default=datetime.now)
    check_out_time = Column(DateTime, nullable=True)
    
    visitor = relationship("Visitor", back_populates="logs")

# Tabel 3: Admin (INI YANG TADI HILANG)
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)