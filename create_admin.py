import bcrypt
from database import get_db, engine
import models
from sqlalchemy.orm import Session

# Create tables if not exist
models.Base.metadata.create_all(bind=engine)

# Get DB session
db = Session(engine)

# Check if admin exists
admin = db.query(models.Admin).filter(models.Admin.username == 'admin').first()

# Hash password
password = 'admin123'
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

if admin:
    # Reset password
    admin.password_hash = hashed
    print('Admin password reset successfully!')
else:
    # Create new admin
    new_admin = models.Admin(username='admin', password_hash=hashed)
    db.add(new_admin)
    print('New admin created successfully!')

db.commit()
db.close()
print('Username: admin')
print('Password: admin123')
