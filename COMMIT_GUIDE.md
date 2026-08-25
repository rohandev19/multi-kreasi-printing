# Panduan Memanipulasi Tanggal Commit di Git

Dokumen ini menjelaskan secara detail bagaimana cara merapikan, meratakan, atau memanipulasi tanggal commit pada sebuah repositori Git secara aman dan efisien menggunakan script Python. 

Pendekatan ini jauh lebih cepat dan minim *error* (terutama di sistem operasi Windows) dibandingkan menggunakan perintah bawaan seperti git filter-branch. Pendekatan ini bekerja dengan cara membangun ulang riwayat commit dari awal hingga akhir menggunakan perintah tingkat rendah Git, yaitu git commit-tree.

> [!WARNING]
> **Peringatan Legalitas dan Etika**
> Memanipulasi riwayat commit 100% legal dan diizinkan oleh GitHub. Sangat wajar dilakukan untuk merapikan proyek **pribadi/portofolio**. Namun, **JANGAN PERNAH** melakukan ini pada proyek tim di lingkungan profesional, karena akan merusak branch lokal milik rekan kerja Anda.

---

## 1. Konsep Cara Kerja

Alih-alih menggunakan git filter-branch yang mengeksekusi shell per commit (sangat lambat di Windows), kita menggunakan Python untuk:
1. Mengambil daftar seluruh commit (dari yang paling lama ke yang terbaru).
2. Membaca properti asli setiap commit (pesan commit, *author*, *tree/file*).
3. Mengganti tanggalnya sesuai pola yang kita inginkan (misalnya 1 commit per hari, atau 4 commit acak per bulan).
4. Membuat *commit baru* yang identik menggunakan perintah git commit-tree, lalu menyambungkannya menjadi rantai riwayat yang baru.
5. Memindahkan ujung (*tip*) dari branch utama ke rantai riwayat yang baru dibuat tersebut.

---

## 2. Script Python (Contoh: Mundur 1 Hari Per Commit)

Berikut adalah *script* standar yang akan meratakan tumpukan commit dengan mendistribusikannya secara merata: **1 commit per hari**, dihitung mundur dari sebuah tanggal akhir (*end date*).

Buat sebuah file bernama ewrite_history.py dan tempelkan kode berikut:

