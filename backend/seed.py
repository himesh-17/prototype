import asyncio
from app.db.database import SessionLocal, engine, Base
from app.db.models import User, RoleEnum
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    
    users = [
        {"name": "Admin User", "email": "admin@police.gov", "password": "adminpassword", "role": RoleEnum.ADMIN, "badge_number": "ADM-01", "department": "HQ"},
        {"name": "Investigating Officer John", "email": "io@police.gov", "password": "iopassword", "role": RoleEnum.IO, "badge_number": "IO-101", "department": "Homicide"},
        {"name": "Dr. Sarah Forensic", "email": "forensic@police.gov", "password": "forensicpassword", "role": RoleEnum.FORENSIC_EXPERT, "badge_number": "FX-202", "department": "Crime Lab"},
        {"name": "Hon. Judge Smith", "email": "judge@court.gov", "password": "judgepassword", "role": RoleEnum.JUDGE, "badge_number": "JG-303", "department": "High Court"},
    ]
    
    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            hashed_pw = get_password_hash(u["password"])
            new_user = User(
                name=u["name"],
                email=u["email"],
                password_hash=hashed_pw,
                role=u["role"],
                badge_number=u["badge_number"],
                department=u["department"]
            )
            db.add(new_user)
            print(f"Created user: {u['email']}")
        else:
            print(f"User already exists: {u['email']}")
            
    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_data()
