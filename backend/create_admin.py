"""Script to create admin user manually"""
import sys
from app.database import SessionLocal
from app import models, utils

db = SessionLocal()
try:
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
    
    if admin:
        print(f"Admin user already exists!")
        print(f"  Email: {admin.email}")
        print(f"  Is Admin: {admin.is_admin}")
        print(f"  Is Active: {admin.is_active}")
        
        # Update to ensure it's an admin
        admin.is_admin = True
        admin.is_active = True
        # Reset password to admin123
        admin.password_hash = utils.hash_password("admin123")
        db.commit()
        print("  ✅ Updated admin user (password reset to 'admin123')")
    else:
        print("Creating admin user...")
        admin = models.User(
            name="Admin User",
            email="admin@example.com",
            phone="+1-555-0000",
            password_hash=utils.hash_password("admin123"),
            is_admin=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"✅ Admin user created!")
        print(f"  Email: {admin.email}")
        print(f"  Password: admin123")
        print(f"  User ID: {admin.user_id}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
