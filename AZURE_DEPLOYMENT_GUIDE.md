# Azure Deployment Guide (IaaS: Linux VM)

Panduan ini berisi langkah-langkah untuk menyiapkan dan men-deploy platform Multi Kreasi Printing ke Microsoft Azure menggunakan skema **IaaS (Infrastructure as a Service)** berupa Ubuntu VM. Skema ini paling cocok dengan arsitektur `PM2 Cluster` + `Nginx` kita.

## Prasyarat
1. Akun Microsoft Azure dengan *subscription* aktif.
2. Domain aktif (misal: `multikreasiprinting.com`).
3. Azure CLI (`az`) terinstal di lokal laptop Anda.

---

## Langkah 1: Persiapan Infrastruktur (Provisioning)

Kita akan membuat Virtual Machine menggunakan *script* otomasi yang telah disiapkan.

1. Buka terminal di laptop Anda.
2. Login ke Azure CLI:
   ```bash
   az login
   ```
3. Eksekusi script provision:
   ```bash
   bash infra/azure/provision.sh
   ```
4. Tunggu hingga proses selesai (sekitar 3-5 menit). Di akhir output, Anda akan mendapatkan **IP Public** dari VM Anda.
5. Catat IP Public tersebut (contoh: `20.100.50.25`).

> **Proses Background**: Saat VM tercipta, ia akan menjalankan `infra/azure/cloud-init.yaml` di *background* untuk menginstal Node.js, Nginx, PostgreSQL, Redis, dan PM2. Proses ini butuh waktu tambahan sekitar 5 menit setelah VM menyala.

---

## Langkah 2: Konfigurasi DNS

Agar SSL bisa dibuat, domain Anda harus menunjuk ke IP Azure VM.

1. Buka *DNS Management* tempat Anda membeli domain (misal: Niagahoster, Cloudflare, dll).
2. Tambahkan **A Record**:
   - Name/Host: `@`
   - Target/Value: `[IP_PUBLIC_AZURE_ANDA]`
   - TTL: Auto / 300
3. (Opsional) Tambahkan **CNAME Record**:
   - Name/Host: `www`
   - Target/Value: `multikreasiprinting.com`

---

## Langkah 3: Setup SSL (HTTPS) dan Nginx

Kita perlu menyalakan HTTPS menggunakan Let's Encrypt (Gratis).

1. SSH ke dalam Azure VM menggunakan akun Anda:
   ```bash
   ssh azureuser@IP_PUBLIC_AZURE_ANDA
   ```
2. Jalankan perintah Certbot untuk membuat SSL:
   ```bash
   sudo certbot certonly --standalone -d multikreasiprinting.com -d www.multikreasiprinting.com
   ```
   *(Ikuti instruksi di layar, masukkan email, dan setujui ToS).*
3. Copy konfigurasi Nginx kita ke server:
   Di komputer lokal Anda, jalankan:
   ```bash
   scp nginx.conf.example azureuser@IP_PUBLIC_AZURE_ANDA:/tmp/multikreasi.conf
   ```
4. Kembali ke SSH Azure VM, pindahkan konfigurasi dan restart Nginx:
   ```bash
   sudo mv /tmp/multikreasi.conf /etc/nginx/sites-available/multikreasi
   sudo ln -s /etc/nginx/sites-available/multikreasi /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo systemctl restart nginx
   ```

---

## Langkah 4: Setup GitHub Actions (Otomasi CI/CD)

Agar setiap Anda mem-*push* kode ke branch `main`, kode tersebut otomatis ter-deploy ke Azure, kita harus memasukkan kredensial ke dalam repositori GitHub.

1. Buka Repositori GitHub > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
2. Masukkan *secrets* berikut satu per satu:

| Name | Secret Value |
|---|---|
| `AZURE_VM_HOST` | `[IP_PUBLIC_AZURE_ANDA]` |
| `AZURE_VM_USERNAME` | `azureuser` |
| `AZURE_VM_SSH_KEY` | Isi dengan _private key_ Anda (bisa didapatkan dari file `~/.ssh/id_rsa` lokal Anda yang di-generate oleh script provision) |
| `DB_PASSWORD` | `supersecretpassword` (Atau ganti dengan password DB produksi Anda) |
| `REDIS_PASSWORD` | `supersecretredis` |
| `JWT_SECRET` | (Buat string acak yang panjang, misal: `mkp_prod_jwt_...`) |
| `JWT_REFRESH_SECRET` | (Buat string acak yang panjang, misal: `mkp_prod_ref_...`) |
| `ALLOWED_ORIGINS` | `https://multikreasiprinting.com` |
| `SMTP_HOST` | `smtp.gmail.com` (atau provider email Anda) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `email.anda@gmail.com` |
| `SMTP_PASSWORD` | `App Password Gmail Anda` |
| `R2_ACCOUNT_ID` | (Dari Cloudflare R2) |
| `R2_ACCESS_KEY_ID` | (Dari Cloudflare R2) |
| `R2_SECRET_ACCESS_KEY`| (Dari Cloudflare R2) |
| `R2_BUCKET_NAME` | `mkprinting-assets` |

---

## Langkah 5: Deployment Pertama!

1. Di lokal komputer Anda, pastikan semua kode (termasuk script azure) sudah di-commit.
2. Push ke branch main:
   ```bash
   git add .
   git commit -m "Setup Azure Deployment"
   git push origin main
   ```
3. Buka tab **Actions** di GitHub Anda, dan lihat proses *Build & Deploy* berjalan.
4. Jika statusnya hijau (Berhasil), buka `https://multikreasiprinting.com`. Platform Anda sudah *live* di Azure secara _Zero-Downtime_!
