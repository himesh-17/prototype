"""Comprehensive test of all Nyaya Setu backend features.

Tests: auth, cases, assets, documents (upload + OCR + versions),
search, audit chain, comments, permissions, blockchain, compliance.
"""
import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def register(client, name, email, password, role):
    return client.post("/api/v1/auth/register", json={
        "name": name, "email": email, "password": password, "role": role,
    })

def login(client, email, password):
    return client.post("/api/v1/auth/login", data={"username": email, "password": password})

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

def me(client, token):
    return client.get("/api/v1/auth/me", headers=auth_header(token)).json()

def create_case(client, token, case_number, io_id):
    return client.post("/api/v1/cases", headers=auth_header(token), json={
        "case_number": case_number, "title": f"Case {case_number}", "assigned_io_id": io_id,
    })


# ---------------------------------------------------------------------------
# 1. Auth
# ---------------------------------------------------------------------------

class TestAuth:
    def test_register(self, client):
        r = register(client, "Admin T", "admint@police.gov", "pass1234", "ADMIN")
        assert r.status_code == 200
        assert r.json()["role"] == "ADMIN"

    def test_login(self, client):
        register(client, "Login User", "login@police.gov", "pass1234", "IO")
        r = login(client, "login@police.gov", "pass1234")
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, client):
        register(client, "Wrong PW", "wrongpw@police.gov", "pass1234", "IO")
        r = login(client, "wrongpw@police.gov", "wrong")
        assert r.status_code == 401

    def test_me(self, client):
        register(client, "Me User", "me@police.gov", "pass1234", "IO")
        token = login(client, "me@police.gov", "pass1234").json()["access_token"]
        r = client.get("/api/v1/auth/me", headers=auth_header(token))
        assert r.status_code == 200
        assert r.json()["email"] == "me@police.gov"

    def test_list_users(self, client):
        register(client, "List Admin", "listadmin@police.gov", "pass1234", "ADMIN")
        token = login(client, "listadmin@police.gov", "pass1234").json()["access_token"]
        r = client.get("/api/v1/auth/users", headers=auth_header(token))
        assert r.status_code == 200
        assert len(r.json()) >= 1


# ---------------------------------------------------------------------------
# 2. Cases
# ---------------------------------------------------------------------------

class TestCaseLifecycle:
    def test_create_case(self, client):
        register(client, "IO Case", "iocase@police.gov", "pass1234", "IO")
        token = login(client, "iocase@police.gov", "pass1234").json()["access_token"]
        io_id = me(client, token)["id"]
        r = create_case(client, token, "CASE-001", io_id)
        assert r.status_code == 200
        assert r.json()["case_number"] == "CASE-001"

    def test_list_cases(self, client):
        register(client, "IO List", "iolist@police.gov", "pass1234", "IO")
        token = login(client, "iolist@police.gov", "pass1234").json()["access_token"]
        io_id = me(client, token)["id"]
        create_case(client, token, "CASE-LIST-001", io_id)
        r = client.get("/api/v1/cases", headers=auth_header(token))
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_judge_cannot_create_case(self, client):
        register(client, "Judge Case", "judgecase@police.gov", "pass1234", "JUDGE")
        jtok = login(client, "judgecase@police.gov", "pass1234").json()["access_token"]
        r = client.post("/api/v1/cases", headers=auth_header(jtok), json={
            "case_number": "JUDGE-001", "title": "Fail", "assigned_io_id": 1,
        })
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# 3. Assets
# ---------------------------------------------------------------------------

