from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, SQLALCHEMY_DATABASE_URL
from models import Admin
import bcrypt

# Setup DB connection
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def get_password_hash(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def reset_admin():
    print("Checking for existing admins...")
    admins = db.query(Admin).all()
    if not admins:
        print("No admins found. Creating 'admin'...")
        new_admin = Admin(username="admin", password_hash=get_password_hash("admin123"))
        db.add(new_admin)
        db.commit()
        print("Created admin: admin / admin123")
    else:
        print(f"Found {len(admins)} admins.")
        for admin in admins:
            print(f"- {admin.username}")
        
        target_username = "admin"
        admin = db.query(Admin).filter(Admin.username == target_username).first()
        
        if admin:
             print(f"Resetting password for '{target_username}' to 'admin123'...")
             admin.password_hash = get_password_hash("admin123")
             db.commit()
             print("Password reset successful.")
        else:
             print(f"Creating '{target_username}'...")
             new_admin = Admin(username="admin", password_hash=get_password_hash("admin123"))
             db.add(new_admin)
             db.commit()
             print("Created admin: admin / admin123")

if __name__ == "__main__":
    reset_admin()
