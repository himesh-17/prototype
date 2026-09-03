import io

from fastapi.testclient import TestClient

from app.main import app


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_document_upload_search_version_download_and_integrity(client: TestClient, admin_token: str, case_id: int):
    first_upload = client.post(
        f"/api/v1/cases/{case_id}/documents/upload",
        headers=auth(admin_token),
        data={"document_type": "WITNESS_STATEMENT"},
        files={"file": ("statement.txt", io.BytesIO(b"Witness saw the blue vehicle near the station."), "text/plain")},
    )

    assert first_upload.status_code == 201
    document = first_upload.json()
    assert document["current_version"] == 1
    assert document["sha256_hash"] != "PENDING"
    assert document["ocr_text"] == "Witness saw the blue vehicle near the station."

    search = client.get(
        "/api/v1/documents/search",
        headers=auth(admin_token),
        params={"query": "blue vehicle"},
    )
    assert search.status_code == 200
    assert [result["id"] for result in search.json()] == [document["id"]]

    second_upload = client.post(
        f"/api/v1/cases/{case_id}/documents/{document['id']}/versions",
        headers=auth(admin_token),
        files={"file": ("statement-revised.txt", io.BytesIO(b"Witness confirmed the blue vehicle plate number."), "text/plain")},
    )
    assert second_upload.status_code == 201
    assert second_upload.json()["version_number"] == 2

    downloaded = client.get(
        f"/api/v1/documents/{document['id']}/versions/2/download",
        headers=auth(admin_token),
    )
    assert downloaded.status_code == 200
    assert downloaded.content == b"Witness confirmed the blue vehicle plate number."

    verification = client.get(
        f"/api/v1/documents/{document['id']}/verify",
        headers=auth(admin_token),
    )
    assert verification.status_code == 200
    assert verification.json()["valid"] is True


def test_upload_rejects_invalid_file_signature(client: TestClient, admin_token: str, case_id: int):
    response = client.post(
        f"/api/v1/cases/{case_id}/documents/upload",
        headers=auth(admin_token),
        data={"document_type": "FORENSIC_REPORT"},
        files={"file": ("report.pdf", io.BytesIO(b"not a PDF"), "application/pdf")},
    )

    assert response.status_code == 415


def test_audit_log_is_hash_chained_and_visible_only_to_admin(client: TestClient, admin_token: str, io_token: str):
    forbidden = client.get("/api/v1/audit-logs", headers=auth(io_token))
    assert forbidden.status_code == 403

    response = client.get("/api/v1/audit-logs/verify", headers=auth(admin_token))
    assert response.status_code == 200
    assert response.json()["valid"] is True
