from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, cases, assets, documents
from app.db.database import engine, Base

# NOTE: Not creating tables here because we use Alembic. 
# Base.metadata.create_all(bind=engine) - AVOID THIS.

app = FastAPI(title="Secure Police Asset & Document Lifecycle Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["cases"])
app.include_router(assets.router, prefix="/api/v1", tags=["assets"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])

@app.get("/")
def read_root():
    return {"message": "API is running"}