class TestAssets:
    def test_create_and_transfer_asset(self, client):
        register(client, "IO Asset", "ioasset@police.gov", "pass1234", "IO")
        register(client, "Admin Asset", "adminasset@police.gov", "pass1234", "ADMIN")
        io_tok = login(client, "ioasset@police.gov", "pass1234").json()["access_token"]
        admin_tok = login(client, "adminasset@police.gov", "pass1234").json()["access_token"]
        io_id = me(client, io_tok)["id"]
        admin_id = me(client, admin_tok)["id"]

        case = create_case(client, io_tok, "ASSET-001", io_id).json()

        r = client.post(f"/api/v1/cases/{case['id']}/assets", headers=auth_header(io_tok), json={
            "asset_number": "AST-001", "name": "Laptop", "asset_type": "Electronics", "location": "Lab",
        })
        assert r.status_code == 200
        asset_id = r.json()["id"]

        r2 = client.post(f"/api/v1/assets/{asset_id}/transfer", headers=auth_header(io_tok), json={
            "to_user_id": admin_id, "new_status": "IN_LAB", "remarks": "Testing",
        })
        assert r2.status_code == 200
        assert r2.json()["status"] == "IN_LAB"

    def test_lifecycle_events(self, client):
        register(client, "IO Events", "ioevents@police.gov", "pass1234", "IO")
        register(client, "Admin Events", "adminevents@police.gov", "pass1234", "ADMIN")
        io_tok = login(client, "ioevents@police.gov", "pass1234").json()["access_token"]
        admin_tok = login(client, "adminevents@police.gov", "pass1234").json()["access_token"]
        io_id = me(client, io_tok)["id"]
        admin_id = me(client, admin_tok)["id"]

        case = create_case(client, io_tok, "EVT-001", io_id).json()
        asset = client.post(f"/api/v1/cases/{case['id']}/assets", headers=auth_header(io_tok), json={
            "asset_number": "EVT-AST-001", "name": "Phone", "asset_type": "Electronics",
        }).json()

        client.post(f"/api/v1/assets/{asset['id']}/transfer", headers=auth_header(io_tok), json={
            "to_user_id": admin_id, "new_status": "IN_LAB", "remarks": "Transfer",
        })

        r = client.get(f"/api/v1/assets/{asset['id']}/events", headers=auth_header(io_tok))
        assert r.status_code == 200
        assert len(r.json()) >= 1


# ---------------------------------------------------------------------------
# 4. Documents + OCR + Versions
# ---------------------------------------------------------------------------