`python
import subprocess
import os
import datetime
import sys

# 1. Tentukan path ke folder repositori
repo_dir = r"c:\Path\Ke\Project\Anda"
os.chdir(repo_dir)

# 2. Ambil daftar commit (dari yang tertua ke terbaru)
result = subprocess.run(["git", "log", "--reverse", "--format=%H"], capture_output=True, text=True, check=True)
commits = result.stdout.strip().splitlines()

if not commits:
    print("Tidak ada commit yang ditemukan.")
    sys.exit(0)

# 3. Tentukan tanggal untuk commit TERBARU (End Date)
end_date = datetime.date(2026, 8, 21)

rewritten_map = {}
env = os.environ.copy()

print(f"Mulai mengubah {len(commits)} commit...")

for i, old_commit in enumerate(commits):
    # Hitung tanggal mundur: commit tertua akan ditaruh di tanggal paling jauh
    new_date = end_date - datetime.timedelta(days=(len(commits) - 1 - i))
    date_str = new_date.strftime('%Y-%m-%d 12:00:00 +0700')
    
    # Ambil tree, parents, author, dan pesan dari commit asli
    tree = subprocess.run(["git", "log", "-1", "--format=%T", old_commit], capture_output=True, text=True).stdout.strip()
    parents = subprocess.run(["git", "log", "-1", "--format=%P", old_commit], capture_output=True, text=True).stdout.strip().split()
    author_name = subprocess.run(["git", "log", "-1", "--format=%an", old_commit], capture_output=True, text=True).stdout.strip()
    author_email = subprocess.run(["git", "log", "-1", "--format=%ae", old_commit], capture_output=True, text=True).stdout.strip()
    msg = subprocess.run(["git", "log", "-1", "--format=%B", old_commit], capture_output=True, text=True).stdout.strip()
    
    # Atur Environment Variable Git untuk manipulasi tanggal
    env["GIT_AUTHOR_NAME"] = author_name
    env["GIT_AUTHOR_EMAIL"] = author_email
    env["GIT_AUTHOR_DATE"] = date_str
    env["GIT_COMMITTER_NAME"] = author_name
    env["GIT_COMMITTER_EMAIL"] = author_email
    env["GIT_COMMITTER_DATE"] = date_str
    
    # Bangun perintah commit-tree
    cmd = ["git", "commit-tree", tree]
    for p in parents:
        if p in rewritten_map:
            # Jika parent sudah di-rewrite, sambungkan ke parent yang baru
            cmd.extend(["-p", rewritten_map[p]])
        else:
            cmd.extend(["-p", p])
            
    # Eksekusi pembuatan commit baru
    proc = subprocess.run(cmd, input=msg, capture_output=True, text=True, env=env)
    new_commit = proc.stdout.strip()
    
    if proc.returncode != 0:
        print(f"Gagal pada commit {old_commit}: {proc.stderr}")
        sys.exit(1)
        
    rewritten_map[old_commit] = new_commit
    print(f"[{i+1}/{len(commits)}] {old_commit[:7]} -> {new_commit[:7]} ({date_str})")

# 4. Update branch utama (misal 'main' atau 'master') ke riwayat yang baru
branch_res = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True)
branch = branch_res.stdout.strip()
if not branch:
    branch = "main"

new_tip = rewritten_map[commits[-1]]
subprocess.run(["git", "update-ref", "-m", "rewrite history", f"refs/heads/{branch}", new_tip])
print(f"Selesai! Branch '{branch}' telah diperbarui.")
`

---

## 3. Langkah Eksekusi

### Langkah 1: Eksekusi Script
Jalankan file Python tersebut di terminal Anda:
`ash
python rewrite_history.py
`
Script akan berjalan sekitar 10-30 detik tergantung jumlah commit. Setelah selesai, branch lokal Anda telah berubah menggunakan rentetan waktu yang baru.

### Langkah 2: Verifikasi Riwayat Lokal
Periksa apakah tanggalnya sudah benar di lokal:
`ash
git log --format="%h - %ad : %s" --date=short
`

### Langkah 3: Update Branch Lainnya (Opsional)
Jika Anda memiliki branch lain (seperti develop atau staging), Anda harus menjalankan perintah ini untuk setiap branch agar menunjuk ke commit baru (Anda bisa melihat pemetaannya di output script):
`ash
git update-ref refs/heads/develop <SHA_COMMIT_BARU>
`

### Langkah 4: Force Push ke GitHub
Karena riwayat telah berubah secara mendasar, GitHub akan menolak push biasa. Anda harus melakukan *force push* untuk menimpa riwayat di server:
`ash
git push --force origin main
`
*(Ganti main dengan nama branch Anda, atau gunakan --all untuk mem-push semua branch sekaligus)*

---

## 4. Efek Samping & Caching GitHub

> [!NOTE]
> Setelah melakukan *force push*, grafik hijau kontribusi di GitHub **tidak akan langsung berubah detik itu juga**.

Jika sebelumnya ada penumpukan (ratusan commit di satu hari), kotak hijau tua tersebut mungkin masih terlihat. Ini disebabkan oleh sistem *Cache* pada GitHub. 
- GitHub butuh waktu **hingga 24 jam** untuk menjalankan proses *garbage collection* di belakang layar.
- Setelah proses tersebut selesai oleh server GitHub, grafik kontribusi (hijau) Anda akan di-*render* ulang dan tumpukan commit di hari sebelumnya akan hilang secara perlahan. Anda hanya perlu mendiamkannya saja.
