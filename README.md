# 🖨️ Multi Kreasi Printing (MKP) — Enterprise Digital Platform
> **Personal Learning & Engineering Portfolio Project**  
> Dibuat dan dikembangkan oleh **[Rohan (rohandev19)](https://github.com/rohandev19)** sebagai pembuktian rancang bangun aplikasi web enterprise berskala penuh (*Full-Stack Commercial Printing Management System & ERP*).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2011-ea2849.svg)](https://nestjs.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue.svg)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-336791.svg)](https://neon.tech)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38bdf8.svg)](https://tailwindcss.com)

---

## 🌐 Live Demo & Deployment

Aplikasi ini sudah dideploy dan dapat diakses langsung secara publik:

- 🖥️ **Live Web Application (Frontend):** [http://mkprinting.my.id](http://mkprinting.my.id) *(atau [https://www.mkprinting.my.id](https://www.mkprinting.my.id))*
- ⚡ **Backend API Service:** [https://mkprinting-api-751b093a60df.herokuapp.com](https://mkprinting-api-751b093a60df.herokuapp.com)
- 🗄️ **Database:** PostgreSQL on Neon Serverless Cloud (`ap-southeast-1` AWS Singapore)
- ☁️ **Cloud Storage:** S3-compatible Object Storage (Cloudflare R2 / AWS S3) untuk berkas cetak resolusi tinggi

> **Catatan Pengunjung Portofolio:**  
> Anda dapat langsung menguji coba berbagai hak akses menggunakan [Akun Demo Siap Pakai](#-akun-demo-siap-pakai-seed-credentials) di bawah tanpa perlu mendaftar akun baru.

---

## 📖 Tentang Proyek Ini (Portfolio Overview)

**Multi Kreasi Printing (MKP)** adalah proyek portofolio pembelajaran independen yang memodelkan dan mendigitalisasi proses bisnis industri percetakan komersial secara *end-to-end* (B2B & B2C). 

Berangkat dari kompleksitas alur kerja percetakan riil—mulai dari kalkulasi estimasi bahan, pemeriksaan berkas grafis (*pre-flight check*), persetujuan cetak digital (*proofing gate*), antrean mesin produksi, logistik stok gudang, pengiriman parsial bersurat jalan, hingga penerbitan multi-faktur bertahap (DP 50% & Pelunasan)—proyek ini dibangun untuk mendemonstrasikan implementasi **Clean Architecture**, **Domain-Driven Design (DDD)**, dan sistem **Role-Based Access Control (RBAC)** 8 divisi kerja yang ketat dan saling terintegrasi.

---

## 🏗️ Arsitektur Sistem

Sistem mengadopsi pola arsitektur **Decoupled Modular Monolith** yang memisahkan tanggung jawab antara API Backend dan SPA Frontend secara tegas:

```
[ Frontend: React 19 + Vite + Tailwind CSS 4 ]
                      │  (REST API + WebSockets via Axios & Socket.IO)
                      ▼
[ Backend: NestJS 11 Modular Clean Architecture ]
   ├── RBAC & CASL Guards (8 Departemen)
   ├── Idempotency & Circuit Breaker (Opossum)
   ├── Rate Limiting & Throttler (Redis)
   ├── Automated Document Generation (PDFKit)
   └── Background Queues (BullMQ)
         │                    │                    │
         ▼                    ▼                    ▼
[ PostgreSQL (Neon) ]  [ Redis Broker ]   [ Cloudflare R2 / S3 ]
```

- **Backend (API Service):** Dibangun dengan NestJS 11 berorientasi modular dan Clean Architecture. Menggunakan Prisma ORM untuk komunikasi dengan PostgreSQL, Redis untuk caching, rate-limiting, dan antrean background job (BullMQ), serta Winston untuk audit logging terstruktur.
- **Frontend (Client Application):** Dibangun dengan React 19 dan Vite untuk performa kompilasi ultra-cepat. Validasi data formulir menggunakan React Hook Form + Zod, visualisasi analitik dengan Recharts, interaktivitas drag-and-drop dengan `@dnd-kit`, dan styling modern Tailwind CSS 4 dengan monochrome tokens.
- **Lapisan Real-Time:** WebSockets berbasis Socket.IO untuk pembaruan status pesanan langsung, notifikasi operator pabrik, dan modul Live Support interaktif dua arah antara pelanggan dan staf sales.

---

## 🛠️ Tech Stack Lengkap

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend Framework** | [NestJS 11](https://nestjs.com) | Node.js enterprise backend framework |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) | End-to-end type safety |
| **Database & ORM** | [PostgreSQL (Neon)](https://neon.tech) + [Prisma ORM](https://prisma.io) | Serverless relational database & type-safe queries |
| **Cache & Queue** | [Redis](https://redis.io) + [BullMQ](https://bullmq.io) | In-memory store, rate limiting & asynchronous worker |
| **Frontend Framework** | [React 19](https://react.dev) + [Vite](https://vitejs.dev) | High-performance SPA with modern React APIs |
| **UI & Styling** | [Tailwind CSS 4](https://tailwindcss.com) | Modern utility-first styling with design tokens |
| **Icons & Visuals** | [Phosphor Icons](https://phosphoricons.com) + [Three.js](https://threejs.org) | Rich icon pack & 3D box packaging preview |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Schema-based strict form validation |
| **File Storage** | AWS S3 SDK (Cloudflare R2 compatible) | Presigned URL upload/download up to 100MB |
| **PDF Generation** | [PDFKit](https://pdfkit.org) | Otomatisasi cetak Surat Jalan & Faktur Komersial |
| **Real-time Layer** | [Socket.IO](https://socket.io) | Gateway chat & push notifikasi status produksi |
| **Resilience & Security** | [Helmet](https://helmetjs.github.io), [Opossum](https://nodeshift.dev/opossum) | Circuit breaker, HTTP headers, & idempotency interceptor |
| **Testing & QA** | [Vitest](https://vitest.dev), [Supertest](https://github.com/ladjs/supertest), [k6](https://k6.io) | Unit, integration, & concurrent load testing |

---

## 👥 Role-Based Access Control (RBAC), Jobdesk & Fitur

Sistem menerapkan pembagian peran (*Role-Based Access Control*) 8 tingkatan dengan antarmuka dan wewenang yang disesuaikan dengan alur divisi percetakan:

### 📊 Matriks Hak Akses Antarmuka

| Modul / Fitur | Owner | Manager | Sales | Designer | Production | Warehouse | Finance | Customer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Executive / Divisional Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Kelola Produk & Varian** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Katalog & Pemesanan Publik** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manajemen Pesanan (Orders)** | ✅ | ✅ | ✅ | 👁️ (Read) | 👁️ (Read) | 👁️ (Read) | 👁️ (Read) | ❌ |
| **Pesanan Saya (Customer Tracking)**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Surat Penawaran (Quotations)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pengecekan Berkas Desain (Pre-Press)**| ✅ | ✅ | ❌ | ✅ | 👁️ (Read) | ❌ | ❌ | ❌ |
| **Persetujuan Proofing Berversi** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ (Approve) |
| **Antrean Produksi & Mesin** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Gudang, Stok & Bahan Baku** | ✅ | ✅ | ❌ | ❌ | 👁️ (Read) | ✅ | ❌ | ❌ |
| **Surat Jalan & Pengiriman (Shipments)**| ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | 👁️ (Own) |
| **Data Pelanggan (CRM)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Faktur & Multi-Invoicing (PDFKit)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | 👁️ (Own) |
| **Live Support (Layanan Chat Real-time)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (Client) |
| **Laporan Bisnis & Keuangan (AR Aging)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Manajemen Pengguna & Staf** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Log Audit Aktivitas (Audit Trail)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pengaturan Sistem Global** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔑 Akun Demo Siap Pakai (Seed Credentials)

Semua akun di bawah ini telah aktif pada deployment produksi live maupun saat menjalankan seeding lokal:

| Peran (Role) | Email Login | Password Default | Fokus Fitur & Tanggung Jawab |
| :--- | :--- | :--- | :--- |
| **Owner** | `admin@mkprinting.com` | `Admin@123!` | Akses penuh seluruh sistem, audit log forensik, & pengaturan global |
| **Manager** | `manager@mkprinting.com` | `Manager@123!` | Supervisi operasional, approval penawaran, & katalog produk |
| **Sales** | `sales@mkprinting.com` | `Sales@123!` | Surat penawaran (quotations), input order klien, & Live Chat Support |
| **Designer** | `designer@mkprinting.com` | `Designer@123!` | Pre-flight check file grafis, approval desain, & mockup proofing berversi |
| **Production Staff**| `production@mkprinting.com` | `Production@123!` | Antrean pengerjaan mesin cetak/finishing, & pelaporan insiden/kendala |
| **Warehouse Staff** | `warehouse@mkprinting.com` | `Warehouse@123!` | Penyesuaian stok bahan, SKU gudang, surat jalan, & proof of delivery |
| **Finance Staff** | `finance@mkprinting.com` | `Finance@123!` | Penerbitan faktur PDFKit, multi-invoicing, verifikasi bayar, & AR aging |
| **Customer** | `customer@example.com` | `Customer@123!` | Katalog, kalkulator estimasi 3D, unggah desain, tracking order, & invoice |

---

## 🚀 Menjalankan Proyek Secara Lokal (Local Development)

### Prasyarat
- Node.js versi 20.x atau 22.x
- PostgreSQL & Redis (bisa dijalankan via Docker)

### 1. Kloning Repositori
```bash
git clone https://github.com/rohandev19/multi-kreasi-printing.git
cd multi-kreasi-printing
```

### 2. Konfigurasi Backend
```bash
cd backend
npm install
cp .env.example .env
# Sesuaikan DATABASE_URL dan REDIS_URL pada file .env
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```
*Backend API akan berjalan di `http://localhost:3000`.*

### 3. Konfigurasi Frontend
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
*Frontend akan berjalan di `http://localhost:5173`.*

---

## 🔒 Fitur Rekayasa & Keamanan (Engineering Highlights)

- **Idempotency Interceptor:** Mencegah duplikasi transaksi dan pesanan ganda pada request pembayaran atau pembuatan invoice akibat jaringan tidak stabil.
- **Circuit Breaker Pattern (Opossum):** Melindungi layanan eksternal (cloud storage dan email) agar kegagalan upstream tidak menyebabkan *cascading failure*.
- **Strict Rate Limiting:** Pembatasan laju request API berbasis Redis melalui `@nestjs/throttler-storage-redis`.
- **Proofing Gate Workflow:** Sistem validasi otomatis di mana operator mesin cetak secara sistemik diblokir untuk memulai produksi sebelum berkas *digital proof* disetujui pelanggan.
- **Multi-Invoicing Engine:** Dukungan pembuatan beberapa invoice bertahap untuk satu pesanan (contoh: Down Payment 50% dan Invoice Pelunasan saat barang siap dikirim).
- **Automated PDF Engine:** Pembangkitan dokumen faktur dan surat jalan secara dinamis menggunakan PDFKit dengan penomoran standar industri.

---

## 🧭 Rencana Pengembangan Lanjutan (Roadmap)

Fitur-fitur yang direncanakan untuk tahap eksperimen berikutnya:
- [ ] **Payment Gateway Otomatis (Midtrans / Xendit Sandbox):** Otomatisasi pembayaran instan via QRIS dan Virtual Account.
- [ ] **Kalkulator Finishing Interaktif:** Perhitungan HPP bahan per centimeter persegi dan varian laminasi/spot UV dinamis di sisi server.
- [ ] **Multi-Branch Inventory:** Dukungan alokasi stok bahan baku antar multi-gudang dan workshop cabang.
- [ ] **Ekspor Format Pajak (e-Faktur):** Ekspor CSV skema faktur pajak DJP untuk transaksi B2B korporat.

---

## 📄 Lisensi (License)

Proyek ini dirilis di bawah lisensi terbuka **[MIT License](LICENSE)**.

Proyek ini dibangun secara independen oleh **[Rohan (rohandev19)](https://github.com/rohandev19)** semata-mata sebagai **portofolio pembelajaran dan eksplorasi rekayasa perangkat lunak full-stack**. Bebas dipelajari, dimodifikasi, dan dijadikan referensi studi perancangan aplikasi web enterprise.
