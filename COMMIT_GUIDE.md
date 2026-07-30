# Panduan Commit & Push (Sesuai Aturan Proyek)

Dokumen ini adalah ringkasan alur kerja (workflow) untuk melakukan commit dan push di proyek ini sesuai dengan aturan di `GEMINI.md`.

## 1. Pastikan Perubahan Sudah Lengkap Sesuai Sub-task
Jangan menggabungkan banyak *sub-task* ke dalam satu commit. **Satu sub-task = satu commit**.
*(Contoh: Jika task 4.3 adalah JWT login dan 4.4 adalah Google OAuth, buat dua commit terpisah)*.

## 2. Testing & Linting (Wajib)
Sebelum melakukan commit, pastikan semua kode berfungsi, linter tidak error, dan tipe data (TypeScript) tidak ada yang *conflicting*.

Jalankan perintah berikut di terminal:
```bash
# Untuk Frontend:
cd frontend
npm run lint
npx tsc --noEmit

# Untuk Backend:
cd backend
npm run lint
npx tsc --noEmit
```
*Catatan: Pastikan tidak ada error. Jika ada peringatan (warning) linter, sebaiknya diperbaiki atau jika mendesak dan bukan error (code 0), bisa dilanjutkan.*

## 3. Menambahkan Perubahan ke Git (Staging)
Tambahkan file yang sudah diubah dan siap untuk di-commit:
```bash
git add .
# atau jika ingin file tertentu saja:
git add nama-folder/nama-file.tsx
```

## 4. Menulis Commit Message
Pola penulisan pesan commit di proyek ini sangat spesifik dan harus mengikuti standar konvensi:
`tipe(scope): deskripsi (task nomor-task)`

**Tipe yang diizinkan:**
- `feat`: Fitur baru
- `fix`: Memperbaiki bug
- `test`: Menambah/mengubah unit testing
- `refactor`: Mengubah kode tanpa merubah fungsi (misal: merapikan struktur)
- `chore`: Tugas rutin (update dependency, dsb)
- `security`: Patch keamanan

**Contoh Pesan Commit:**
- `feat(auth): implement JWT login with refresh token rotation (task 4.3)`
- `fix(orders): fix calculation bug on discount field (task 5.1)`
- `refactor(ui): update table component for better reusability (task 2)`

**Menjalankan Commit:**
```bash
git commit -m "tipe(scope): deskripsi (task nomor)"
```
*(Catatan: Jika ada error internal dari Husky saat commit padahal kode sudah benar dan lulus linting, Anda bisa mem-bypass sementara dengan menambahkan flag `--no-verify`: `git commit --no-verify -m "..."`)*

## 5. Push ke GitHub
Selalu kerjakan kode di *branch* `feature/...` atau `develop`. **Jangan** push langsung ke `main` atau `staging`.

```bash
git push
```
Jika ini adalah *branch* baru yang belum ada di remote (GitHub), gunakan:
```bash
git push -u origin nama-branch-anda
```

## 6. Verifikasi CI/CD (GitHub Actions)
Setelah push, cek GitHub (bagian "Actions" atau di Pull Request) dan pastikan pipeline berjalan hijau (berhasil).
- Jika berhasil ✅: Centang kotak sub-task di file tugas Anda (`tasks.md`).
- Jika gagal ❌: Jangan lanjut ke tugas berikutnya! Perbaiki error, lakukan commit lagi, dan pastikan pipeline kembali hijau.
