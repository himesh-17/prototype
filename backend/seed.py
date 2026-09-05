from app.db.database import SessionLocal
from app.db.models import User, Case, Document, CaseStatusEnum, RoleEnum
from app.core.security import get_password_hash


def seed_data():
    db = SessionLocal()

    # --- Users ---
    users = [
        {"name": "Vikramaditya Sharma", "email": "admin@nyaya.dms", "password": "admin@nyaya.dms", "role": RoleEnum.ADMIN, "badge_number": "ADM-001", "department": "NCRB HQ"},
        {"name": "Rajesh Deshmukh", "email": "io.deshmukh@police.gov.in", "password": "io.deshmukh@police.gov.in", "role": RoleEnum.IO, "badge_number": "IO-101", "department": "Cyber Crime Branch"},
        {"name": "Priya Menon", "email": "io.menon@police.gov.in", "password": "io.menon@police.gov.in", "role": RoleEnum.IO, "badge_number": "IO-102", "department": "Economic Offences Wing"},
        {"name": "Vikram Singh Rathore", "email": "io.rathore@police.gov.in", "password": "io.rathore@police.gov.in", "role": RoleEnum.IO, "badge_number": "IO-103", "department": "Anti-Terrorism Squad"},
        {"name": "Hon'ble Justice Sundaram", "email": "judge.sundaram@delhicourts.nic.in", "password": "judge.sundaram@delhicourts.nic.in", "role": RoleEnum.JUDGE, "badge_number": "JG-303", "department": "Patiala House"},
        {"name": "Dr. Aarav Nambiar", "email": "aarav.nambiar@cfsl.gov.in", "password": "aarav.nambiar@cfsl.gov.in", "role": RoleEnum.FORENSIC_EXPERT, "badge_number": "FX-202", "department": "CFSL CBI"},
    ]

    created_users = {}
    for u in users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            hashed_pw = get_password_hash(u["password"])
            new_user = User(
                name=u["name"], email=u["email"], password_hash=hashed_pw,
                role=u["role"], badge_number=u["badge_number"], department=u["department"],
            )
            db.add(new_user)
            db.flush()
            created_users[u["email"]] = new_user.id
            print(f"Created user: {u['email']}")
        else:
            created_users[u["email"]] = existing.id
            print(f"Exists user: {u['email']}")

    db.commit()

    io_deshmukh_id = created_users.get("io.deshmukh@police.gov.in")
    io_menon_id = created_users.get("io.menon@police.gov.in")

    # --- Cases ---
    cases_data = [
        {"case_number": "CR-2026-0891", "title": "Phishing Attack on State Bank Servers", "assigned_io_id": io_deshmukh_id},
        {"case_number": "CR-2026-0923", "title": "Cryptocurrency Fraud Ring — Delhi NCR", "assigned_io_id": io_menon_id},
        {"case_number": "CR-2026-1001", "title": "Ransomware Attack on Hospital Network", "assigned_io_id": io_deshmukh_id},
        {"case_number": "CR-2026-1045", "title": "Corporate Espionage via Spear Phishing", "assigned_io_id": io_menon_id},
        {"case_number": "CR-2026-1050", "title": "Dark Web Narcotics Distribution", "assigned_io_id": io_deshmukh_id},
        {"case_number": "CR-2026-1102", "title": "Unauthorized Access to Gov Portals", "assigned_io_id": io_menon_id},
        {"case_number": "CR-2026-1133", "title": "Identity Theft & Credit Card Fraud", "assigned_io_id": io_deshmukh_id},
        {"case_number": "CR-2026-1210", "title": "IoT Botnet DDoS Attack Investigation", "assigned_io_id": io_menon_id},
        {"case_number": "CR-2026-1255", "title": "Fake Tech Support Call Center Bust", "assigned_io_id": io_deshmukh_id},
        {"case_number": "CR-2026-1300", "title": "Insider Data Exfiltration (Tech Corp)", "assigned_io_id": io_menon_id},
        {"case_number": "CR-2026-1342", "title": "Malware Injected in E-Commerce Checkout", "assigned_io_id": io_deshmukh_id},
        {"case_number": "CR-2026-1399", "title": "Cyberbullying and Doxxing Incident", "assigned_io_id": io_menon_id},
    ]

    case_ids = []
    for c in cases_data:
        existing = db.query(Case).filter(Case.case_number == c["case_number"]).first()
        if not existing:
            new_case = Case(**c)
            db.add(new_case)
            db.flush()
            case_ids.append(new_case.id)
            print(f"Created case: {c['case_number']}")
        else:
            case_ids.append(existing.id)
            print(f"Exists case: {c['case_number']}")

    db.commit()

    # --- Documents (on first case) ---
    if case_ids:
        docs_data = [
            {"case_id": case_ids[0], "filename": "FIR_Charge_Sheet.pdf", "document_type": "FIR", "uploader_id": io_deshmukh_id, "sha256_hash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", "ocr_text": "FIR No. 456/2026. Under sections 66C, 66D of IT Act. Complainant reported unauthorized access to bank credentials via phishing email."},
            {"case_id": case_ids[0], "filename": "Digital_Forensic_Report.pdf", "document_type": "FORENSIC_REPORT", "uploader_id": created_users.get("aarav.nambiar@cfsl.gov.in"), "sha256_hash": "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5", "ocr_text": "CFSL Report: Malware样本分析完成. SQL injection vector identified in email payload. SHA-256 hash of malware binary verified."},
        ]

        for d in docs_data:
            existing = db.query(Document).filter(Document.filename == d["filename"]).first()
            if not existing:
                db.add(Document(**d))
                print(f"Created document: {d['filename']}")
            else:
                print(f"Exists document: {d['filename']}")

        db.commit()

    db.close()
    print("Seeding complete.")


if __name__ == "__main__":
    seed_data()
