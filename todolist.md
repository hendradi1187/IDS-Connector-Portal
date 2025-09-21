# Daftar Tugas Pengembangan Portal Konektor IDS

Ini adalah daftar tugas untuk melacak kemajuan pengembangan "IDS Connector Portal".

**Kemajuan Keseluruhan: 15%**

---

### Modul & Fitur

- [ ] **Konfigurasi Proyek & Otentikasi (10%)**
  - [x] Inisialisasi proyek Next.js.
  - [ ] Konfigurasi Firebase (Hosting, Firestore, Authentication).
  - [ ] Implementasi alur login dengan Email & Password.
  - [ ] Manajemen peran pengguna (admin, operator, viewer).

- [ ] **Tata Letak Utama (90%)**
  - [x] Buat desain dashboard desktop.
  - [x] Implementasi Sidebar di sebelah kiri.
  - [x] Tambahkan menu navigasi ke Sidebar.
  - [ ] Pastikan perutean berfungsi untuk semua item menu.

- [ ] **Dashboard (40%)**
  - [x] Tiga kartu ringkasan (Konektor Aktif, Rute Data, Kesalahan).
  - [x] Grafik garis untuk lalu lintas data (data dummy).
  - [ ] Tabel untuk 10 log aktivitas terbaru (data dummy).
  - [ ] Hubungkan komponen ke data Firestore langsung.

- [ ] **Manajemen Pengguna (25%)**
  - [x] Buat halaman Manajemen Pengguna dengan tab filter peran.
  - [x] Tampilkan tabel pengguna dengan data dummy.
  - [ ] Hubungkan ke koleksi "users" di Firestore.
  - [ ] Buat fungsionalitas CRUD (Create, Read, Update, Delete) untuk pengguna.

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

- [ ] **Pengontrol Konektor (50%)**
  - [x] Buat halaman Pengontrol Konektor.
  - [x] Tampilkan status untuk 4 komponen (data dummy).
  - [ ] Hubungkan status ke koleksi "controllers" di Firestore.

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
