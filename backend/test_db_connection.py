import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env variables
load_dotenv()

database_url = os.getenv("DATABASE_URL")
print(f"Testing connection to: {database_url}")

if not database_url:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

try:
    # Attempt to create engine
    engine = create_engine(database_url)
    
    # Attempt to connect
    with engine.connect() as connection:
        print("Successfully connected to the database!")
        
        # Test query
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()
        print(f"PostgreSQL Version: {version[0]}")
        
        # Check tables
        result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
        tables = [row[0] for row in result]
        print("Tables found:", tables)
        
        # Check admins
        if 'admins' in tables:
            result = connection.execute(text("SELECT count(*) FROM admins;"))
            count = result.scalar()
            print(f"Number of admins: {count}")
        else:
            print("WARNING: 'admins' table not found!")

except Exception as e:
    print(f"CONNECTION FAILED: {e}")
    sys.exit(1)
