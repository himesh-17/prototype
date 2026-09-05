"""Legacy API tests — refactored to use conftest client fixture."""
import pytest


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def register(client, name, email, password, role):
    return client.post("/api/v1/auth/register", json={
        "name": name, "email": email, "password": password, "role": role,
    })


def login(client, email, password):
    return client.post("/api/v1/auth/login", data={"username": email, "password": password})


def me(client, token):
    return client.get("/api/v1/auth/me", headers=auth_header(token)).json()


def test_register_user(client):
    response = register(client, "Test IO", "testio@police.gov", "testpassword", "IO")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testio@police.gov"
    assert data["role"] == "IO"
    assert "id" in data


def test_login_user(client):
    register(client, "Test IO Login", "testiologin@police.gov", "testpassword", "IO")
    response = login(client, "testiologin@police.gov", "testpassword")
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_invalid_login(client):
    register(client, "Bad PW", "badpw@police.gov", "testpassword", "IO")
    response = login(client, "badpw@police.gov", "wrongpassword")
    assert response.status_code == 401


def test_create_case_as_io(client):
    register(client, "IO Case", "iocasetest@police.gov", "iopassword", "IO")
    token = login(client, "iocasetest@police.gov", "iopassword").json()["access_token"]
    io_id = me(client, token)["id"]

    response = client.post("/api/v1/cases", headers=auth_header(token), json={
        "case_number": "CASE-1234", "title": "Robbery Test Case", "assigned_io_id": io_id,
    })
    assert response.status_code == 200
    assert response.json()["case_number"] == "CASE-1234"


def test_create_case_unauthorized_role(client):
    register(client, "Judge Unauth", "judgeunauth@police.gov", "judgepw", "JUDGE")
    jtok = login(client, "judgeunauth@police.gov", "judgepw").json()["access_token"]
    response = client.post("/api/v1/cases", headers=auth_header(jtok), json={
        "case_number": "CASE-999", "title": "Should fail", "assigned_io_id": 1,
    })
    assert response.status_code == 403


def test_create_asset(client):
    register(client, "IO Asset", "ioasset2@police.gov", "iopw", "IO")
    register(client, "Admin Asset", "adminasset2@police.gov", "adminpw", "ADMIN")
    io_tok = login(client, "ioasset2@police.gov", "iopw").json()["access_token"]
    io_id = me(client, io_tok)["id"]

    case = client.post("/api/v1/cases", headers=auth_header(io_tok), json={
        "case_number": "ASSET-CASE-2", "title": "Asset test", "assigned_io_id": io_id,
    }).json()

    response = client.post(f"/api/v1/cases/{case['id']}/assets", headers=auth_header(io_tok), json={
        "asset_number": "ASSET-001", "name": "Seized Laptop", "asset_type": "Electronics", "location": "Evidence Room A",
    })
    assert response.status_code == 200
    assert response.json()["asset_number"] == "ASSET-001"


def test_transfer_asset(client):
    register(client, "IO Transfer", "iotransfer@police.gov", "iopw", "IO")
    register(client, "Admin Transfer", "admintransfer@police.gov", "adminpw", "ADMIN")
    io_tok = login(client, "iotransfer@police.gov", "iopw").json()["access_token"]
    admin_tok = login(client, "admintransfer@police.gov", "adminpw").json()["access_token"]
    io_id = me(client, io_tok)["id"]
    admin_id = me(client, admin_tok)["id"]

    case = client.post("/api/v1/cases", headers=auth_header(io_tok), json={
        "case_number": "TRANSFER-CASE-1", "title": "Transfer test", "assigned_io_id": io_id,
    }).json()

    asset = client.post(f"/api/v1/cases/{case['id']}/assets", headers=auth_header(io_tok), json={
        "asset_number": "TRANSFER-AST-1", "name": "Laptop", "asset_type": "Electronics",
    }).json()

    response = client.post(f"/api/v1/assets/{asset['id']}/transfer", headers=auth_header(io_tok), json={
        "to_user_id": admin_id, "new_status": "IN_LAB", "remarks": "Transfer for analysis",
    })
    assert response.status_code == 200
    assert response.json()["status"] == "IN_LAB"


def test_document_upload(client):
    register(client, "IO Doc Upload", "iodocupload@police.gov", "iopw", "IO")
    io_tok = login(client, "iodocupload@police.gov", "iopw").json()["access_token"]
    io_id = me(client, io_tok)["id"]

    case = client.post("/api/v1/cases", headers=auth_header(io_tok), json={
        "case_number": "DOC-UPLOAD-1", "title": "Doc test", "assigned_io_id": io_id,
    }).json()

    response = client.post(f"/api/v1/cases/{case['id']}/documents/upload", headers=auth_header(io_tok),
                           data={"document_type": "MEMO"},
                           files={"file": ("seizure_memo.txt", b"Seizure memo", "text/plain")})
    assert response.status_code == 201
    assert response.json()["filename"] == "seizure_memo.txt"
    assert response.json()["sha256_hash"] != "PENDING"


def test_io_access_other_io_case(client):
    register(client, "IO Access1", "ioaccess1@police.gov", "iopw", "IO")
    register(client, "IO Access2", "ioaccess2@police.gov", "iopw", "IO")
    io1_tok = login(client, "ioaccess1@police.gov", "iopw").json()["access_token"]
    io2_tok = login(client, "ioaccess2@police.gov", "iopw").json()["access_token"]
    io1_id = me(client, io1_tok)["id"]

    case = client.post("/api/v1/cases", headers=auth_header(io1_tok), json={
        "case_number": "ACCESS-1", "title": "IO1 case", "assigned_io_id": io1_id,
    }).json()

    response = client.get(f"/api/v1/cases/{case['id']}", headers=auth_header(io2_tok))
    assert response.status_code == 403


def test_audit_logs(client):
    register(client, "Admin Audit Logs", "adminauditlogs@police.gov", "adminpw", "ADMIN")
    token = login(client, "adminauditlogs@police.gov", "adminpw").json()["access_token"]
    response = client.get("/api/v1/audit-logs", headers=auth_header(token))
    assert response.status_code == 200
