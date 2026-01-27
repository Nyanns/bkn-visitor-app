# 🏢 BKN Visitor Management System

> **Sistem Manajemen Pengunjung BKN** - Aplikasi enterprise-grade untuk mengelola kunjungan di lingkungan Badan Kepegawaian Negara (BKN).

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/Nyanns/bkn-visitor-app)
[![Security](https://img.shields.io/badge/Security-9.5%2F10-brightgreen)]()
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.124.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)

**Current Version:** v2.0.0 (January 27, 2026)

---

## 📋 Table of Contents

- [Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
  - [Docker Deployment](#-docker-deployment-recommended)
  - [Manual/Local Development](#-manual-setup-local-development)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security](#-security-configuration)
- [Troubleshooting](#-troubleshooting)
- [Changelog](#-changelog)

---

## ✨ Key Features

### 🛡️ Enterprise Security Hardening
- ✅ **Rate Limiting** - Protection against brute-force (10 req/min for check-ins, 3 req/min for exports)
- ✅ **Secure Downloads** - Blob-based authenticated downloads for sensitive documents
- ✅ **CSRF Protection** - SameSite=Lax cookies enabled
- ✅ **Smart Token Cleanup** - Auto-removal of expired unique download tokens (APScheduler)
- ✅ **Admin Setup Lockdown** - Conditional endpoint registration (`ALLOW_SETUP_ADMIN` env var)

### 👤 Visitor Management
- **Self-Service Check-In/Out** - Fast NIK-based flow
- **Smart Lookup** - Automatic detection of existing visitor data and task letters
- **Photo & Document Management** - Secure upload/download of Photos, KTP, and Task Letters
- **Real-time Status** - Live active visit tracking

### 👨‍💼 Admin Dashboard
- **Real-time Analytics** - Live view of current visitors
- **Excel Export Pro** - Generate comprehensive reports with secure, time-limited download links
- **Master Data Management** - Full CRUD for Rooms and Companions
- **Audit Logs** - Detailed activity tracking

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | React + Vite | 19.2.0 |
| **Backend** | FastAPI + Uvicorn | 0.124.0 |
| **Database** | PostgreSQL (Production) / SQLite (Dev) | 15+ |
| **Auth** | JWT (python-jose) + Bcrypt | - |
| **Rate Limiting** | SlowAPI | 0.1.9 |
| **Scheduler** | APScheduler | 3.10.4 |
| **Container** | Docker + Docker Compose | - |

---

## 🚀 Quick Start

### Prerequisites

| Method | Requirements |
|--------|-------------|
| **Docker (Recommended)** | Docker 20+ & Docker Compose v2 |
| **Manual/Local Dev** | Python 3.11+ & Node.js 20+ |

---

### 🐳 Docker Deployment (Recommended)

Best for **production** and **quick testing**.

#### Step 1: Clone Repository

```bash
git clone https://github.com/Nyanns/bkn-visitor-app.git
cd bkn-visitor-app
```

#### Step 2: Setup Environment

```bash
# Copy example environment file
cp .env.docker.example .env

# Edit and configure your secrets
nano .env  # or use any text editor
```

> ⚠️ **IMPORTANT**: Change `SECRET_KEY` and `POSTGRES_PASSWORD` to secure random values!

#### Step 3: Generate Secure Secrets

```bash
# Generate SECRET_KEY (run in Python)
python -c "import secrets; print(secrets.token_hex(32))"

# Generate POSTGRES_PASSWORD
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

#### Step 4: Build and Run

```bash
# Build and start all services
docker-compose up --build -d

# View logs (optional)
docker-compose logs -f
```

#### Step 5: Access Application

| Service | URL |
|---------|-----|
| 🌐 **Visitor App** | http://localhost:5173 |
| 🔐 **Admin Panel** | http://localhost:5173/admin/login |
| 📚 **API Docs (Swagger)** | http://localhost:8000/docs |
| 📖 **API Docs (ReDoc)** | http://localhost:8000/redoc |

#### Docker Management Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v

# Restart specific service
docker-compose restart backend

# View container status
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
```

---

### 🔧 Manual Setup (Local Development)

Best for **development** and **debugging**.

#### Step 1: Clone Repository

```bash
git clone https://github.com/Nyanns/bkn-visitor-app.git
cd bkn-visitor-app
```

#### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (development mode with auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> 📝 **Note**: Configure `DATABASE_URL` in `backend/.env` to use PostgreSQL or SQLite.

#### Step 3: Setup Frontend (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> 💡 **Windows PowerShell Issue?** If you see "running scripts is disabled", run:
> ```powershell
> cmd /c "npm run dev"
> ```
> Or fix permanently: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

#### Step 4: Access Application

| Service | URL |
|---------|-----|
| 🌐 **Visitor App** | http://localhost:5173 |
| 🔐 **Admin Panel** | http://localhost:5173/admin/login |
| 📚 **API Docs** | http://localhost:8000/docs |

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key (min 32 chars) | `your-256-bit-secret-key-here` |
| `POSTGRES_USER` | PostgreSQL username | `bkn_admin` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secure_password_123` |
| `POSTGRES_DB` | Database name | `bkn_visitor` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | `http://localhost:5173` |
| `ALLOW_SETUP_ADMIN` | Enable admin creation endpoint | `false` |
| `DATABASE_URL` | Full database connection string | Auto-generated from Postgres vars |

### Example `.env` File

```env
# Security (REQUIRED - Change these!)
SECRET_KEY=your-super-secret-256-bit-key-minimum-32-characters
POSTGRES_USER=bkn_admin
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=bkn_visitor

# CORS (adjust for your domain in production)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80

# Admin Setup (enable ONLY during initial setup)
ALLOW_SETUP_ADMIN=false
```

---

## 📁 Project Structure

```
bkn-visitor-app/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Main application & API routes
│   ├── database.py            # SQLAlchemy models & DB config
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Backend container config
│   ├── uploads/               # Uploaded photos (KTP, profile)
│   ├── task_letters/          # Task letter documents
│   ├── logs/                  # Application logs
│   └── backups/               # Database backups
│
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   └── utils/             # Utility functions
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── Dockerfile             # Frontend container config
│
├── docs/                       # Documentation
│   └── TECHNICAL_DOCS.md      # Technical diagrams & ERD
│
├── docker-compose.yml          # Docker orchestration
├── .env.docker.example         # Environment template
└── README.md                   # This file
```

---

## 📖 API Documentation

Once the backend is running, access interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/check-in/` | Visitor check-in |
| `POST` | `/check-out/{nik}` | Visitor check-out |
| `GET` | `/visitors/{nik}` | Get visitor details |
| `POST` | `/admin/login` | Admin authentication |
| `GET` | `/admin/visitors` | List all visitors (Admin) |
| `GET` | `/admin/export/excel` | Export data to Excel (Admin) |
| `POST` | `/setup-admin` | Create initial admin (requires env flag) |

---

## 🔒 Security Configuration

### Initial Admin Setup

Since v2.0.0, the admin creation endpoint is **disabled by default** for security.

**To create your first admin:**

1. Set `ALLOW_SETUP_ADMIN=true` in `.env`
2. Restart the backend service
3. Create admin via API:
   ```bash
   curl -X POST http://localhost:8000/setup-admin \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "your_secure_password"}'
   ```
4. **IMMEDIATELY** set `ALLOW_SETUP_ADMIN=false` and restart
5. Access admin panel at `/admin/login`

### Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | Bcrypt (passlib) |
| Session Tokens | JWT with expiration |
| Rate Limiting | SlowAPI (configurable per-endpoint) |
| CORS | Configurable allowed origins |
| File Validation | MIME type + extension check |
| Token Cleanup | APScheduler (hourly cleanup) |

---

## 🔧 Troubleshooting

### Common Issues

#### 1. PowerShell Script Execution Error (Windows)

```
npm : running scripts is disabled on this system
```

**Solution:**
```powershell
# Option 1: Use CMD
cmd /c "npm run dev"

# Option 2: Change execution policy (permanent fix)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Port Already in Use

```
Port 5173 is in use, trying another one...
```

**Solution:** The app will automatically use the next available port (e.g., 5174). Check the terminal output for the actual URL.

#### 3. Database Connection Error (Docker)

```
connection refused
```

**Solution:** Wait for PostgreSQL to fully start. The healthcheck should handle this, but if issues persist:
```bash
docker-compose restart backend
```

#### 4. CORS Error

```
Access-Control-Allow-Origin
```

**Solution:** Ensure `ALLOWED_ORIGINS` in `.env` includes your frontend URL.

---

## 📝 Changelog

### v2.0.0 (January 27, 2026) - Security & Stability Overhaul
- 🔒 **Security**: Implemented comprehensive Rate Limiting (SlowAPI) on critical endpoints
- 🔒 **Security**: Added periodic cleanup for download tokens (APScheduler)
- 🔒 **Security**: Hardened `setup-admin` endpoint with conditional registration
- 🐛 **Fix**: Resolved 404 errors on file downloads mechanism (Smart Lookup)
- 🐛 **Fix**: Fixed multiple backend instance conflict
- ✨ **Feature**: Blob-based secure download for frontend clients
- 📚 **Docs**: Complete documentation overhaul with deployment guides

### v1.6.x (December 2025)
- Docker optimizations
- Excel Export implementation
- Task Letter isolation

---

## 🤝 Support

Developed for **Badan Kepegawaian Negara (BKN)**.

For technical documentation and diagrams, see [docs/TECHNICAL_DOCS.md](docs/TECHNICAL_DOCS.md).

**Copyright © 2026 BKN Indonesia.**
