# ⚙️ Multi Kreasi Printing — Backend API Service

API Service untuk platform Multi Kreasi Printing, dibangun menggunakan NestJS 11, Prisma ORM, PostgreSQL, Redis, dan BullMQ.

Proyek ini merupakan bagian dari portofolio pembelajaran full-stack oleh **[Rohan (rohandev19)](https://github.com/rohandev19)**.

---

## 🛠️ Tech Stack Backend

- **Framework:** NestJS 11 (Express platform)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma 7
- **Caching & Rate Limiting:** Redis + `@nest-lab/throttler-storage-redis`
- **Background Queue:** BullMQ
- **File Storage:** AWS S3 SDK (Cloudflare R2 compatible)
- **PDF Generation:** PDFKit
- **Real-time:** Socket.IO
- **Security:** Helmet, bcrypt, JWT, CASL RBAC
- **Resilience:** Opossum (Circuit Breaker)

---

## 🚀 Menjalankan Secara Lokal

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

## 🧪 Pengujian (Tests)

```bash
# Menjalankan unit & integration test
npm run test

# Menjalankan test coverage
npm run test:cov
```

---

## 📄 Lisensi

[MIT License](../LICENSE)
