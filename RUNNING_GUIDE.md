# Panduan Menjalankan Aplikasi (Running Guide)

Dokumen ini berisi panduan singkat untuk menjalankan aplikasi **Multi Kreasi Printing** secara lokal di tahap pengembangan (*development*).

Aplikasi ini terdiri dari dua bagian utama:
1. **Backend (BE)**: Menggunakan NestJS, Prisma, dan PostgreSQL.
2. **Frontend (FE)**: Menggunakan React, Vite, dan TailwindCSS.

---

## 1. Menjalankan Backend (BE)

Backend **harus dijalankan pertama kali** agar frontend dapat terhubung ke API dan tidak mengalami *Network Error*.

1. Buka terminal baru (atau Command Prompt / PowerShell).
2. Pindah ke direktori `backend`:
   ```bash
   cd backend
   ```
3. Pastikan dependensi sudah terinstall (jika baru pertama kali):
   ```bash
   npm install
   ```
4. Jalankan *development server*:
   ```bash
   npm run start:dev
   ```
5. **Tunggu proses kompilasi:** Anda harus menunggu hingga terminal menampilkan pesan sukses seperti di bawah ini, yang menandakan API sudah siap menerima *request*:
   ```
   [NestApplication] Nest application successfully started
   ```
   *Penting: Backend berjalan pada **Port 3000** (`http://localhost:3000`).*

---

## 2. Menjalankan Frontend (FE)

Setelah backend berhasil dijalankan dan siap (lihat Langkah 1), Anda bisa menjalankan frontend.

1. Buka tab terminal baru (biarkan terminal backend tetap berjalan).
2. Pindah ke direktori `frontend`:
   ```bash
   cd frontend
   ```
3. Pastikan dependensi sudah terinstall (jika baru pertama kali):
   ```bash
   npm install
   ```
4. Jalankan *development server* Vite:
   ```bash
   npm run dev
   ```
5. **Buka di Browser:** Vite biasanya akan berjalan di **Port 5173**. Buka link berikut di browser Anda:
   ```
   http://localhost:5173
   ```

---

## 3. Akun Testing (Admin)

Jika database sudah di-*seed* dengan benar, Anda bisa langsung melakukan login menggunakan akun default *Owner*:

- **Email:** `admin@mkprinting.com`
- **Password:** `Admin@123!`

*(Catatan: Anda juga dapat melihat kredensial role lainnya di dalam file `backend/prisma/seed.ts`)*

---

## Troubleshooting Umum

- **Network Error di Frontend / Data tidak muncul:** Pastikan backend benar-benar sudah menampilkan pesan `Nest application successfully started` sebelum Anda membuka/refresh frontend. Jika Anda membuka frontend saat backend masih *compile*, Anda akan mendapati `AxiosError: Network Error`.
- **Database Connection Error (PostgreSQL):** Pastikan layanan database PostgreSQL di mesin lokal Anda sudah aktif dan URL koneksi (`DATABASE_URL`) di dalam file `backend/.env` sudah sesuai dengan username/password Anda.
- **Redis Error (Opsional):** Jika Anda melihat peringatan `WARN [CacheService] Redis connection error` di log backend, Anda dapat mengabaikannya jika Anda tidak mengaktifkan server Redis. Ini tidak akan merusak fitur inti aplikasi.
