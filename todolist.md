# Daftar Tugas Pengembangan Portal Konektor IDS

Ini adalah daftar tugas untuk melacak kemajuan pengembangan "IDS Connector Portal".

**Kemajuan Keseluruhan: 52%**

---

### Modul & Fitur

- [ ] **Konfigurasi Proyek & Otentikasi (35%)**
  - [x] Inisialisasi proyek Next.js.
  - [x] Konfigurasi Firebase (Hosting, Firestore, Authentication).
  - [ ] Implementasi alur login dengan Email & Password.
  - [ ] Manajemen peran pengguna (admin, operator, viewer).

- [x] **Tata Letak Utama (100%)**
  - [x] Buat desain dashboard desktop.
  - [x] Implementasi Sidebar di sebelah kiri.
  - [x] Tambahkan menu navigasi ke Sidebar.
  - [x] Pastikan perutean berfungsi untuk semua item menu.

- [ ] **Dashboard (70%)**
  - [x] Tiga kartu ringkasan (Konektor Aktif, Rute Data, Kesalahan).
  - [x] Grafik garis untuk lalu lintas data (data dummy).
  - [x] Tabel untuk 10 log aktivitas terbaru (data dummy).
  - [x] Hubungkan komponen log aktivitas ke data Firestore langsung.
  - [ ] Hubungkan kartu ringkasan & grafik ke data Firestore.

- [x] **Manajemen Pengguna (100%)**
  - [x] Buat halaman Manajemen Pengguna dengan tab filter peran.
  - [x] Tampilkan tabel pengguna dengan data dummy.
  - [x] Hubungkan ke koleksi "users" di Firestore.
  - [x] Buat fungsionalitas CRUD (Create, Read, Update, Delete) untuk pengguna.

- [ ] **GUI (20%)**
  - [x] Buat halaman GUI dengan struktur tab yang benar.
  - [x] Implementasi tabel dummy untuk tab "Kelola Sumber Daya".
  - [ ] Implementasikan Formulir & Tabel untuk setiap tab.
  - [ ] Hubungkan setiap tab ke koleksi Firestore yang sesuai.

- [ ] **Manajemen Data (10%)**
  - [x] Buat halaman placeholder Manajemen Data.
  - [ ] Hubungkan ke koleksi Firestore (resources, contracts, routes, configs).
  - [ ] Implementasikan Tabel CRUD untuk setiap koleksi.
  - [ ] Buat formulir untuk menambah/mengedit data.

- [x] **Pengontrol Konektor (100%)**
  - [x] Buat halaman Pengontrol Konektor.
  - [x] Tampilkan status untuk 4 komponen (data dummy).
  - [x] Hubungkan status ke koleksi "controllers" di Firestore.

- [ ] **Konektor Dataspace (20%)**
  - [x] Buat halaman Konektor Dataspace dengan daftar modul.
  - [ ] Tampilkan tabel dari koleksi yang sesuai untuk setiap modul (resources, policies, messages, users).
  - [ ] Hubungkan ke data Firestore langsung.

- [ ] **Routing & Services (5%)**
  - [x] Buat halaman placeholder Routing & Services.
  - [ ] Implementasikan Tabel & Formulir CRUD untuk Rute Camel (koleksi "routes").
  - [ ] Implementasikan Tabel & Formulir CRUD untuk Aplikasi Layanan (koleksi "services").

- [ ] **Sistem Backend (5%)**
  - [x] Buat halaman placeholder Sistem Backend.
  - [ ] Tampilkan kartu status API dari koleksi "apis".
  - [ ] Tampilkan tabel log pemrosesan dari koleksi "processing_logs".

- [ ] **Layanan IDS Eksternal (10%)**
  - [x] Buat halaman placeholder Layanan Eksternal.
  - [ ] Implementasikan daftar tautan statis.
  - [ ] Hubungkan status layanan ke data Firestore.
