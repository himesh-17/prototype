# Nyaya Setu — National Digital Evidence & Case Lifecycle Management System

> A cryptographically secured, role-based forensic and court case management platform designed for India's criminal justice system. Built for the National Crime Records Bureau (NCRB) to ensure tamper-proof evidence tracking, digital document integrity, and immutable audit trails.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Role-Based Access Control](#role-based-access-control)
- [Key Workflows](#key-workflows)
- [Security & Cryptographic Guarantees](#security--cryptographic-guarantees)
- [Technology Stack & Why Each Library](#technology-stack--why-each-library)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [API Endpoints](#api-endpoints)

---

## Problem Statement

India's criminal justice system handles millions of cases annually. Evidence management, document tracking, and chain of custody are still largely paper-based or use disconnected digital systems. This creates:

- **Evidence tampering risk** — No cryptographic verification that documents or evidence haven't been altered
- **Broken chain of custody** — Physical evidence transfers are hard to track and prove in court
- **Document duplication & loss** — Multiple copies across police stations, labs, and courts with no single source of truth
- **Audit gaps** — No immutable record of who accessed, modified, or transferred what and when
- **Role confusion** — Police, forensic labs, and courts all need different views of the same case

**Nyaya Setu** solves these problems with a unified, cryptographically secured platform.

---

## Solution Overview

Nyaya Setu is a **full-stack web application** that manages the complete lifecycle of a criminal case — from FIR registration through forensic analysis to judicial proceedings. Every action is cryptographically signed and chained, creating an immutable audit trail that holds up in court.

### Core Features

1. **Case Management** — Register, track, and manage criminal investigation files
2. **Document Vault** — Upload, version, and verify documents with SHA-256 hashing and digital signatures
3. **Evidence Chain of Custody** — Track physical evidence from seizure through lab analysis to court presentation
4. **Forensic Workstation** — CFSL experts can submit signed lab reports with hardware token authentication
5. **Court Document Portal** — Judges can view case documents, issue requisitions, and upload judicial orders
6. **Immutable Audit Trail** — Every action is Merkle-chained: each audit entry hashes the previous one, making tampering mathematically detectable
7. **Role-Based Access** — Four distinct roles with appropriate permissions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (React SPA)                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Dashboard│ │Cases     │ │Forensic  │ │Court Documents │  │
│  │          │ │Documents │ │Workstation│ │                │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│       └─────────────┴────────────┴───────────────┘           │
│                         │  REST API                          │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    FastAPI Backend                            │
│  ┌──────────┐  ┌────────┴────────┐  ┌──────────────────┐   │
│  │ JWT Auth │  │  API Routes     │  │  Services Layer   │   │
│  │ (HS256)  │  │  /auth /cases   │  │  Document Storage │   │
│  │          │  │  /documents     │  │  Audit Chain      │   │
│  │          │  │  /assets /audit │  │  Hash Generation  │   │
│  └────┬─────┘  └────────┬────────┘  └────────┬─────────┘   │
│       └─────────────────┴────────────────────┘              │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │   SQLAlchemy ORM    │                        │
│              │   (Alembic Migrations)│                       │
│              └──────────┬──────────┘                        │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │    SQLite Database   │                        │
│              │    (app.db)          │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

- **Offline-first demo** — The frontend works entirely without the backend using in-memory mock data. Every API call tries the real server first, then silently falls back to local data. This means the app is fully demonstrable without infrastructure.
- **Single-page application** — No page reloads, instant navigation, responsive design.
- **Defense in depth** — Authentication (JWT), authorization (role guards), cryptographic integrity (SHA-256), and audit logging.

---

## Database Design

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐
│  Users   │──────<│    Cases     │──────<│  Documents   │
│          │       │              │       │              │
│ id (PK)  │       │ id (PK)      │       │ id (PK)      │
│ name     │       │ case_number  │       │ case_id (FK) │
│ email    │       │ title        │       │ filename     │
│ password │       │ status       │       │ doc_type     │
│ role     │       │ priority     │       │ sha256_hash  │
│ badge_no │       │ assigned_io  │──┐    │ uploader_id  │
│ dept     │       │ acts_sections│  │    │ ocr_text     │
└──────────┘       │ court_juris. │  │    │ version      │
      │            └──────────────┘  │    └──────┬───────┘
      │                              │           │
      │            ┌──────────────┐  │    ┌──────┴───────┐
      └───────────>│   Assets     │<─┘    │DocVersions   │
                   │              │       │              │
                   │ id (PK)      │       │ version_no   │
                   │ asset_number │       │ sha256_hash  │
                   │ case_id (FK) │       │ stored_file  │
                   │ status       │       │ ocr_status   │
                   │ custodian    │       └──────────────┘
                   │ seal_number  │
                   │ location     │       ┌──────────────┐
                   └──────┬───────┘       │  AuditLogs   │
                          │               │              │
                   ┌──────┴───────┐       │ id (PK)      │
                   │AssetEvents   │       │ user_id (FK) │
                   │              │       │ action       │
                   │ action       │       │ entity_type  │
                   │ from/to user │       │ entity_id    │
                   │ location     │       │ entry_hash   │
                   │ seal_status  │       │ prev_hash    │
                   └──────────────┘       └──────────────┘
```

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | System users (IO, Judge, Forensic Expert, Admin) | `id`, `name`, `email`, `password_hash`, `role`, `badge_number`, `department` |
| **cases** | Criminal investigation files | `id`, `case_number` (unique), `title`, `status`, `priority`, `assigned_io_id`, `acts_sections`, `court_jurisdiction`, `hearing_date` |
| **documents** | Digital documents attached to cases | `id`, `case_id`, `filename`, `document_type`, `sha256_hash`, `uploader_id`, `current_version`, `ocr_text` |
| **document_versions** | Version history for each document | `id`, `document_id`, `version_number`, `sha256_hash`, `stored_filename`, `ocr_status` |
| **assets** | Physical evidence items | `id`, `asset_number`, `case_id`, `name`, `status`, `current_custodian_id`, `seal_number`, `location` |
| **asset_lifecycle_events** | Chain of custody transfers | `id`, `asset_id`, `action`, `from_user_id`, `to_user_id`, `location`, `seal_status`, `remarks` |
| **audit_logs** | Immutable audit trail | `id`, `user_id`, `action`, `entity_type`, `entity_id`, `entry_hash`, `previous_hash` |

### Status Enums

**Case Status:** `OPEN` → `CLOSED` → `ARCHIVED`

**Asset Status:** `LOGGED` → `IN_TRANSIT` → `IN_LAB` → `IN_COURT` → `ARCHIVED` / `DISPOSED`

**Document Types:** FIR, Witness Statement, Forensic Report, Evidence, Seizure Memo, Judicial Order

**Classification Levels:** Confidential, Secret, Top Secret

---

## Role-Based Access Control

### Four Roles

| Role | Badge Example | Department | Access |
|------|---------------|------------|--------|
| **ADMIN** | NCRB-HQ-001 | National Crime Records Bureau | Full access: all cases, audit trail, user management |
| **IO** (Investigating Officer) | DL-CR-4402 | Cyber Crime Police Station | Cases assigned to them, evidence logging, document upload |
| **JUDGE** | JUD-DEL-089 | Special CBI & Cyber Court | Court documents, judicial orders, case documents read-only |
| **FORENSIC_EXPERT** | CFSL-BIO-772 | Central Forensic Science Laboratory | Evidence intake, lab reports, forensic workstation |

### Permission Matrix

| Action | ADMIN | IO | JUDGE | FORENSIC_EXPERT |
|--------|-------|-----|-------|-----------------|
| View all cases | ✅ | ❌ (own only) | ✅ (court-assigned) | ❌ |
| Create cases | ✅ | ✅ | ❌ | ❌ |
| Upload documents | ✅ | ✅ | ✅ (judicial orders) | ✅ (forensic reports) |
| Evidence intake | ✅ | ✅ | ❌ | ✅ |
| Transfer custody | ✅ | ✅ | ❌ | ✅ |
| View audit trail | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Verify document integrity | ✅ | ✅ | ✅ | ✅ |

---

## Key Workflows

### 1. Document Upload & Integrity

```
User uploads document
    │
    ├─> File stored in /document_storage/{case_id}/{doc_id}/
    ├─> SHA-256 hash computed and stored
    ├─> Digital signature metadata recorded (signer, CA, timestamp)
    ├─> OCR text extracted (Tesseract/external)
    ├─> Version number incremented
    └─> Audit log entry created with chained hash
```

### 2. Evidence Chain of Custody

```
Evidence seized at crime scene
    │
    ├─> Asset logged with seal number, barcode
    ├─> Custody event: EVIDENCE_SEIZED (from crime scene → IO)
    │
    ├─> Transferred to Malkhana (evidence locker)
    ├─> Custody event: TRANSIT_TO_MALKHANA (IO → Malkhana keeper)
    │
    ├─> Sent to CFSL for forensic analysis
    ├─> Custody event: TRANSFER_TO_CFSL (Malkhana → Escort officer)
    │
    ├─> Received at CFSL lab
    ├─> Custody event: LAB_INTAKE_RECEIVED (Escort → Forensic expert)
    │
    └─> Each event records: from whom, to whom, where, when,
        seal status, and cryptographic hash verification
```

### 3. Audit Trail (Merkle Chain)

```
Every action in the system creates an audit log entry:

Entry N:
  - action: "UPLOAD_DOCUMENT"
  - entity: "Document #5"
  - user: "Inspector Deshmukh"
  - timestamp: "2026-09-03T05:15:20Z"
  - previous_hash: "8f4c19a2..."  ← hash of Entry N-1
  - entry_hash: SHA-256(action + entity + user + timestamp + previous_hash)

This creates a chain: Entry_0 ← Entry_1 ← Entry_2 ← ... ← Entry_N

If anyone tampers with Entry_3, Entry_4's previous_hash won't match,
and Entry_5 through Entry_N are all invalidated.
Mathematical proof of tampering.
```

---

## Security & Cryptographic Guarantees

| Mechanism | Implementation | Purpose |
|-----------|---------------|---------|
| **SHA-256 Hashing** | Every document gets a SHA-256 hash at upload | Detect any file modification |
| **Digital Signatures** | Metadata tracks signer, certificate authority, timestamp, key ID | Prove document authenticity |
| **Merkle-Chained Audit** | Each audit entry hashes the previous one | Tamper-evident audit trail |
| **JWT Authentication** | HS256 tokens with expiry | Secure API access |
| **Role Guards** | Backend middleware + frontend route protection | Enforce least-privilege access |
| **Seal Tracking** | Physical seal numbers recorded with every custody event | Evidence integrity verification |

---

## Technology Stack & Why Each Library

### Backend

| Technology | Version | Why |
|------------|---------|-----|
| **Python** | 3.11+ | Rapid development, strong ecosystem for security/crypto libraries |
| **FastAPI** | 0.115+ | High-performance async API framework with automatic OpenAPI docs, type validation via Pydantic |
| **SQLAlchemy** | 2.0+ | Industry-standard Python ORM with mature relationship mapping and migration support |
| **Alembic** | 1.13+ | Database migration tool built for SQLAlchemy — tracks schema changes version-by-version |
| **SQLite** | — | Zero-config embedded database, perfect for demo/prototype. Easily swappable to PostgreSQL for production |
| **Pydantic** | 2.9+ | Data validation and settings management. FastAPI uses it for request/response schemas |
| **pydantic-settings** | 2.0+ | Environment variable management with type safety |
| **python-jose** | 3.3+ | JWT token creation and verification (HS256 algorithm) |
| **passlib + bcrypt** | — | Secure password hashing (bcrypt is the industry standard for password storage) |
| **python-multipart** | — | Required by FastAPI for file upload handling (multipart/form-data) |
| **pypdf** | 5.0+ | PDF text extraction for OCR pipeline |
| **Pillow** | 10.0+ | Image processing for document thumbnail generation |
| **pytesseract** | 0.3.10+ | OCR (Optical Character Recognition) for extracting text from scanned documents |
| **httpx** | 0.27+ | Async HTTP client for testing and external API calls |
| **ruff** | 0.6+ | Fast Python linter (replaces flake8 + isort + more) |
| **mypy** | 1.11+ | Static type checker for Python |
| **bandit** | 1.7+ | Security-focused linter that finds common Python security issues |
| **pytest** | 8.0+ | Python testing framework with fixture support |

### Frontend

| Technology | Version | Why |
|------------|---------|-----|
| **React** | 19.2+ | Component-based UI library. Largest ecosystem, excellent for complex dashboards with many interactive elements |
| **React Router** | 7.18+ | Client-side routing for SPA navigation. Handles protected routes and role-based access |
| **Vite** | 8.2+ | Next-gen build tool — instant HMR, fast builds, native ESM. Replaced Create React App |
| **Tailwind CSS** | 4.3+ | Utility-first CSS framework. Enables rapid UI development without writing custom CSS files |
| **Lucide React** | 1.39+ | Clean, consistent icon library (1000+ icons). Lightweight, tree-shakeable |
| **date-fns** | 4.4+ | Modern date utility library. Used for formatting dates in Indian locale |
| **jwt-decode** | 4.0+ | Client-side JWT token decoding for checking expiry and extracting user info |
| **Oxlint** | 1.79+ | Fast Rust-based linter for JavaScript/TypeScript. Replaces ESLint for this project |

### Why Not X?

| Alternative | Why We Didn't Use It |
|-------------|---------------------|
| PostgreSQL | SQLite is sufficient for prototype. No server setup needed. Schema is designed to be portable |
| Next.js | This is a pure frontend SPA. No SSR needed since data is fetched client-side |
| MongoDB | Relational data (cases → documents → versions → audit) fits a relational model better |
| GraphQL | REST is simpler for this scope. All data needs are predictable (not exploratory) |
| Redux | React Context + useState is sufficient for this app's state complexity |
| ESLint | Oxlint is 10-100x faster (written in Rust) |

---

## Project Structure

```
prototype/
├── backend/
│   ├── alembic/                    # Database migrations
│   │   ├── versions/
│   │   │   ├── 345ba_initial_migration.py
│   │   │   └── 93e4f_add_document_versions.py
│   │   └── env.py
│   ├── app/
│   │   ├── api/v1/                 # API route handlers
│   │   │   ├── auth.py             # Login, /me, user listing
│   │   │   ├── cases.py            # Case CRUD
│   │   │   ├── documents.py        # Document upload, verify, versions
│   │   │   ├── assets.py           # Asset tracking + custody
│   │   │   └── audit.py            # Audit log + chain verification
│   │   ├── core/
│   │   │   ├── config.py           # Settings from .env
│   │   │   ├── security.py         # JWT + password hashing
│   │   │   └── dependencies.py     # FastAPI dependency injection
│   │   ├── db/
│   │   │   ├── models.py           # SQLAlchemy models (7 tables)
│   │   │   └── database.py         # Engine + session
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── services/
│   │   │   └── document_storage.py # Filesystem storage handler
│   │   └── main.py                 # FastAPI app entry
│   ├── document_storage/           # Uploaded files
│   ├── tests/                      # pytest test suite
│   ├── seed.py                     # Demo data seeder
│   ├── requirements.txt
│   └── .env                        # Secrets (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── assets/                 # Static assets
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Sidebar + nav + role switcher
│   │   │   └── common/             # Reusable UI components
│   │   │       ├── StatCard.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── RoleSwitcher.jsx
│   │   │       ├── DocumentViewerModal.jsx
│   │   │       ├── DocumentUploadModal.jsx
│   │   │       └── HashChainModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state + role switching
│   │   ├── data/
│   │   │   └── mockData.js         # Demo data (users, cases, docs, assets)
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CaseList.jsx
│   │   │   ├── CaseDetail.jsx
│   │   │   ├── AssetDetail.jsx
│   │   │   ├── DocumentSearch.jsx
│   │   │   ├── AuditTrail.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── court/              # Court-specific pages
│   │   │   │   ├── CourtCaseDocuments.jsx
│   │   │   │   ├── DocumentRequestModal.jsx
│   │   │   │   └── JudgmentUploadModal.jsx
│   │   │   └── forensic/           # Forensic-specific pages
│   │   │       ├── ForensicWorkstation.jsx
│   │   │       ├── EvidenceIntakeModal.jsx
│   │   │       ├── ForensicReportModal.jsx
│   │   │       └── ChainOfCustodyModal.jsx
│   │   ├── services/
│   │   │   └── api.js              # API client with mock fallback
│   │   ├── App.jsx                 # Router + protected routes
│   │   ├── main.jsx                # React root
│   │   └── index.css               # Design tokens (CSS variables)
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind config (via @tailwindcss/vite)
└── 
```

---

## How to Run

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your JWT_SECRET

# Run database migrations
alembic upgrade head

# Seed demo data
python seed.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App available at: `http://localhost:5173`

**Note:** The frontend works without the backend running. It uses in-memory mock data as fallback.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/auth` | List all users |

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases` | List cases |
| POST | `/api/v1/cases` | Create case |
| GET | `/api/v1/cases/:id` | Get case detail |
| PUT | `/api/v1/cases/:id` | Update case |
| GET | `/api/v1/cases/:id/timeline` | Case timeline events |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases/:id/documents` | List case documents |
| POST | `/api/v1/cases/:id/documents/upload` | Upload document |
| GET | `/api/v1/documents/search` | Full-text search |
| GET | `/api/v1/documents/:id/versions` | Version history |
| POST | `/api/v1/documents/:id/versions` | Upload new version |
| GET | `/api/v1/documents/:id/verify` | Verify hash integrity |
| GET | `/api/v1/documents/:id/versions/:v/download` | Download version |

### Assets (Physical Evidence)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases/:id/assets` | List case assets |
| POST | `/api/v1/cases/:id/assets` | Log new asset |
| GET | `/api/v1/assets/:id` | Get asset detail |
| PUT | `/api/v1/assets/:id` | Update asset |
| POST | `/api/v1/assets/:id/transfer` | Transfer custody |
| GET | `/api/v1/assets/:id/events` | Custody event history |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit-logs` | List audit entries |
| GET | `/api/v1/audit-logs/verify` | Verify chain integrity |

---

## Design Tokens

The frontend uses CSS custom properties for consistent theming:

```css
--bg-base:        /* Page background */
--bg-overlay:     /* Cards, panels, elevated surfaces */
--bg-card:        /* Interactive card backgrounds */
--text-primary:   /* Headings, primary text */
--text-secondary: /* Descriptions, secondary text */
--text-tertiary:  /* Labels, captions, muted text */
--border-subtle:  /* Borders, dividers */
--danger-soft:    /* Error background */
--danger-base:    /* Error text/borders */
```

All components use these tokens instead of hardcoded Tailwind colors (`slate-*`, `zinc-*`), ensuring a consistent dark theme that can be restyled by changing a single CSS file.

---

## License

This project is a prototype built for demonstration purposes.

---

**Built with care for India's justice system.**
