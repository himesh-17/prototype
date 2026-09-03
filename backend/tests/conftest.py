from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.database import Base, get_db
from app.db.models import RoleEnum, User
from app.main import app


@pytest.fixture()
def client(tmp_path: Path):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    original_storage_path = settings.DOCUMENT_STORAGE_PATH
    settings.DOCUMENT_STORAGE_PATH = str(tmp_path / "documents")

    def override_get_db():
        db = session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    settings.DOCUMENT_STORAGE_PATH = original_storage_path
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def admin_token(client: TestClient) -> str:
    return create_user_token(client, "admin@police.gov", RoleEnum.ADMIN)


@pytest.fixture()
def io_token(client: TestClient) -> str:
    return create_user_token(client, "io@police.gov", RoleEnum.IO)


def create_user_token(client: TestClient, email: str, role: RoleEnum) -> str:
    db = next(app.dependency_overrides[get_db]())
    try:
        user = User(name=role.value, email=email, password_hash=get_password_hash("password"), role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return create_access_token({"sub": str(user.id)})
    finally:
        db.close()


@pytest.fixture()
def case_id(client: TestClient, io_token: str) -> int:
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {io_token}"}).json()
    response = client.post(
        "/api/v1/cases",
        headers={"Authorization": f"Bearer {io_token}"},
        json={"case_number": "CASE-DOCUMENT-1", "title": "Document workflow", "assigned_io_id": me["id"]},
    )
    assert response.status_code == 200
    return response.json()["id"]
