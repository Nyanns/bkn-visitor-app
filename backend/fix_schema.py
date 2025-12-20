import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env
load_dotenv()
database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("DATABASE_URL missing")
    sys.exit(1)

engine = create_engine(database_url)

def add_column_if_not_exists(connection, table_name, column_name, column_type):
    try:
        # Check if column exists
        check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table_name}' AND column_name='{column_name}'")
        result = connection.execute(check_query)
        if result.fetchone():
            print(f"Column '{column_name}' already exists in '{table_name}'.")
            return

        # Add column
        print(f"Adding column '{column_name}' to '{table_name}'...")
        alter_query = text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
        connection.execute(alter_query)
        print(f"Success: Added '{column_name}'")
        
    except Exception as e:
        print(f"Error adding '{column_name}': {e}")

try:
    with engine.connect() as connection:
        # Commit transaction automatically for DDL
        connection.execution_options(isolation_level="AUTOCOMMIT")
        
        print("Starting schema migration...")
        
        # 1. visit_purpose
        add_column_if_not_exists(connection, "visit_logs", "visit_purpose", "TEXT")
        
        # 2. room_id
        add_column_if_not_exists(connection, "visit_logs", "room_id", "INTEGER")
        
        # 3. companion_id
        add_column_if_not_exists(connection, "visit_logs", "companion_id", "INTEGER")
        
        # Add Foreign Keys?
        # Ideally yes, but let's just make sure columns exist first to fix the 500 error.
        # Adding constraints might fail if data is invalid, but new columns are null so it's fine.
        
        # Add FK for room_id
        try:
             connection.execute(text("ALTER TABLE visit_logs ADD CONSTRAINT fk_visit_logs_rooms FOREIGN KEY (room_id) REFERENCES rooms(id)"))
             print("Added FK for rooms")
        except Exception as e:
             print(f"FK rooms info: {e}") # Likely already exists or skipped
             
        # Add FK for companion_id
        try:
             connection.execute(text("ALTER TABLE visit_logs ADD CONSTRAINT fk_visit_logs_companions FOREIGN KEY (companion_id) REFERENCES companions(id)"))
             print("Added FK for companions")
        except Exception as e:
             print(f"FK companions info: {e}")

        print("Migration completed.")
        
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    sys.exit(1)
