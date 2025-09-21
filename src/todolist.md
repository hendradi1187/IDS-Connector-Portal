# Daftar Tugas Pengembangan Portal Konektor IDS

Ini adalah daftar tugas untuk melacak kemajuan pengembangan "IDS Connector Portal".

**Kemajuan Keseluruhan: 90%**

---

### Modul & Fitur

- [x] **Konfigurasi Proyek & Otentikasi (100%)**
  - [x] Inisialisasi proyek Next.js.
  - [x] Konfigurasi Firebase (Hosting, Firestore, Authentication).
  - [x] Implementasi alur login dengan Email & Password.
  - [x] Manajemen peran pengguna (admin, operator, viewer).

- [x] **Tata Letak Utama (100%)**
  - [x] Buat desain dashboard desktop.
  - [x] Implementasi Sidebar di sebelah kiri.
  - [x] Tambahkan menu navigasi ke Sidebar.
  - [x] Pastikan perutean berfungsi untuk semua item menu.

- [x] **Dashboard (100%)**
  - [x] Tiga kartu ringkasan (Konektor Aktif, Rute Data, Kesalahan).
  - [x] Grafik garis untuk lalu lintas data (data dummy).
  - [x] Tabel untuk 10 log aktivitas terbaru (data dummy).
  - [x] Hubungkan komponen log aktivitas ke data Firestore langsung.
  - [x] Hubungkan kartu ringkasan & grafik ke data Firestore.

- [x] **Manajemen Pengguna (100%)**
  - [x] Buat halaman Manajemen Pengguna dengan tab filter peran.
  - [x] Tampilkan tabel pengguna dengan data dummy.
  - [x] Hubungkan ke koleksi "users" di Firestore.
  - [x] Buat fungsionalitas CRUD (Create, Read, Update, Delete) untuk pengguna.

- [x] **GUI (80%)**
  - [x] Buat halaman GUI dengan struktur tab yang benar.
  - [x] Hubungkan tab "Kelola Sumber Daya" ke koleksi `resources` Firestore.
  - [x] Implementasikan Formulir & Tabel untuk setiap tab.
  - [ ] Hubungkan setiap tab ke koleksi Firestore yang sesuai.

- [ ] **Manajemen Data (10%)**
  - [x] Buat halaman placeholder Manajemen Data.
  - [ ] Hubungkan ke koleksi Firestore (resources, contracts, routes, configs).
  - [ ] Implementasikan Tabel CRUD untuk setiap koleksi.
  - [ ] Buat formulir untuk menambah/engedit data.

- [x] **Pengontrol Konektor (100%)**
  - [x] Buat halaman Pengontrol Konektor.
  - [x] Tampilkan status untuk 4 komponen (data dummy).
  - [x] Hubungkan status ke koleksi "controllers" di Firestore.

- [x] **Konektor Dataspace (100%)**
  - [x] Buat halaman Konektor Dataspace dengan daftar modul.
  - [x] Tampilkan tabel dari koleksi yang sesuai untuk setiap modul (resources, policies, messages, users).
  - [x] Hubungkan ke data Firestore langsung.

- [ ] **Routing & Services (5%)**
  - [x] Buat halaman placeholder Routing & Services.
  - [ ] Implementasikan Tabel & Formulir CRUD untuk Rute Camel (koleksi "routes").
  - [ ] Implementasikan Tabel & Formulir CRUD untuk Aplikasi Layanan (koleksi "services").

- [ ] **Sistem Backend (5%)**
  - [x] Buat halaman placeholder Sistem Backend.
  - [ ] Tampilkan kartu status API dari koleksi "apis".
  - [ ] Tampilkan tabel log pemrosesan dari koleksi "processing_logs".

- [x] **Layanan IDS Eksternal (100%)**
  - [x] Buat halaman placeholder Layanan Eksternal.
  - [x] Implementasikan daftar tautan statis.
  - [x] Hubungkan status layanan ke data Firestore.