class TestDocumentsOCR:
    def _setup(self, client):
        register(client, "IO Doc", "iodoc@police.gov", "pass1234", "IO")
        io_tok = login(client, "iodoc@police.gov", "pass1234").json()["access_token"]
        io_id = me(client, io_tok)["id"]
        case = create_case(client, io_tok, "DOC-001", io_id).json()
        return io_tok, case["id"]

    def test_upload_text_document_ocr(self, client):
        """OCR should extract text from plain text files."""
        io_tok, case_id = self._setup(client)
        content = b"This is a seizure memo for case DOC-001. Seized items: laptop, phone."
        r = client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MEMO"},
            files={"file": ("seizure_memo.txt", content, "text/plain")},
        )
        assert r.status_code == 201
        data = r.json()
        assert data["filename"] == "seizure_memo.txt"
        assert data["sha256_hash"] != ""
        # OCR text should be extracted from text/plain
        assert data["ocr_text"] is not None
        assert "seizure memo" in data["ocr_text"].lower()

    def test_upload_pdf_document(self, client):
        """PDF upload should work (OCR depends on pypdf)."""
        io_tok, case_id = self._setup(client)
        pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 0\ntrailer\n<< >>\n%%EOF"
        r = client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "REPORT"},
            files={"file": ("report.pdf", pdf_content, "application/pdf")},
        )
        assert r.status_code == 201
        assert r.json()["filename"] == "report.pdf"

    def test_upload_jpg_document(self, client):
        """JPEG upload should work (OCR depends on tesseract)."""
        io_tok, case_id = self._setup(client)
        jpg_content = b"\xff\xd8\xff\xe0" + b"\x00" * 100
        r = client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "PHOTO"},
            files={"file": ("evidence.jpg", jpg_content, "image/jpeg")},
        )
        assert r.status_code == 201
        assert r.json()["filename"] == "evidence.jpg"

    def test_upload_rejects_invalid_file(self, client):
        """Executable disguised as text should be rejected by magic-byte check."""
        io_tok, case_id = self._setup(client)
        content = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00"
        r = client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MALWARE"},
            files={"file": ("bad.exe", content, "text/plain")},
        )
        assert r.status_code == 415

    def test_upload_version(self, client):
        """Upload v1 then v2 of the same document."""
        io_tok, case_id = self._setup(client)
        r1 = client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "CONTRACT"},
            files={"file": ("contract_v1.txt", b"Version 1 of the contract", "text/plain")},
        )
        assert r1.status_code == 201
        doc_id = r1.json()["id"]

        r2 = client.post(
            f"/api/v1/cases/{case_id}/documents/{doc_id}/versions",
            headers=auth_header(io_tok),
            files={"file": ("contract_v2.txt", b"Version 2 of the contract with updates", "text/plain")},
        )
        assert r2.status_code == 201
        assert r2.json()["version_number"] == 2

        versions = client.get(
            f"/api/v1/documents/{doc_id}/versions", headers=auth_header(io_tok),
        ).json()
        assert len(versions) == 2

    def test_document_integrity(self, client):
        """Integrity check should pass for freshly uploaded docs."""
        io_tok, case_id = self._setup(client)
        r = client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MEMO"},
            files={"file": ("integrity.txt", b"Check integrity of this document", "text/plain")},
        )
        doc_id = r.json()["id"]
        r2 = client.get(f"/api/v1/documents/{doc_id}/verify", headers=auth_header(io_tok))
        assert r2.status_code == 200
        assert r2.json()["valid"] is True

    def test_list_case_documents(self, client):
        io_tok, case_id = self._setup(client)
        client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MEMO"},
            files={"file": ("list_test.txt", b"Doc for listing", "text/plain")},
        )
        r = client.get(f"/api/v1/cases/{case_id}/documents", headers=auth_header(io_tok))
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_search_documents(self, client):
        io_tok, case_id = self._setup(client)
        client.post(
            f"/api/v1/cases/{case_id}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MEMO"},
            files={"file": ("searchable.txt", b"Unique searchable term: XYZZY123", "text/plain")},
        )
        r = client.get("/api/v1/documents/search?query=XYZZY123", headers=auth_header(io_tok))
        assert r.status_code == 200
        assert len(r.json()) >= 1


# ---------------------------------------------------------------------------
# 5. Audit Trail
# ---------------------------------------------------------------------------

class TestAuditTrail:
    def test_admin_can_view_audit_logs(self, client):
        register(client, "Admin Audit", "adminaudit@police.gov", "pass1234", "ADMIN")
        register(client, "IO Audit", "ioaudit2@police.gov", "pass1234", "IO")
        token = login(client, "adminaudit@police.gov", "pass1234").json()["access_token"]
        io_tok = login(client, "ioaudit2@police.gov", "pass1234").json()["access_token"]
        # Create some activity that generates audit logs
        io_id = me(client, io_tok)["id"]
        create_case(client, io_tok, "AUDIT-001", io_id)
        r = client.get("/api/v1/audit-logs", headers=auth_header(token))
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_non_admin_cannot_view_audit_logs(self, client):
        register(client, "IO Audit", "ioaudit@police.gov", "pass1234", "IO")
        token = login(client, "ioaudit@police.gov", "pass1234").json()["access_token"]
        r = client.get("/api/v1/audit-logs", headers=auth_header(token))
        assert r.status_code == 403

    def test_audit_chain_verification(self, client):
        register(client, "Admin Verify", "adminverify@police.gov", "pass1234", "ADMIN")
        token = login(client, "adminverify@police.gov", "pass1234").json()["access_token"]
        r = client.get("/api/v1/audit-logs/verify", headers=auth_header(token))
        assert r.status_code == 200
        assert r.json()["valid"] is True

    def test_audit_entries_have_hashes(self, client):
        register(client, "Admin Hash", "adminhash@police.gov", "pass1234", "ADMIN")
        token = login(client, "adminhash@police.gov", "pass1234").json()["access_token"]
        logs = client.get("/api/v1/audit-logs", headers=auth_header(token)).json()
        for log in logs:
            assert log.get("entry_hash"), f"Audit log {log['id']} missing entry_hash"


