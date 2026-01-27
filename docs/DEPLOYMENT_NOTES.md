# Catatan Deployment - BKN Visitor Logbook
**Tanggal:** 27 Januari 2026  
**Aplikasi:** DC Logbook (Visitor Management System)

---

## 📁 Repository GitLab

| Komponen | Repository | Branch |
|----------|------------|--------|
| Backend (FastAPI) | `https://codefarm.bkn.go.id/inti-apps/be-dc-logbook.git` | `main`, `development` |
| Frontend (React) | `https://codefarm.bkn.go.id/inti-apps/fe-dc-logbook.git` | `main`, `development` |

---

## 🌐 URL Deployment

| Environment | Frontend | Backend API |
|-------------|----------|-------------|
| **Development** | `dev-logbook.bkn.go.id` | `dev-api-logbook.bkn.go.id` |
| **Production** | `logbook.bkn.go.id` | `api-logbook.bkn.go.id` |

---

## ⚙️ Yang Sudah Disiapkan (oleh Developer)

1. **Dockerfile** - Sudah ada di masing-masing repository
   - Backend: Python 3.11 Alpine + FastAPI
   - Frontend: Node 22 + Nginx

2. **Jenkinsfile** - Sudah ada di root masing-masing repository
   - Otomatis build Docker image
   - Push ke Harbor registry
   - Deploy ke Kubernetes via kubectl

3. **Konfigurasi API URL** - Sudah dynamic
   - Branch `main` → Production API
   - Branch `development` → Development API

---

## 🔧 Yang Perlu Dilakukan Tim DevOps/Infra

### 1. Setup Jenkins Pipeline

Buat **2 pipeline** di Jenkins:

**Pipeline 1 - Backend:**
- Source: `https://codefarm.bkn.go.id/inti-apps/be-dc-logbook.git`
- Script Path: `Jenkinsfile`
- Branch: `main` dan `development`

**Pipeline 2 - Frontend:**
- Source: `https://codefarm.bkn.go.id/inti-apps/fe-dc-logbook.git`
- Script Path: `Jenkinsfile`
- Branch: `main` dan `development`

### 2. Pastikan Kredensial Jenkins Tersedia

| Credential ID | Tipe | Keterangan |
|---------------|------|------------|
| `registry` | Username/Password | Login ke Harbor (`harbor.bkn.go.id`) |
| `rancher-cluster-pusat` | Secret Text | Token untuk akses Kubernetes API |

### 3. Setup Kubernetes Resources

**Namespace yang dibutuhkan:**
- `dc-logbook` (Production)
- `dc-logbook-dev` (Development)

**Deployment yang dibutuhkan di setiap namespace:**

| Deployment Name | Image | Port |
|-----------------|-------|------|
| `be-dc-logbook` | `harbor.bkn.go.id/inti-apps/be-dc-logbook` | 8000 |
| `fe-dc-logbook` | `harbor.bkn.go.id/inti-apps/fe-dc-logbook` | 80 |

### 4. Environment Variables untuk Backend

Backend membutuhkan environment variables berikut (bisa via ConfigMap/Secret):

```yaml
DATABASE_URL: postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
SECRET_KEY: <random-256-bit-key>
ALLOWED_ORIGINS: https://dev-logbook.bkn.go.id,https://logbook.bkn.go.id
```

> **Catatan:** Generate SECRET_KEY dengan: `python -c "import secrets; print(secrets.token_hex(32))"`

### 5. Ingress Configuration

Pastikan Ingress sudah routing ke service yang benar:

| Domain | Target Service |
|--------|----------------|
| `dev-logbook.bkn.go.id` | `fe-dc-logbook` (port 80) |
| `dev-api-logbook.bkn.go.id` | `be-dc-logbook` (port 8000) |
| `logbook.bkn.go.id` | `fe-dc-logbook` (port 80) |
| `api-logbook.bkn.go.id` | `be-dc-logbook` (port 8000) |

---

## 🚀 Cara Deploy

Setelah semua setup selesai:

1. Push code ke branch `development` → Auto deploy ke Dev
2. Push code ke branch `main` → Auto deploy ke Production

Atau jalankan pipeline manual dari Jenkins.

---

## 📋 Checklist Sebelum Go-Live

- [ ] Jenkins pipeline Backend berjalan sukses
- [ ] Jenkins pipeline Frontend berjalan sukses
- [ ] Database PostgreSQL sudah ready dengan schema
- [ ] Admin user sudah dibuat di database
- [ ] SSL certificate sudah terpasang untuk semua domain
- [ ] Ingress routing sudah benar
- [ ] Health check endpoint `/health` merespons 200

---

## 📞 Kontak

Jika ada pertanyaan teknis tentang aplikasi, hubungi developer.
