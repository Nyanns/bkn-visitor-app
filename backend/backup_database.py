#!/usr/bin/env python3
"""
Database Backup Script for BKN Visitor System
Usage: python backup_database.py
"""
import shutil
import os
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
DB_FILE = "visitor_db.sqlite"
BACKUP_DIR = "backups"
KEEP_DAYS = 7  # Keep backups for last 7 days

def backup_database():
    """Create a timestamped backup of the database"""
    # Create backup directory if not exists
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    # Check if database exists
    if not os.path.exists(DB_FILE):
        print(f"❌ Error: Database file '{DB_FILE}' not found!")
        return False
    
    # Create backup filename with timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    backup_filename = f"visitor_db_{timestamp}.sqlite"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    
    try:
        # Copy database file
        shutil.copy2(DB_FILE, backup_path)
        file_size = os.path.getsize(backup_path) / 1024  # KB
        print(f"✅ Backup created: {backup_filename} ({file_size:.2f} KB)")
        
        # Cleanup old backups
        cleanup_old_backups()
        return True
    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return False

def cleanup_old_backups():
    """Remove backups older than KEEP_DAYS"""
    cutoff_date = datetime.now() - timedelta(days=KEEP_DAYS)
    backup_files = Path(BACKUP_DIR).glob("visitor_db_*.sqlite")
    
    removed_count = 0
    for backup_file in backup_files:
        file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
        if file_time < cutoff_date:
            backup_file.unlink()
            removed_count += 1
            print(f"🗑️  Removed old backup: {backup_file.name}")
    
    if removed_count == 0:
        print("ℹ️  No old backups to remove")

if __name__ == "__main__":
    print("=== BKN Visitor System - Database Backup ===")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    if backup_database():
        print()
        print("✅ Backup completed successfully!")
    else:
        print()
        print("❌ Backup failed!")
        exit(1)
