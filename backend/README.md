# Multi Kreasi Printing — Backend API Service

API Service untuk platform Multi Kreasi Printing, dibangun menggunakan NestJS 11, Prisma ORM, PostgreSQL, Redis, dan BullMQ.

Proyek ini merupakan bagian dari portofolio pembelajaran full-stack oleh **[Rohan (rohandev19)](https://github.com/rohandev19)**.

---

## Tech Stack Backend

- **Framework:** NestJS 11 (Express platform)
- **Language:** TypeScript 5 (Strict Mode, 0 explicit `any`)
- **Database:** PostgreSQL (Neon Serverless Cloud) dengan native sequences dan check constraints
- **ORM:** Prisma 7
- **Caching & Rate Limiting:** Redis + non-blocking `scanStream` + `@nest-lab/throttler-storage-redis`
- **Background Queue:** BullMQ
- **File Storage:** AWS S3 SDK (Cloudflare R2 compatible)
- **Image Processing:** Sharp dengan hardware-assisted `fastShrinkOnLoad`
- **Observability:** Sentry (`@sentry/nestjs`) untuk distributed tracing dan error tracking
- **PDF Generation:** PDFKit
- **Real-time:** Socket.IO dengan origin whitelisting
- **Security:** Helmet, bcrypt, JWT, CASL RBAC, SHA-256 token hashing
- **Resilience:** Opossum (Circuit Breaker), Idempotency Interceptor, SAGA compensation logic

---

## Menjalankan Secara Lokal

1. Salin konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Migrasi database dan seeding:
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```
4. Jalankan mode pengembangan:
   ```bash
   npm run start:dev
   ```

---

## Pengujian (Tests) & Kualitas Kode

```bash
# Menjalankan unit, integration, dan real PostgreSQL E2E test suite (162 tests)
npm run test

# Menjalankan test coverage
npm run test:cov

# Menjalankan linter (0 error, 0 warning)
npm run lint
```

---

## Lisensi

[MIT License](../LICENSE)