# ---------------------------------------------------------------------------
# 6. Comments (Collaboration)
# ---------------------------------------------------------------------------

class TestComments:
    def _setup(self, client):
        register(client, "IO Comment", "iocomment@police.gov", "pass1234", "IO")
        io_tok = login(client, "iocomment@police.gov", "pass1234").json()["access_token"]
        io_id = me(client, io_tok)["id"]
        case = create_case(client, io_tok, "COMMENT-001", io_id).json()
        doc = client.post(
            f"/api/v1/cases/{case['id']}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MEMO"},
            files={"file": ("comment.txt", b"Document for commenting", "text/plain")},
        ).json()
        return io_tok, doc["id"]

    def test_create_comment(self, client):
        io_tok, doc_id = self._setup(client)
        r = client.post(f"/api/v1/documents/{doc_id}/comments", headers=auth_header(io_tok),
                        json={"body": "This document looks suspicious"})
        assert r.status_code == 201
        assert r.json()["body"] == "This document looks suspicious"

    def test_list_comments(self, client):
        io_tok, doc_id = self._setup(client)
        client.post(f"/api/v1/documents/{doc_id}/comments", headers=auth_header(io_tok),
                    json={"body": "First comment"})
        r = client.get(f"/api/v1/documents/{doc_id}/comments", headers=auth_header(io_tok))
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_reply_to_comment(self, client):
        io_tok, doc_id = self._setup(client)
        r1 = client.post(f"/api/v1/documents/{doc_id}/comments", headers=auth_header(io_tok),
                         json={"body": "Parent"})
        parent_id = r1.json()["id"]
        r2 = client.post(f"/api/v1/documents/{doc_id}/comments", headers=auth_header(io_tok),
                         json={"body": "Reply", "parent_id": parent_id})
        assert r2.status_code == 201
        assert r2.json()["parent_id"] == parent_id

    def test_delete_own_comment(self, client):
        io_tok, doc_id = self._setup(client)
        r = client.post(f"/api/v1/documents/{doc_id}/comments", headers=auth_header(io_tok),
                        json={"body": "Delete me"})
        comment_id = r.json()["id"]
        r2 = client.delete(f"/api/v1/comments/{comment_id}", headers=auth_header(io_tok))
        assert r2.status_code == 204


# ---------------------------------------------------------------------------
# 7. Document Permissions
# ---------------------------------------------------------------------------

