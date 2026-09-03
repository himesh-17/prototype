import io
from hashlib import sha256
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png", "text/plain"}
EXTENSIONS = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "text/plain": ".txt",
}


def detect_content_type(sample: bytes, declared_type: str | None) -> str | None:
    if sample.startswith(b"%PDF-"):
        return "application/pdf"
    if sample.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if sample.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if declared_type == "text/plain":
        try:
            text = sample.decode("utf-8")
        except UnicodeDecodeError:
            return None
        if "\x00" not in text:
            return "text/plain"
    return None


def safe_original_filename(filename: str | None) -> str:
    name = Path(filename or "document").name.strip()
    if not name or name in {".", ".."}:
        return "document"
    return name[:255]


def store_upload(upload: UploadFile, *, case_id: int, document_id: int, version_number: int) -> tuple[str, str, int, str]:
    sample = upload.file.read(8192)
    content_type = detect_content_type(sample, upload.content_type)
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only PDF, PNG, JPEG, and UTF-8 text documents are accepted")

    upload.file.seek(0)
    directory = Path(settings.DOCUMENT_STORAGE_PATH).resolve() / str(case_id) / str(document_id)
    directory.mkdir(parents=True, exist_ok=True)
    stored_name = f"v{version_number}-{uuid4().hex}{EXTENSIONS[content_type]}"
    destination = directory / stored_name
    digest = sha256()
    size = 0

    try:
        with destination.open("xb") as output:
            while chunk := upload.file.read(1024 * 1024):
                size += len(chunk)
                if size > settings.MAX_DOCUMENT_SIZE_BYTES:
                    raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Document exceeds the maximum allowed size")
                digest.update(chunk)
                output.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise

    return str(destination), content_type, size, digest.hexdigest()


def extract_ocr_text(path: str, content_type: str) -> tuple[str | None, str]:
    data = Path(path).read_bytes()
    if content_type == "text/plain":
        return data.decode("utf-8"), "COMPLETED"
    if content_type == "application/pdf":
        try:
            from pypdf import PdfReader

            text = "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(data)).pages).strip()
            return text or None, "COMPLETED"
        except Exception:
            return None, "FAILED"
    try:
        from PIL import Image
        import pytesseract

        text = pytesseract.image_to_string(Image.open(io.BytesIO(data))).strip()
        return text or None, "COMPLETED"
    except Exception:
        return None, "UNAVAILABLE"
