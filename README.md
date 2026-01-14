# 🏢 BKN Visitor Management System

> **Sistem Manajemen Pengunjung BKN** - Aplikasi enterprise-grade untuk mengelola kunjungan di lingkungan Badan Kepegawaian Negara (BKN).

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/Nyanns/bkn-visitor-app)
[![Security](https://img.shields.io/badge/Security-9.5%2F10-brightgreen)]()
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi)](https://fastapi.tiangolo.com)

**Current Version:** v2.0.0 (January 14, 2026)

---

## ✨ Key Features (v2.0.0)

### 🛡️ Enterprise Security Hardening (New)
- ✅ **Rate Limiting** - Protection against brute-force (10 req/min for check-ins, 3 req/min for exports).
- ✅ **Secure Downloads** - Blob-based authenticated downloads for sensitive documents.
- ✅ **CSRF Protection** - SameSite=Lax cookies enabled.
- ✅ **Smart Token Cleanup** - auto-removal of expired unique download tokens.
- ✅ **Admin Setup Lockdown** - Conditional endpoint registration (`ALLOW_SETUP_ADMIN` env var).

### 👤 Visitor Management
- **Self-Service Check-In/Out** - Fast NIK-based flow.
- **Smart Lookup** - Automatic detection of existing visitor data and task letters.
- **Photo & Document Management** - Secure upload/download of Photos, KTP, and Task Letters.
- **Real-time Status** - Live active visit tracking.

### 👨‍💼 Admin Dashboard
- **Real-time Analytics** - Live view of current visitors.
- **Excel Export Pro** - Generate comprehensive reports with secure, time-limited download links.
- **Master Data Management** - Full CRUD for Rooms and Companions.
- **Audit Logs** - Detailed activity tracking.

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (Recommended)
- OR Python 3.11+ & Node.js 20+ (Manual)

### 🐳 Docker Deployment (Recommended)

1.  **Clone Repository**
    ```bash
    git clone https://github.com/Nyanns/bkn-visitor-app.git
    cd bkn-visitor-app
    ```

2.  **Setup Environment**
    ```bash
    cp .env.docker.example .env
    # Edit .env and change SECRET_KEY and Postgres passwords!
    ```

3.  **Run Application**
    ```bash
    docker-compose up --build -d
    ```

4.  **Access App**
    - Visitor App: `http://localhost:5173`
    - Admin Panel: `http://localhost:5173/admin/login`
    - API Docs: `http://localhost:8000/api/docs`

### 🔧 Manual Setup (Dev)

1.  **Backend**
    ```bash
    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python -m uvicorn main:app --reload
    ```

2.  **Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 🔒 Security Configuration

### Environment Variables (`.env`)

Critical variables for security configuration:

```env
# Security
SECRET_KEY=change-this-to-super-secure-random-string-min-32-chars
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# CORS Protection
ALLOWED_ORIGINS=http://localhost:5173

# Admin Usage (IMPORTANT)
ALLOW_SETUP_ADMIN=false  # Set 'true' ONLY when creating first admin
```

### Setup Initial Admin
Since v2.0.0, the admin creation endpoint is disabled by default. To create an admin:

1.  Set `ALLOW_SETUP_ADMIN=true` in `.env`.
2.  Restart backend.
3.  Send POST request to `/setup-admin` (or use scripts).
4.  **IMMEDIATELY** set `ALLOW_SETUP_ADMIN=false` and restart.

---

## 📝 Changelog

### v2.0.0 (January 14, 2026) - Security & Stability Overhaul
- 🔒 **Security**: Implemented comprehensive Rate Limiting (SlowAPI) on critical endpoints.
- 🔒 **Security**: Added periodic cleanup for download tokens (APScheduler).
- 🔒 **Security**: Hardened `setup-admin` endpoint with conditional registration.
- 🐛 **Fix**: Resolved 404 errors on file downloads mechanism (Smart Lookup).
- 🐛 **Fix**: Fixed multiple backend instance conflict.
- ✨ **Feature**: Blob-based secure download for frontend clients.

### v1.6.x (December 2025)
- Docker optimizations
- Excel Export implementation
- Task Letter isolation

---

## 🤝 Support
Developed for **Badan Kepegawaian Negara (BKN)**.

**Copyright © 2026 BKN Indonesia.**
