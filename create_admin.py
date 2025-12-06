"""
🔐 Secure Admin Creation Script
================================

This script allows you to securely create new admin users
for the BKN Visitor System.

Usage:
    python create_admin.py

Security Features:
    - Hidden password input
    - Password confirmation
    - Automatic bcrypt hashing
    - Duplicate username check
    - No web exposure

Author: BKN INTIKAMI
"""

import sys
from getpass import getpass
from sqlalchemy.orm import Session
import bcrypt

from database import SessionLocal
import models

def create_admin():
    """Securely create a new admin user"""
    
    print("=" * 60)
    print("🔐 SECURE ADMIN CREATION SCRIPT")
    print("   BKN Visitor System - Admin Management")
    print("=" * 60)
    
    # Step 1: Get username
    print("\n📝 Step 1: Enter admin username")
    print("   (alphanumeric, no spaces)")
    username = input("   Username: ").strip()
    
    if not username:
        print("\n❌ Error: Username cannot be empty!")
        return
    
    if not username.isalnum():
        print("\n❌ Error: Username must be alphanumeric (no special characters)")
        return
    
    # Step 2: Check if username already exists
    print("\n🔍 Step 2: Checking for duplicates...")
    db = SessionLocal()
    
    try:
        existing = db.query(models.Admin).filter(models.Admin.username == username).first()
        if existing:
            print(f"\n❌ Error: Admin '{username}' already exists!")
            print("   Please choose a different username.")
            return
        
        print(f"   ✅ Username '{username}' is available")
        
        # Step 3: Get password
        print("\n🔒 Step 3: Enter admin password")
        print("   Password Requirements:")
        print("   • Minimum 8 characters")
        print("   • Mix of letters and numbers recommended")
        print("   • Case sensitive")
        print()
        
        password = getpass("   Password: ")
        password_confirm = getpass("   Confirm Password: ")
        
        # Validate password match
        if password != password_confirm:
            print("\n❌ Error: Passwords don't match!")
            print("   Please try again.")
            return
        
        # Validate password length
        if len(password) < 8:
            print("\n❌ Error: Password must be at least 8 characters!")
            return
        
        # Validate password strength (basic)
        has_letter = any(c.isalpha() for c in password)
        has_digit = any(c.isdigit() for c in password)
        
        if not has_letter or not has_digit:
            print("\n⚠️  Warning: Password is weak!")
            print("   Recommended: Use both letters and numbers")
            confirm = input("   Continue anyway? (y/N): ").strip().lower()
            if confirm != 'y':
                print("\n   Operation cancelled.")
                return
        
        # Step 4: Hash password
        print("\n🔐 Step 4: Hashing password...")
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        print("   ✅ Password hashed successfully")
        
        # Step 5: Create admin
        print("\n💾 Step 5: Creating admin account...")
        new_admin = models.Admin(
            username=username,
            password_hash=hashed.decode('utf-8')  # Changed from hashed_password
        )
        
        db.add(new_admin)
        db.commit()
        
        # Success message
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Admin account created successfully")
        print("=" * 60)
        print(f"\n   Username: {username}")
        print(f"   Password: {'*' * len(password)}")
        print("\n⚠️  IMPORTANT SECURITY NOTES:")
        print("   • Keep these credentials SECURE")
        print("   • Do NOT share with unauthorized personnel")
        print("   • Consider changing password on first login")
        print("   • This message will not appear again")
        print("\n📝 Next Steps:")
        print("   1. Login to admin panel: http://localhost:5173/admin")
        print("   2. Use the credentials you just created")
        print("   3. Start managing visitor registrations")
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error creating admin: {e}")
        print("   Please check database connection and try again.")
        db.rollback()
        
    finally:
        db.close()

def list_admins():
    """List all existing admins (for reference)"""
    print("\n📋 Listing existing admin accounts...")
    db = SessionLocal()
    
    try:
        admins = db.query(models.Admin).all()
        if not admins:
            print("   No admin accounts found.")
        else:
            print(f"\n   Total admins: {len(admins)}")
            print("   " + "-" * 40)
            for idx, admin in enumerate(admins, 1):
                print(f"   {idx}. {admin.username}")
            print("   " + "-" * 40)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 BKN Visitor System - Admin Management Tool\n")
    
    # Check if user wants to list admins first
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_admins()
    else:
        # Create new admin
        create_admin()
        
        # Ask if want to see all admins
        print("\n")
        show_list = input("📋 Show list of all admins? (y/N): ").strip().lower()
        if show_list == 'y':
            list_admins()
    
    print("\n👋 Goodbye!\n")
