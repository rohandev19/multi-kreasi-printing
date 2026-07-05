# Troubleshooting Guide

## Issue: "Network Error", Cannot Login, or Products Not Loading on Startup

### Gejala (Symptoms)
- Saat membuka aplikasi frontend di browser (biasanya di `http://localhost:5173`), produk tidak muncul.
- Saat mencoba melakukan login, selalu gagal dengan error di console: `AxiosError: Network Error`.
- Frontend seolah-olah tidak bisa berkomunikasi sama sekali dengan backend.

### Penyebab (Root Cause)
Masalah ini adalah masalah **timing (waktu tunggu)** saat aplikasi pertama kali dijalankan.
Ketika perintah `npm run start:dev` dijalankan untuk backend, NestJS membutuhkan waktu beberapa menit untuk melakukan kompilasi TypeScript (`tsc`) di awal sebelum server benar-benar mulai mendengarkan (listen) pada port `3000`. 

Jika frontend dibuka dan diakses **sebelum** proses kompilasi backend ini selesai, maka frontend akan mencoba melakukan HTTP Request ke port `3000` yang belum aktif, sehingga menghasilkan pesan kesalahan "Network Error".

### Solusi (Resolution)
1. **Periksa Terminal Backend:** Pastikan proses terminal yang menjalankan backend sudah menampilkan pesan:
   ```
   [NestApplication] Nest application successfully started
   ```
   *Catatan: Pesan "Found 0 errors. Watching for file changes." hanya menandakan kompilasi selesai, aplikasi masih membutuhkan beberapa detik tambahan untuk inisialisasi modul.*

2. **Refresh Browser:** Setelah memastikan backend sudah benar-benar berjalan, lakukan *refresh* pada halaman browser frontend Anda (`F5` atau `Ctrl+R`).

3. **Verifikasi:** 
   - Halaman produk harusnya sudah langsung memuat data dari database.
   - Anda sudah dapat melakukan login (misal menggunakan akun `admin@mkprinting.com`).

### Catatan Tambahan
- Pastikan tidak ada konflik port pada mesin (Port `3000` harus tersedia untuk backend).
- Error peringatan mengenai Redis seperti `WARN [CacheService] Redis connection error` bersifat opsional dan tidak akan mengganggu fungsi utama jika Anda tidak menyalakan Redis server.
