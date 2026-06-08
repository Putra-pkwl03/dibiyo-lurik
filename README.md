
#  Dibyo Lurik - Digital Ecosystem & Internal Management

Project ini merupakan sistem informasi terintegrasi untuk **Dibyo Lurik**, yang menggabungkan halaman katalog publik interaktif (termasuk fitur *Lurik Customizer*) dengan Sistem Manajemen Internal (Dashboard Admin). Dibangun menggunakan teknologi modern **Next.js (App Router)** dan **Tailwind CSS**.

---

## Panduan Memulai (Quick Start)

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas direkomendasikan).

### 1. Alur Kolaborasi Git & GitHub (Wajib)
Sebelum bekerja, pastikan kamu melakukan **Fork** terlebih dahulu agar bisa melakukan *push* perubahan ke repositori milikmu sendiri, kemudian membuat *Pull Request* (PR).

* **Langkah 1:** Buka tautan repositori utama berikut: [https://github.com/Putra-pkwl03/dibiyo-lurik.git](https://github.com/Putra-pkwl03/dibiyo-lurik.git)
* **Langkah 2:** Klik tombol **Fork** di pojok kanan atas halaman GitHub untuk menyalin proyek ke akun GitHub pribadimu.
* **Langkah 3:** Clone repositori hasil fork milikmu, lalu masuk ke folder proyek:
  ```bash
  git clone [https://github.com/](https://github.com/)<USERNAME-GITHUB-KAMU>/dibiyo-lurik.git
  cd dibiyo-lurik

```

* **Langkah 4:** Hubungkan repositori lokalmu kembali ke repositori utama (upstream) agar tetap bisa mengambil pembaruan kode terbaru:
```bash
git remote add upstream [https://github.com/Putra-pkwl03/dibiyo-lurik.git](https://github.com/Putra-pkwl03/dibiyo-lurik.git)

```



### 2. Integrasi & Setup Database Supabase

Proyek ini menggunakan **Supabase** sebagai PostgreSQL database backend. Kamu perlu membuat proyek database baru di akun Supabase masing-masing untuk keperluan development lokal.

* **Langkah 1:** Masuk ke [Supabase Dashboard](https://supabase.com) dan buat proyek baru (New Project).
* **Langkah 2:** Buat file baru bernama `.env.local` di root folder proyek ini.
* **Langkah 3:** Salin kredensial API dan URL database dari dashboard Supabase kamu, lalu masukkan ke dalam file `.env.local` seperti berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

```



### 3. Instalasi Dependencies

```bash
npm install
# atau
yarn install

```

### 4. Menjalankan Server Lokal (Development Mode)

```bash
npm run dev
# atau
yarn dev

```

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser kamu.

---

## Struktur Folder Utama (`src/app/`)

Project ini memanfaatkan sistem **Next.js App Router** di mana setiap folder merepresentasikan segmen URL rute aplikasi.

```text
src/app/
│
├── layout.jsx            # Root Layout global (Font, Background, ProgressBar, & Navbar Toko)
├── page.jsx              # Landing Page Utama (Home)
│
├── components/           # Kumpulan Komponen UI Reusable
│   ├── ProgressBar.jsx   # Indikator loading navigasi antar halaman
│   └── home/
│       ├── Navbar.jsx    # Navigasi utama dengan auto-hide di area internal
│       ├── Catalog.jsx   # Komponen list produk (Fetch API)
│       └── catalog/
│           └── ModalDetail.jsx # Modal penanda detail spesifikasi produk
│
├── customizer/           # Modul Kustomisasi Wastra (Pola Lurik 3D / Canvas)
│   └── page.jsx
├── produk/               # Katalog Lengkap Kain Lurik
│   └── page.jsx
├── artikel/              # Edukasi & Filosofi Motif Wastra
│   └── page.jsx
├── produksi/             # Transparansi Langkah Kerja Tenun ATBM
│   └── page.jsx
├── cart/                 # Manajemen Keranjang Belanja Toko
│   └── page.jsx
│
├── auth/                 # Sistem Autentikasi Pengguna
│   └── login/
│       └── page.jsx      # Halaman Masuk Sistem Internal
│
└── dashboard/            # Panel Kontrol & Manajemen Internal Admin
    └── page.jsx          # Dashboard Manajemen Produksi & Stok

```

---

## Catatan Arsitektur Penting (Wajib Dibaca Teman Tim)

Biar kamu gak bingung saat ngoding bareng, ini beberapa fitur dan logika transisi halaman yang sudah diimplementasikan:

### 1. Navigasi Tanpa Loading (SPA Style)

Semua navigasi antar menu di toko utama dipasang menggunakan komponen `<Link href="/path-tujuan">` bawaan Next.js. Efeknya, perpindahan halaman akan terasa instan tanpa ada proses *hard reload* browser, namun Navbar di bagian atas tetap menetap (*persistent*).

### 2. Mekanisme Proteksi/Penyembunyian Navbar

Karena komponen `Navbar` diletakkan di `app/layout.jsx` agar muncul di semua halaman toko, kita memasang logika khusus di dalam `Navbar.jsx` menggunakan hook `usePathname()`.

* **Cara kerjanya:** Jika mendeteksi URL aktif diawali dengan `/dashboard`, `/auth`, atau `/admin`, komponen Navbar akan melakukan *self-destruct* (`return null`).
* **Hasilnya:** Halaman login internal dan dashboard admin akan bersih dari komponen Navbar pengguna secara otomatis tanpa membongkar struktur *root layout*.

### 3. Arsitektur State Modal Detail di Katalog

Komponen `Catalog.jsx` mengontrol *state* modal secara tersentralisasi melalui satu *state hook*:

```javascript
const [selectedProduct, setSelectedProduct] = useState(null)

```

* Saat tombol **Lihat Detail** pada salah satu kartu produk diklik, data objek produk (`prod`) dioper masuk ke dalam *state* tersebut.
* Komponen `ModalDetail.jsx` mendeteksi perubahan, lalu memunculkan modal secara interaktif lengkap dengan fitur *backdrop-click* (klik area luar untuk menutup modal).

---

## Kontak & Kontribusi

Jika ada kendala saat melakukan *pull* data terbaru atau konfigurasi API lokal, langsung diskusikan di grup koordinasi tim developer ya - awas ada randi! Selamat ngoding 

```