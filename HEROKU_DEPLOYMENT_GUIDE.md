# Heroku Deployment Guide — Multi Kreasi Printing

Panduan step-by-step untuk deploy platform ke **Heroku** sebagai 2 app terpisah:
- `mkprinting-api` — Backend (NestJS)
- `mkprinting-web` — Frontend (React/Vite)

---

## Prasyarat

1. **Heroku CLI** terinstal → [Install Guide](https://devcenter.heroku.com/articles/heroku-cli)
2. **Git** terinstal dan project sudah di-commit
3. **Heroku account** dengan billing aktif (Eco plan minimum)

```bash
# Verify Heroku CLI
heroku --version

# Login
heroku login
```

---

## Langkah 1: Buat Heroku Apps

```bash
# Backend app
heroku create mkprinting-api --remote heroku-backend

# Frontend app
heroku create mkprinting-web --remote heroku-frontend
```

> **Note**: Jika nama sudah diambil, Heroku akan generate random name. Kamu bisa rename nanti:
> ```bash
> heroku apps:rename mkprinting-api-rohan -a <generated-name>
> ```

---

## Langkah 2: Provision Add-ons (Backend)

```bash
# PostgreSQL (Essential-0: $5/mo)
heroku addons:create heroku-postgresql:essential-0 -a mkprinting-api

# Redis / Key-Value Store (Mini: $3/mo)
heroku addons:create heroku-redis:mini -a mkprinting-api
```

Heroku akan otomatis set `DATABASE_URL` dan `REDIS_URL` sebagai config vars.

Verifikasi:
```bash
heroku config -a mkprinting-api
# Harus ada DATABASE_URL dan REDIS_URL
```

---

## Langkah 3: Set Monorepo Buildpack

Karena repo ini monorepo (backend/ dan frontend/ dalam satu repo), kita perlu buildpack khusus agar Heroku tahu folder mana yang di-build.

```bash
# Backend — set subfolder
heroku buildpacks:clear -a mkprinting-api
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a mkprinting-api
heroku buildpacks:add heroku/nodejs -a mkprinting-api
heroku config:set PROJECT_PATH=backend -a mkprinting-api

# Frontend — set subfolder
heroku buildpacks:clear -a mkprinting-web
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a mkprinting-web
heroku buildpacks:add heroku/nodejs -a mkprinting-web
heroku config:set PROJECT_PATH=frontend -a mkprinting-web
```

---

## Langkah 4: Set Config Vars (Backend)

```bash
heroku config:set -a mkprinting-api \
  NODE_ENV=production \
  JWT_SECRET="$(openssl rand -hex 32)" \
  JWT_REFRESH_SECRET="$(openssl rand -hex 32)" \
  ALLOWED_ORIGINS="https://mkprinting-web-<hash>.herokuapp.com" \
  SMTP_HOST=smtp.gmail.com \
  SMTP_PORT=587 \
  SMTP_SECURE=false \
  SMTP_USER=your-email@gmail.com \
  SMTP_PASSWORD=your-app-password \
  "SMTP_FROM=Multi Kreasi Printing <noreply@multikreasi.com>" \
  R2_ACCOUNT_ID=your-cloudflare-account-id \
  R2_ACCESS_KEY_ID=your-r2-access-key \
  R2_SECRET_ACCESS_KEY=your-r2-secret-key \
  R2_BUCKET_NAME=multikreasi-storage \
  R2_PUBLIC_URL=https://storage.multikreasi.com \
  DB_POOL_MAX=10 \
  DB_POOL_MIN=2
```

> **PENTING**: Ganti `ALLOWED_ORIGINS` dengan URL frontend Heroku yang sebenarnya setelah deploy pertama.
>
> `DATABASE_URL` dan `REDIS_URL` sudah di-set otomatis oleh add-ons.

---

## Langkah 5: Set Config Vars (Frontend)

```bash
heroku config:set -a mkprinting-web \
  VITE_API_URL="https://mkprinting-api-<hash>.herokuapp.com" \
  NPM_CONFIG_PRODUCTION=false
```

> **PENTING**: `NPM_CONFIG_PRODUCTION=false` memastikan devDependencies (TypeScript, Vite, dll) terinstal saat build.
>
> Ganti `VITE_API_URL` dengan URL backend yang sebenarnya.

---

## Langkah 6: Deploy!

Ada dua cara untuk mendeploy code ke Heroku: **Via Heroku CLI (Git)** atau **Via GitHub Integration (Recommended)**.

### Opsi A: Deploy via GitHub (Recommended)

Heroku memiliki integrasi langsung dengan GitHub sehingga kamu bisa setup **Automatic Deploys** setiap kali ada push ke branch tertentu. Karena kita sudah setup `subdir-heroku-buildpack` di Langkah 3, Heroku akan otomatis tahu folder mana yang harus di-build!

1. Buka [Heroku Dashboard](https://dashboard.heroku.com/apps) di browser.
2. Klik app **mkprinting-api**.
3. Pergi ke tab **Deploy**.
4. Pada bagian **Deployment method**, pilih **GitHub**.
5. Klik **Connect to GitHub** dan beri akses (otorisasi) ke akun GitHub kamu.
6. Cari nama repository project ini, lalu klik **Connect**.
7. Pada bagian **Automatic deploys**, pilih branch yang ingin kamu deploy otomatis (misalnya `main` atau `develop`), lalu klik **Enable Automatic Deploys**.
8. Ulangi langkah 1-7 untuk app **mkprinting-web**.
9. Selesai! Sekarang setiap kali kamu merge/push ke branch tersebut di GitHub, Heroku akan otomatis mem-build dan mendeploy kedua aplikasi.

### Opsi B: Deploy via Heroku CLI (Git)

Jika kamu ingin deploy manual dari terminal lokal:

```bash
# Deploy backend
git push heroku-backend main

# Deploy frontend
git push heroku-frontend main
```

> Jika branch aktif kamu adalah `develop` dan ingin di-push ke main Heroku:
> ```bash
> git push heroku-backend develop:main
> git push heroku-frontend develop:main
> ```

---

## Langkah 7: Run Migrations & Seed

```bash
# Migrations otomatis via release phase (Procfile), tapi kalau pertama kali:
heroku run -a mkprinting-api npx prisma migrate deploy

# Seed data awal (roles, admin user, dll)
heroku run -a mkprinting-api npx ts-node prisma/seed.ts
```

---

## Langkah 8: Verifikasi

```bash
# Cek logs backend
heroku logs --tail -a mkprinting-api

# Cek logs frontend
heroku logs --tail -a mkprinting-web

# Health check
curl https://mkprinting-api-<hash>.herokuapp.com/api/v1/health

# Buka frontend di browser
heroku open -a mkprinting-web
```

---

## Update ALLOWED_ORIGINS

Setelah pertama kali deploy, kamu bisa lihat URL asli:

```bash
heroku info -a mkprinting-web
# Cari "Web URL"

# Update CORS di backend
heroku config:set -a mkprinting-api \
  ALLOWED_ORIGINS="https://mkprinting-web-xxxxx.herokuapp.com"
```

---

## Troubleshooting

### App crash / H10 error
```bash
heroku logs --tail -a mkprinting-api
# Cek apakah ada error env var yang kurang
```

### Build gagal (frontend)
```bash
# Pastikan devDependencies terinstal
heroku config:set NPM_CONFIG_PRODUCTION=false -a mkprinting-web
git push heroku-frontend develop:main
```

### Database connection refused
```bash
# Cek DATABASE_URL sudah ada
heroku config -a mkprinting-api | grep DATABASE_URL

# Restart dyno
heroku restart -a mkprinting-api
```

### Eco dyno sleep (cold start lambat)
Ini normal untuk Eco plan ($5/mo). Dyno tidur setelah 30 menit idle.
Untuk always-on, upgrade ke Basic:
```bash
heroku ps:type basic -a mkprinting-api
heroku ps:type basic -a mkprinting-web
```

---

## Estimasi Biaya Bulanan

| Item | Plan | Harga |
|---|---|---|
| Dyno pool | Eco (1000 dyno-hours/mo, shared) | $5/mo |
| Heroku Postgres | Essential-0 | $5/mo |
| Heroku Redis | Mini | $3/mo |
| **Total** | | **~$13/mo** |

---

## Cleanup (Hapus Apps)

```bash
heroku apps:destroy mkprinting-api --confirm mkprinting-api
heroku apps:destroy mkprinting-web --confirm mkprinting-web
```
