# Bugfix Requirements Document

## Introduction

Beberapa tombol tidak terlihat atau icon-nya tidak muncul dengan baik di aplikasi Multi Kreasi Printing:

1. **Halaman Products (Owner/Manager)**: Icon tambah (+) tidak terlihat pada tombol "Tambah Produk" dan "Tambah" kategori karena kombinasi yang salah antara penggunaan simbol unicode full-width `＋` dan icon Phosphor `<Plus />` yang disembunyikan di layar kecil dengan class `hidden sm:block`. Hal ini mengurangi kejelasan UI dan konsistensi dengan halaman lain seperti Users, Quotations, dan Orders.

2. **Halaman Login**: Tombol "Log In" tidak terlihat oleh user. Kemungkinan penyebab termasuk masalah CSS primary color definition, contrast issue, z-index/positioning issue, atau form styling yang menutupi tombol.

## Bug Analysis

### Current Behavior (Defect)

**Products Page Issues:**

1.1 WHEN user membuka halaman Products di layar kecil/mobile (viewport width < 640px) THEN tombol "Tambah Produk" menampilkan simbol unicode `＋` tetapi icon `<Plus />` dari Phosphor disembunyikan dengan class `hidden sm:block`

1.2 WHEN user membuka halaman Products di layar kecil/mobile THEN tombol "Tambah" kategori menampilkan simbol unicode `＋` tetapi icon `<Plus />` dari Phosphor disembunyikan dengan class `hidden sm:block`

1.3 WHEN simbol unicode `＋` di-render di browser THEN simbol tersebut mungkin tidak render dengan baik tergantung pada font sistem dan menyebabkan inkonsistensi visual

1.4 WHEN dibandingkan dengan halaman Users, Quotations, Orders THEN halaman Products menggunakan pola yang berbeda (unicode + hidden icon) sedangkan halaman lain menggunakan `<Plus size={18} weight="regular" />` tanpa class hidden

**Login Page Issues:**

1.5 WHEN user membuka halaman Login THEN tombol "Log In" tidak terlihat oleh user meskipun element button ada dalam DOM

1.6 WHEN tombol Login menggunakan class `bg-primary-600` THEN ada kemungkinan CSS variable `primary-600` tidak terdefinisi dengan baik atau memiliki nilai yang tidak terlihat (misalnya transparent atau sama dengan background)

1.7 WHEN text "Log In" menggunakan class `text-white` THEN jika background tidak terlihat, contrast antara text dan background parent menjadi rendah sehingga tombol tidak terlihat

1.8 WHEN form dirender THEN ada kemungkinan z-index atau positioning issue yang menyebabkan tombol tertutup oleh elemen lain

### Expected Behavior (Correct)

**Products Page Fixes:**

2.1 WHEN user membuka halaman Products di layar kecil/mobile (viewport width < 640px) THEN tombol "Tambah Produk" SHALL menampilkan icon `<Plus />` dari Phosphor yang terlihat di semua ukuran layar

2.2 WHEN user membuka halaman Products di layar kecil/mobile THEN tombol "Tambah" kategori SHALL menampilkan icon `<Plus />` dari Phosphor yang terlihat di semua ukuran layar

2.3 WHEN icon Plus di-render pada tombol "Tambah Produk" THEN icon SHALL menggunakan `<Plus size={18} weight="regular" />` tanpa class `hidden sm:block` untuk konsistensi dengan halaman lain

2.4 WHEN icon Plus di-render pada tombol "Tambah" kategori THEN icon SHALL menggunakan `<Plus size={18} weight="regular" />` atau ukuran yang sesuai tanpa class `hidden sm:block`

2.5 WHEN tombol dirender THEN simbol unicode `＋` dengan `aria-hidden="true"` SHALL dihapus karena sudah tidak diperlukan

**Login Page Fixes:**

2.6 WHEN user membuka halaman Login THEN tombol "Log In" SHALL terlihat jelas dengan background color yang terdefinisi dengan baik (misalnya `bg-primary-600` dengan warna solid yang kontras)

2.7 WHEN tombol Login dirender THEN SHALL memiliki contrast ratio yang memadai antara text dan background sesuai WCAG AA standards (minimal 4.5:1)

2.8 WHEN primary color variables tidak terdefinisi THEN SHALL menggunakan fallback color yang aman (misalnya `bg-blue-600` atau hex color langsung)

2.9 WHEN user hover tombol Login THEN SHALL ada visual feedback yang jelas (perubahan warna, shadow, atau scale)

2.10 WHEN halaman Login dirender THEN tombol SHALL memiliki z-index yang tepat untuk memastikan tidak tertutup elemen lain

### Unchanged Behavior (Regression Prevention)

3.1 WHEN user dengan role Owner atau Manager mengklik tombol "Tambah Produk" THEN system SHALL CONTINUE TO membuka form produk atau menutup form sesuai kondisi saat ini

3.2 WHEN user dengan role Owner atau Manager mengklik tombol "Tambah" kategori THEN system SHALL CONTINUE TO menambahkan kategori baru atau mengupdate kategori yang sedang diedit

3.3 WHEN tombol "Tambah Produk" dirender di layar besar (viewport width >= 640px) THEN tombol SHALL CONTINUE TO menampilkan styling dan layout yang sama dengan sebelumnya

3.4 WHEN user membuka halaman lain seperti Users, Quotations, Orders THEN halaman tersebut SHALL CONTINUE TO menggunakan pola icon yang sudah benar tanpa perubahan

3.5 WHEN tombol dirender dengan text "Tambah Produk" atau "Tutup Form" THEN text label SHALL CONTINUE TO berfungsi sesuai kondisi form (showForm state)

3.6 WHEN user dengan role selain Owner atau Manager mencoba mengakses halaman Products THEN authorization dan access control SHALL CONTINUE TO berfungsi seperti sebelumnya

**Login Page Regression Prevention:**

3.7 WHEN user mengklik tombol Login dengan credentials yang valid THEN system SHALL CONTINUE TO melakukan authentication dan redirect ke halaman yang sesuai berdasarkan role

3.8 WHEN user submit form Login THEN loading state ("Logging in...") SHALL CONTINUE TO ditampilkan pada tombol

3.9 WHEN user salah memasukkan credentials THEN error message SHALL CONTINUE TO ditampilkan di atas form

3.10 WHEN user mengklik "Remember me" checkbox atau "Forgot password" link THEN functionality SHALL CONTINUE TO berfungsi seperti sebelumnya

3.11 WHEN user menggunakan form Login THEN validation (email format, required fields) SHALL CONTINUE TO berfungsi dengan react-hook-form dan zod schema
