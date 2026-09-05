from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import audit, auth, cases, assets, documents, comments, permissions, blockchain, compliance
from app.core.config import settings
from app.db.database import engine, Base

# NOTE: Not creating tables here because we use Alembic. 
# Base.metadata.create_all(bind=engine) - AVOID THIS.

app = FastAPI(title="Nyaya Setu — National Digital Evidence & Case Lifecycle Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["cases"])
app.include_router(assets.router, prefix="/api/v1", tags=["assets"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(audit.router, prefix="/api/v1", tags=["audit"])
app.include_router(comments.router, prefix="/api/v1", tags=["comments"])
app.include_router(permissions.router, prefix="/api/v1", tags=["permissions"])
app.include_router(blockchain.router, prefix="/api/v1", tags=["blockchain"])
app.include_router(compliance.router, prefix="/api/v1", tags=["compliance"])

@app.get("/")
def read_root():
    return {"message": "API is running"}
