# Multi Kreasi Printing (MKP) Enterprise Digital Platform

Multi Kreasi Printing (MKP) is an enterprise-grade digital platform designed to manage and scale commercial printing operations. This platform handles everything from product catalog management, order processing, and customer relationship management to invoice generation, production tracking, real-time customer support, and automated background jobs.

Designed for high availability, security, and performance, the system is capable of handling hundreds of thousands of daily requests through a robust architecture utilizing a modern technology stack.

---

## 🏗️ System Architecture Overview

The system follows a decoupled Clean Architecture, divided into a RESTful Backend and a Single Page Application (SPA) Frontend.

- **Backend (API Service):** Built with NestJS, providing a robust, modular, and scalable foundation. It uses Prisma as the ORM to communicate with a PostgreSQL database. Redis is heavily utilized for caching, rate limiting, session management, and background job queuing (via BullMQ).
- **Frontend (Client Application):** Built with React 19 and Vite, ensuring fast build times and a highly responsive user interface. State management and form handling are optimized with React Hook Form and Zod for strict type validation. Styling is powered by Tailwind CSS 4 with custom monochrome design tokens.
- **Infrastructure & Scaling:** Designed for deployment on PM2 cluster mode with Nginx as a reverse proxy. It incorporates Cloudflare R2 (AWS S3 compatible) for scalable object storage, managing large design files (up to 100MB).
- **Real-Time Layer:** WebSockets powered by Socket.IO for live order status updates, interactive Live Support customer chat, and real-time operator notifications.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **ORM:** Prisma ORM
- **Caching & Message Broker:** Redis
- **Background Jobs:** BullMQ
- **File Storage:** AWS S3 SDK (Compatible with Cloudflare R2)
- **Document Generation:** PDFKit (for invoices, delivery receipts, and reports)
- **Real-time Communication:** Socket.IO Gateway
- **Security:** Helmet, Throttler (Redis-backed), JWT Authentication, bcrypt, CASL RBAC Guard
- **Logging:** Winston (Structured JSON logging with daily rotation)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS 4 + Design Tokens
- **Icons:** Phosphor Icons
- **Form Management:** React Hook Form with Zod Resolvers
- **Data Visualization:** Recharts
- **Drag and Drop:** @dnd-kit
- **Client Networking:** Axios (with automatic token refresh interceptor)

### Testing & Quality Assurance
- **Unit & Integration Testing:** Vitest (Backend & Frontend)
- **Load Testing:** k6 (Simulating 100+ concurrent virtual users)
- **Code Quality:** ESLint, Prettier, Oxlint, Husky (Pre-commit hooks)

---

## 👥 Role-Based Access Control (RBAC), Jobdesk & Fitur

Platform Multi Kreasi Printing menerapkan sistem otorisasi ketat berbasis peran (*Role-Based Access Control*). Setiap peran memiliki tanggung jawab (*jobdesk*), wewenang, dan akses antarmuka yang disesuaikan secara presisi dengan alur bisnis percetakan komersial.

### 📊 Matriks Akses Fitur Berdasarkan Peran

| Modul / Fitur | Owner | Manager | Sales | Designer | Production | Warehouse | Finance | Customer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Executive / Divisional Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Kelola Produk & Varian** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Katalog & Pemesanan Publik** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manajemen Pesanan (Orders)** | ✅ | ✅ | ✅ | 👁️ (Read) | 👁️ (Read) | 👁️ (Read) | 👁️ (Read) | ❌ |
| **Pesanan Saya (Customer Tracking)**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Surat Penawaran (Quotations)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pengecekan Berkas Desain (Pre-Press)**| ✅ | ✅ | ❌ | ✅ | 👁️ (Read) | ❌ | ❌ | ❌ |
| **Antrean Produksi & Mesin** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Gudang, Stok & Bahan Baku** | ✅ | ✅ | ❌ | ❌ | 👁️ (Read) | ✅ | ❌ | ❌ |
| **Data Pelanggan (CRM)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Faktur & Pembayaran (Invoices)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | 👁️ (Own) |
| **Live Support (Layanan Chat)** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (Client) |
| **Laporan Bisnis & Keuangan** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Manajemen Staf & Pengguna** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Log Audit Aktivitas (Audit Trail)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pengaturan Sistem Global** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### 📋 Deskripsi Lengkap Jobdesk & Fitur Setiap Peran