class TestPermissions:
    def _setup(self, client):
        register(client, "Admin Perm", "adminperm@police.gov", "pass1234", "ADMIN")
        register(client, "IO Perm", "ioperm@police.gov", "pass1234", "IO")
        register(client, "IO Target", "iotarget@police.gov", "pass1234", "IO")
        admin_tok = login(client, "adminperm@police.gov", "pass1234").json()["access_token"]
        io_tok = login(client, "ioperm@police.gov", "pass1234").json()["access_token"]
        target_id = me(client, login(client, "iotarget@police.gov", "pass1234").json()["access_token"])["id"]
        io_id = me(client, io_tok)["id"]
        case = create_case(client, io_tok, "PERM-001", io_id).json()
        doc = client.post(
            f"/api/v1/cases/{case['id']}/documents/upload",
            headers=auth_header(io_tok),
            data={"document_type": "MEMO"},
            files={"file": ("perm.txt", b"Document for permissions", "text/plain")},
        ).json()
        return admin_tok, io_tok, target_id, doc["id"]

    def test_grant_permission(self, client):
        admin_tok, _, target_id, doc_id = self._setup(client)
        r = client.post(f"/api/v1/documents/{doc_id}/permissions", headers=auth_header(admin_tok),
                        json={"user_id": target_id, "permission": "READ"})
        assert r.status_code == 201
        assert r.json()["permission"] == "READ"

    def test_list_permissions(self, client):
        admin_tok, _, target_id, doc_id = self._setup(client)
        client.post(f"/api/v1/documents/{doc_id}/permissions", headers=auth_header(admin_tok),
                    json={"user_id": target_id, "permission": "READ"})
        r = client.get(f"/api/v1/documents/{doc_id}/permissions", headers=auth_header(admin_tok))
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_revoke_permission(self, client):
        admin_tok, _, target_id, doc_id = self._setup(client)
        client.post(f"/api/v1/documents/{doc_id}/permissions", headers=auth_header(admin_tok),
                    json={"user_id": target_id, "permission": "READ"})
        r = client.delete(f"/api/v1/documents/{doc_id}/permissions/{target_id}",
                          headers=auth_header(admin_tok))
        assert r.status_code == 204

    def test_non_admin_cannot_grant(self, client):
        _, io_tok, target_id, doc_id = self._setup(client)
        r = client.post(f"/api/v1/documents/{doc_id}/permissions", headers=auth_header(io_tok),
                        json={"user_id": target_id, "permission": "READ"})
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# 8. Blockchain
# ---------------------------------------------------------------------------

class TestBlockchain:
    def test_list_blocks(self, client):
        register(client, "Admin BC", "adminbc@police.gov", "pass1234", "ADMIN")
        token = login(client, "adminbc@police.gov", "pass1234").json()["access_token"]
        r = client.get("/api/v1/blockchain", headers=auth_header(token))
        assert r.status_code == 200

    def test_mine_and_verify(self, client):
        register(client, "Admin Mine", "adminmine@police.gov", "pass1234", "ADMIN")
        token = login(client, "adminmine@police.gov", "pass1234").json()["access_token"]
        # Mine a block (may succeed or return 409 if no pending logs)
        r = client.post("/api/v1/blockchain/mine", headers=auth_header(token))
        assert r.status_code in [201, 409]
        # Verify chain
        r2 = client.get("/api/v1/blockchain/verify", headers=auth_header(token))
        assert r2.status_code == 200
        assert r2.json()["valid"] is True

    def test_non_admin_cannot_mine(self, client):
        register(client, "IO BC", "iobc@police.gov", "pass1234", "IO")
        token = login(client, "iobc@police.gov", "pass1234").json()["access_token"]
        r = client.post("/api/v1/blockchain/mine", headers=auth_header(token))
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# 9. Compliance / Retention
# ---------------------------------------------------------------------------

class TestCompliance:
    def test_get_retention_status(self, client):
        register(client, "Admin Comp", "admincomp@police.gov", "pass1234", "ADMIN")
        token = login(client, "admincomp@police.gov", "pass1234").json()["access_token"]
        r = client.get("/api/v1/compliance/retention", headers=auth_header(token))
        assert r.status_code == 200
        data = r.json()
        assert "retention_days" in data
        assert "cutoff_date" in data

    def test_enforce_retention(self, client):
        register(client, "Admin Enf", "adminenf@police.gov", "pass1234", "ADMIN")
        token = login(client, "adminenf@police.gov", "pass1234").json()["access_token"]
        r = client.post("/api/v1/compliance/retention/enforce", headers=auth_header(token))
        assert r.status_code == 200
        assert "archived_count" in r.json()

    def test_non_admin_cannot_enforce(self, client):
        register(client, "IO Comp", "iocomp@police.gov", "pass1234", "IO")
        token = login(client, "iocomp@police.gov", "pass1234").json()["access_token"]
        r = client.post("/api/v1/compliance/retention/enforce", headers=auth_header(token))
        assert r.status_code == 403
