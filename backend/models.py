# FILE: backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Boolean, Text
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
    task_letter_path = Column(String, nullable=True)  # Legacy - kept for backward compatibility
    
    created_at = Column(DateTime, default=datetime.now)

    logs = relationship("VisitLog", back_populates="visitor")

# Tabel 2: Master Ruangan
class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

# Tabel 3: Master Pendamping
class Companion(Base):
    __tablename__ = "companions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    position = Column(String, nullable=True)  # Jabatan
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

# Tabel 4: Log Kunjungan
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
    
    # NEW: Visit Details
    visit_purpose = Column(Text, nullable=True)  # Tujuan berkunjung
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    companion_id = Column(Integer, ForeignKey("companions.id"), nullable=True)
    
    # Relationships
    visitor = relationship("Visitor", back_populates="logs")
    room = relationship("Room")
    companion = relationship("Companion")
    task_letters = relationship("TaskLetter", back_populates="visit", cascade="all, delete-orphan")

# Tabel 5: Surat Tugas (Many-to-One dengan VisitLog)
class TaskLetter(Base):
    __tablename__ = "task_letters"
    
    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("visit_logs.id"), nullable=False)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    uploaded_at = Column(DateTime, default=datetime.now)
    
    visit = relationship("VisitLog", back_populates="task_letters")

# Tabel 6: Admin
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)