#### 1. 👑 Owner (System Owner / Super Admin)
- **Jobdesk & Tanggung Jawab:**
  - Bertanggung jawab atas seluruh tata kelola teknis, strategis, dan operasional bisnis percetakan.
  - Mengonfigurasi parameter sistem tingkat tinggi, kredensial integrasi, dan kebijakan audit keamanan.
  - Memantau kesehatan performa bisnis secara menyeluruh dari aspek pendapatan, utilisasi pabrik, hingga kepuasan pelanggan.
- **Fitur-Fitur Utama:**
  - **Pengaturan Global (`/dashboard/settings`):** Konfigurasi identitas perusahaan, gateway email SMTP, dan kebijakan sistem. *(Konfigurasi payment gateway: lihat [Roadmap](#-roadmap-belum-diimplementasikan).)*
  - **Manajemen Akun Pengguna (`/dashboard/users`):** Membuat, mengubah hak akses, menetapkan peran, serta menonaktifkan akun staf dari seluruh departemen.
  - **Log Audit Forensik (`/dashboard/audit-log`):** Melacak seluruh jejak aktivitas pengguna (siapa mengubah apa, kapan, dan dari IP mana) untuk keamanan dan kepatuhan data.
  - **Akses Penuh:** Hak akses tanpa batasan ke seluruh modul pesanan, produksi, gudang, keuangan, laporan, dan live support.
- **Kredensial Default:** `admin@mkprinting.com` / `Admin@123!`

---

#### 2. 👔 Manager (Operational Manager)
- **Jobdesk & Tanggung Jawab:**
  - Mengawasi efisiensi operasional harian percetakan lintas divisi (sales, pra-cetak, workshop produksi, logistik, dan akuntansi).
  - Mengambil keputusan eskalasi, persetujuan penawaran harga berskala besar, serta penugasan ulang antrean produksi jika terjadi *bottleneck*.
  - Menganalisis laporan berkala untuk optimalisasi profitabilitas dan waktu perputaran pesanan (*turnaround time*).
- **Fitur-Fitur Utama:**
  - **Dashboard Operasional Terpadu:** Ringkasan metrik volume order, utilisasi mesin, dan pemenuhan SLA produksi.
  - **Kelola Produk & Harga (`/dashboard/products`):** Mengatur katalog produk, kategori, spesifikasi bahan, dan aturan harga kuantitas (*bulk pricing tier*).
  - **Kontrol Alur Pesanan (`/dashboard/orders`):** Mengesahkan, membatalkan, atau mengubah prioritas pengerjaan pesanan pelanggan.
  - **Supervisi Produksi (`/dashboard/production`):** Fitur *reassign job* ke operator lain jika terjadi kendala mesin, serta pemantauan kapasitas harian.
  - **Manajemen Hubungan Pelanggan & Staf:** Akses ke direktori pengguna, data pelanggan, penawaran, serta pemantauan log audit.
- **Kredensial Default:** `manager@mkprinting.com` / `Manager@123!`

---

#### 3. 💼 Sales (Sales & Customer Relations)
- **Jobdesk & Tanggung Jawab:**
  - Mengakuisisi pesanan baru, merespons pertanyaan pelanggan, dan menjalin komunikasi intensif dengan klien B2B maupun retail.
  - Menghitung estimasi biaya cetak kustom, menyusun surat penawaran harga (*quotations*), dan melakukan negosiasi harga.
  - Melayani konsultasi spesifikasi material dan finishing melalui saluran bantuan langsung (*Live Support*).
- **Fitur-Fitur Utama:**
  - **Manajemen Penawaran (`/dashboard/quotations`):** Membuat draf penawaran harga resmi, mengirimkannya ke pelanggan, dan mengonversinya langsung menjadi pesanan aktif ketika disetujui.
  - **Input & Pelacakan Pesanan (`/dashboard/orders`):** Memasukkan pesanan langsung atas nama pelanggan (*walk-in order / custom project*) serta memantau progresnya.
  - **Manajemen Pelanggan (`/dashboard/customers`):** Mengelola database pelanggan, kontak korporat, alamat pengiriman, dan riwayat pesanan.
  - **Bantuan Langsung / Live Support (`/dashboard/live-support`):** Chat interaktif dua arah berbasis WebSocket untuk merespons pesan calon pembeli secara real-time.
- **Kredensial Default:** `sales@mkprinting.com` / `Sales@123!`

---

#### 4. 🎨 Designer (Pre-Press & Graphic Specialist)
- **Jobdesk & Tanggung Jawab:**
  - Memeriksa kesiapan teknis berkas grafis pelanggan sebelum masuk ke mesin produksi (*pre-flight check*).
  - Memastikan resolusi berkas (minimal 300 DPI), kesesuaian ruang warna (CMYK vs RGB), margin bleed, safe zone, dan garis potong (*cut/die-cut marks*).
  - Membuat dan mengunggah proofing desain untuk persetujuan akhir (*approval*) oleh pelanggan.
- **Fitur-Fitur Utama:**
  - **Pengecekan Berkas Desain (`/dashboard/design`):** Akses ke berkas asli yang diunggah pelanggan (PDF, AI, TIFF, PSD, CDR, ZIP) dengan tautan aman pre-signed URL.
  - **Aksi Persetujuan Desain:** Tombol **Approve** (desain lolos uji cetak) atau **Reject** (desain tidak memenuhi syarat cetak) disertai alasan teknis mendalam yang dikirimkan ke pelanggan.
  - **Alur Kerja Proofing Berversi (`/dashboard/proofs`):** Pembuatan dan pengunggahan mockup digital proof berversi (v1, v2, v3), peninjauan catatan revisi pelanggan, serta sistem penguncian otomatis (*Proof Gate*) di mana mesin cetak tidak dapat memulai produksi sebelum proof disetujui pelanggan.
  - **Pemantauan Spesifikasi Pesanan (`/dashboard/orders`):** Meninjau detail catatan khusus terkait finishing cetak (laminasi, spot UV, hot foil, emboss).
- **Kredensial Default:** `designer@mkprinting.com` / `Designer@123!`

---

#### 5. ⚙️ Production Staff (Operator Produksi & Mesin)
- **Jobdesk & Tanggung Jawab:**
  - Menjalankan pekerjaan cetak dan finishing fisik di pabrik/workshop sesuai antrean (*job queue*).
  - Mengoperasikan mesin cetak (Digital Printing, Offset, Large Format UV/Solvent) dan mesin finishing (Potong, Pond, Laminasi, Jilid).
  - Melaporkan kendala operasional (*downtime*, kertas macet, tinta habis, cacat cetak) secara real-time.
- **Fitur-Fitur Utama:**
  - **Papan Antrean Produksi (`/dashboard/production`):** Pelacakan alur kerja pekerjaan: *Menunggu Produksi* ➔ *Sedang Dicetak* ➔ *Finishing* ➔ *Selesai*.
  - **Aksi Pembaruan Status Produksi:** Tombol aksi sekali klik untuk memulai produksi (*Start Production*) dan menyelesaikan tahapan pekerjaan (*Complete Job*).
  - **Pelaporan Kendala / Incident Report:** Formulir cepat untuk melaporkan kendala pada mesin atau bahan sehingga manajer dapat melakukan mitigasi segera.
  - **Unduh File Siap Cetak (`/dashboard/design`):** Mengunduh berkas print-ready resolusi tinggi untuk dialirkan ke Raster Image Processor (RIP) mesin cetak.
  - **Pengecekan Stok Kebutuhan (`/dashboard/warehouse`):** Melihat ketersediaan bahan baku di gudang sebelum memulai pengerjaan batch besar.
- **Kredensial Default:** `production@mkprinting.com` / `Production@123!`

---

#### 6. 📦 Warehouse Staff (Logistik & Gudang Material)
- **Jobdesk & Tanggung Jawab:**
  - Mengelola inventaris fisik bahan baku (kertas Art Carton, HVS, stiker vinyl, flexi banner, tinta, lem, dan bahan finishing).
  - Mencatat mutasi keluar-masuk barang dari pembelian pemasok maupun pemakaian produksi.
  - Menyiapkan pengepakan pesanan jadi (*packing*), mencetak surat jalan, dan menyerahkan barang ke ekspedisi/kurir.
- **Fitur-Fitur Utama:**
  - **Manajemen Inventaris (`/dashboard/warehouse`):** Katalog bahan baku lengkap dengan kode SKU, unit satuan, stok saat ini, dan batas stok minimum (*low stock threshold*).
  - **Penyesuaian Stok (*Stock Adjustment*):** Pencatatan mutasi stok: Penambahan (penerimaan barang dari supplier), Pengurangan (pengambilan produksi), atau Kerusakan (*damaged goods*).
  - **Pencatatan Pengiriman (*Record Shipment & Surat Jalan*):** Manajemen pengiriman terintegrasi (`/dashboard/shipments`), pencatatan nomor resi dan kurir, penerbitan surat jalan, pengiriman bertahap (parsial), serta konfirmasi bukti serah-terima barang (*Proof of Delivery*).
- **Kredensial Default:** `warehouse@mkprinting.com` / `Warehouse@123!`

---

#### 7. 💳 Finance Staff (Keuangan & Akuntansi)
- **Jobdesk & Tanggung Jawab:**
  - Mengelola penagihan piutang, menerbitkan faktur komersial (*invoices*), serta memverifikasi pembayaran pelanggan.
  - Melakukan rekonsiliasi pembayaran manual (transfer bank) maupun otomatis melalui payment gateway.
  - Menyusun laporan arus kas, omzet berkala, dan performa keuangan untuk laporan pajak dan audit internal.
- **Fitur-Fitur Utama:**
  - **Manajemen Faktur & Tagihan (`/dashboard/invoices`):** Menerbitkan faktur berformat PDF (PDFKit), mengirimkan faktur via email, mendukung multi-invoicing bertahap per pesanan (DP 50% & Pelunasan), serta mengelola jatuh tempo tagihan.
  - **Verifikasi Pembayaran (*Record Payment*):** Memvalidasi bukti transfer yang diunggah pelanggan dan mencatat pembayaran penuh/parsial pada faktur.
  - **Webhook Pembayaran:** Endpoint webhook generik tersedia; integrasi payment gateway spesifik (Midtrans/Xendit) masih *Roadmap*.
  - **Laporan Finansial (`/dashboard/reports`):** Grafik pendapatan, ringkasan pesanan, serta laporan umur piutang komprehensif (*AR Aging Report*).
  - **Manajemen Piutang & Kredit Pelanggan (`/dashboard/customers`):** Pengaturan plafon kredit (*Credit Limit*), syarat pembayaran (*Term of Payment* / TOP 14/30/45 hari), serta peringatan tagihan jatuh tempo (*overdue*).
- **Kredensial Default:** `finance@mkprinting.com` / `Finance@123!`

---

#### 8. 🛍️ Customer (Pelanggan Retail & Korporat)
- **Jobdesk & Alur Belanja:**
  - Pengguna akhir yang mencari kebutuhan cetak, menghitung estimasi biaya spesifik, mengunggah materi desain, dan bertransaksi.
  - Meninjau status pengerjaan secara transparan dari gawai/laptop tanpa perlu menghubungi customer service berulang kali.
- **Fitur-Fitur Utama:**
  - **Katalog Produk (`/products`):** Harga dasar dan harga bertingkat berdasarkan jumlah pesanan (*pricing tier*). *(Konfigurator opsi bahan/ukuran/finishing: Roadmap.)*
  - **Unggah Desain Berkas Besar:** Pengunggahan file hingga 100MB langsung ke cloud storage aman (Cloudflare R2).
  - **Pesanan Kustom (`/custom-order`):** Formulir pengajuan cetak di luar katalog untuk kebutuhan spesifikasi khusus.
  - **Pelacakan Pesanan Real-Time (`/dashboard/my-orders`):** Timeline status transparan: *Menunggu Desain ➔ Pemeriksaan Pra-Cetak ➔ Sedang Dicetak ➔ Finishing ➔ Siap Dikirim ➔ Selesai*.
  - **Pembayaran:** Transfer manual dengan unggah bukti pembayaran. *(Pembayaran instan QRIS / Virtual Account via payment gateway: Roadmap.)*
  - **Unduh Faktur Resmi:** Mengunduh bukti pembayaran dan invoice PDF resmi kapan saja dari akun dashboard pribadi.
  - **Live Support Widget:** Mengobrol langsung dengan tim support/sales melalui obrolan langsung real-time di website.
- **Kredensial Default:** `customer@example.com` / `Customer@123!`

---

## 🚀 Getting Started (Local Development)

Aplikasi membutuhkan Backend aktif terlebih dahulu agar Frontend dapat berfungsi penuh.

### 1. Backend Setup

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi environment variables:
   Salin `.env.example` ke `.env` dan lengkapi konfigurasi PostgreSQL dan Redis.
4. Jalankan migrasi basis data dan seeding akun per-role:
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```
5. Jalankan server pengembangan NestJS:
   ```bash
   npm run start:dev
   ```
   *Backend akan berjalan di `http://localhost:3000`.*

---

### 2. Frontend Setup

1. Buka sesi terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di `http://localhost:5173`.*

---

### 3. Akun Pengujian Siap Pakai (Seed Credentials)

Semua akun di bawah ini telah dikonfigurasi secara otomatis saat menjalankan `npm run prisma:seed`:

| Peran (Role) | Email Login | Password Default | Akses Menu Utama |
| :--- | :--- | :--- | :--- |
| **Owner** | `admin@mkprinting.com` | `Admin@123!` | Seluruh Modul + Pengaturan & Audit |
| **Manager** | `manager@mkprinting.com` | `Manager@123!` | Pesanan, Produk, Produksi, Gudang, Laporan |
| **Sales** | `sales@mkprinting.com` | `Sales@123!` | Penawaran, Pesanan, Pelanggan, Live Support |
| **Designer** | `designer@mkprinting.com` | `Designer@123!` | Berkas Desain, Pre-Press Check, Proofing |
| **Production Staff**| `production@mkprinting.com` | `Production@123!` | Antrean Produksi, Mesin Cetak, Finishing |
| **Warehouse Staff** | `warehouse@mkprinting.com` | `Warehouse@123!` | Gudang & Stok Material, Resi Pengiriman |
| **Finance Staff** | `finance@mkprinting.com` | `Finance@123!` | Faktur, Tagihan, Verifikasi Bayar, Laporan |
| **Customer** | `customer@example.com` | `Customer@123!` | Katalog, Pesanan Saya, Faktur Saya, Live Chat |

---

## 🔒 Security Best Practices

- **Zero Hardcoded Credentials:** Seluruh rahasia dan kunci API dikelola melalui environment variables.
- **Strict Rate Limiting:** Pembatasan laju permintaan API berbasis Redis melalui `@nestjs/throttler-storage-redis`.
- **HTTP Security Headers:** Dikelola menggunakan Helmet middleware.
- **Strict Parameter Validation:** Validasi DTO di tingkat controller menggunakan `class-validator` dan skema validasi frontend dengan `zod`.
- **SQL Injection Prevention:** Kueri terparameterisasi murni melalui Prisma ORM.
- **Secure File Storage:** Menggunakan presigned upload/download URLs untuk mencegah manipulasi tautan statis atau IDOR pada file desain pelanggan.

---

## 📈 Production Readiness

Sistem dirancang untuk mendukung beban tinggi hingga ratusan ribu permintaan harian:
- **PM2 Cluster Mode:** Memanfaatkan seluruh core CPU server secara seimbang.
- **Nginx Reverse Proxy:** Menangani terminasi SSL, kompresi gzip/brotli, dan cache aset statis.
- **Redis Requirement:** Wajib di production untuk shared session, rate limiting lintas worker, dan BullMQ worker queue.
- **Zero-Downtime Deployment:** CI/CD pipeline memvalidasi pengujian sebelum proses *graceful reload* PM2 dijalankan.

---

## 🧭 Roadmap (Rencana Pengembangan Lanjutan)

Fitur-fitur berikut direncanakan untuk iterasi selanjutnya sesuai kebutuhan skala enterprise:

- **Product Configurator Kompleks di Server:** Mesin kalkulator ukuran bebas (custom per m²), opsi bahan dan varian finishing dinamis dengan rumus HPP/margin langsung di backend.
- **Payment Gateway Otomatis (Midtrans / Xendit):** Integrasi QRIS, Virtual Account bank otomatis, serta verifikasi signature webhook dan penanganan idempotency.
- **Buku Alamat Multi-Cabang Korporat:** Dukungan banyak alamat pengiriman (*bill-to* & *ship-to*) per entitas perusahaan.
- **Manajemen Pengadaan & Supplier (Procurement):** Purchase Order (PO) ke vendor kertas/tinta, Goods Receipt, serta alur stock opname berkala.
- **Job Costing / HPP Akuntansi:** Penghitungan margin riil per pekerjaan (bahan baku terpakai + tarif depresiasi mesin + jam operator) dan pelaporan profitabilitas per pelanggan.
- **Integrasi Perpajakan Resmi (e-Faktur / Coretax):** Ekspor skema faktur pajak DJP dan penanganan withholding tax (PPh 23 jasa percetakan korporat).

---

## 📄 License

Proyek ini bersifat tertutup dan rahasia (*Proprietary & Confidential*). Seluruh hak cipta dilindungi undang-undang.
