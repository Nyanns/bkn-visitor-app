# FILE: backend/migrate_db.py
# Script untuk menambahkan kolom baru ke database PostgreSQL yang sudah ada

import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to database...")

from sqlalchemy import create_engine, text

engine = create_engine(DATABASE_URL)

# Migration queries
migrations = [
    # 1. Create rooms table
    """
    CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        description VARCHAR,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """,
    
    # 2. Create companions table
    """
    CREATE TABLE IF NOT EXISTS companions (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        position VARCHAR,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """,
    
    # 3. Create task_letters table
    """
    CREATE TABLE IF NOT EXISTS task_letters (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER NOT NULL REFERENCES visit_logs(id),
        file_path VARCHAR NOT NULL,
        original_filename VARCHAR NOT NULL,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT NOW()
    );
    """,
    
    # 4. Add columns to visit_logs (with IF NOT EXISTS check)
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visit_logs' AND column_name='visit_purpose') THEN
            ALTER TABLE visit_logs ADD COLUMN visit_purpose TEXT;
        END IF;
    END $$;
    """,
    
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visit_logs' AND column_name='room_id') THEN
            ALTER TABLE visit_logs ADD COLUMN room_id INTEGER REFERENCES rooms(id);
        END IF;
    END $$;
    """,
    
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visit_logs' AND column_name='companion_id') THEN
            ALTER TABLE visit_logs ADD COLUMN companion_id INTEGER REFERENCES companions(id);
        END IF;
    END $$;
    """,
]

# Run migrations
with engine.connect() as conn:
    for i, sql in enumerate(migrations):
        try:
            conn.execute(text(sql))
            conn.commit()
            print(f"[OK] Migration {i+1} completed")
        except Exception as e:
            print(f"[FAIL] Migration {i+1} failed: {e}")
            conn.rollback()

print("\n[SUCCESS] Database migration completed!")
print("Restart the backend server to apply changes.")
