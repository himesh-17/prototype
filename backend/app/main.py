from fastapi import FastAPI
from app.api.v1 import auth, cases, assets, documents
from app.db.database import engine, Base

# NOTE: Not creating tables here because we use Alembic. 
# Base.metadata.create_all(bind=engine) - AVOID THIS.

app = FastAPI(title="Secure Police Asset & Document Lifecycle Management System")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cases.router, prefix="/api/v1/cases", tags=["cases"])
app.include_router(assets.router, prefix="/api/v1", tags=["assets"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])

@app.get("/")
def read_root():
    return {"message": "API is running"}
