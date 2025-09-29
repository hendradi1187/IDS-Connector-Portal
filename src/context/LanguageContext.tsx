'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'System Overview',
    'dashboard.welcome': 'Welcome to IDS Connector Portal',
    'dashboard.description': 'Manage your International Data Spaces connectors with ease and monitor system performance.',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.external-services': 'External Services',
    'nav.routing-services': 'Routing Services',
    'nav.data-routes': 'Data Routes',
    'nav.containers': 'Containers',
    'nav.data-sources': 'Data Sources',
    'nav.network-settings': 'Network Settings',
    'nav.configs': 'Configurations',
    'nav.requests': 'Requests',
    'nav.service-applications': 'Service Applications',
    'nav.contracts': 'Contracts',
    'nav.system-logs': 'System Logs',
    'nav.api-status': 'API Status',
    'nav.dataspace-connectors': 'Dataspace Connectors',
    'nav.routing': 'Routing',
    'nav.connector-controllers': 'Connector Controllers',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Stats Cards
    'stats.total-resources': 'Total Resources',
    'stats.active-routes': 'Active Routes',
    'stats.total-requests': 'Total Requests',
    'stats.system-uptime': 'System Uptime',
    'stats.days': 'days',

    // Quick Actions
    'actions.title': 'Quick Actions',
    'actions.add-resource': 'Add New Resource',
    'actions.configure-route': 'Configure Route',
    'actions.view-logs': 'View System Logs',
    'actions.manage-users': 'Manage Users',

    // Recent Activity
    'activity.title': 'Recent Activity',
    'activity.new-resource': 'New resource added',
    'activity.route-configured': 'Route configured',
    'activity.user-login': 'User logged in',
    'activity.data-sync': 'Data synchronization completed',
    'activity.system-update': 'System configuration updated',

    // System Status
    'status.title': 'System Status',
    'status.all-systems': 'All Systems Operational',
    'status.database': 'Database',
    'status.api': 'API Services',
    'status.external': 'External Connections',
    'status.monitoring': 'Monitoring',
    'status.operational': 'Operational',

    // External Services
    'external.title': 'External Services',
    'external.description': 'Monitor and manage external service integrations for IDS ecosystem',
    'external.refresh': 'Refresh',
    'external.service': 'Service',
    'external.type': 'Type',
    'external.authentication': 'Authentication',
    'external.last-sync': 'Last Sync',
    'external.status': 'Status',
    'external.actions': 'Actions',
    'external.online': 'Online',
    'external.offline': 'Offline',
    'external.error': 'Error',
    'external.syncing': 'Syncing',
    'external.never': 'Never',
    'external.every': 'Every',
    'external.min': 'min',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',

    // Language
    'language.switch': 'Switch Language',
    'language.english': 'English',
    'language.indonesian': 'Indonesian',
  },
  id: {
    // Dashboard
    'dashboard.title': 'Dasbor',
    'dashboard.overview': 'Ringkasan Sistem',
    'dashboard.welcome': 'Selamat Datang di Portal Konektor IDS',
    'dashboard.description': 'Kelola konektor International Data Spaces Anda dengan mudah dan pantau kinerja sistem.',

    // Navigation
    'nav.dashboard': 'Dasbor',
    'nav.external-services': 'Layanan Eksternal',
    'nav.routing-services': 'Layanan Routing',
    'nav.data-routes': 'Rute Data',
    'nav.containers': 'Kontainer',
    'nav.data-sources': 'Sumber Data',
    'nav.network-settings': 'Pengaturan Jaringan',
    'nav.configs': 'Konfigurasi',
    'nav.requests': 'Permintaan',
    'nav.service-applications': 'Aplikasi Layanan',
    'nav.contracts': 'Kontrak',
    'nav.system-logs': 'Log Sistem',
    'nav.api-status': 'Status API',
    'nav.dataspace-connectors': 'Konektor Dataspace',
    'nav.routing': 'Routing',
    'nav.connector-controllers': 'Pengendali Konektor',
    'nav.users': 'Pengguna',
    'nav.settings': 'Pengaturan',
    'nav.logout': 'Keluar',

    // Stats Cards
    'stats.total-resources': 'Total Sumber Daya',
    'stats.active-routes': 'Rute Aktif',
    'stats.total-requests': 'Total Permintaan',
    'stats.system-uptime': 'Waktu Operasi Sistem',
    'stats.days': 'hari',

    // Quick Actions
    'actions.title': 'Aksi Cepat',
    'actions.add-resource': 'Tambah Sumber Daya Baru',
    'actions.configure-route': 'Konfigurasi Rute',
    'actions.view-logs': 'Lihat Log Sistem',
    'actions.manage-users': 'Kelola Pengguna',

    // Recent Activity
    'activity.title': 'Aktivitas Terbaru',
    'activity.new-resource': 'Sumber daya baru ditambahkan',
    'activity.route-configured': 'Rute dikonfigurasi',
    'activity.user-login': 'Pengguna masuk',
    'activity.data-sync': 'Sinkronisasi data selesai',
    'activity.system-update': 'Konfigurasi sistem diperbarui',

    // System Status
    'status.title': 'Status Sistem',
    'status.all-systems': 'Semua Sistem Beroperasi',
    'status.database': 'Basis Data',
    'status.api': 'Layanan API',
    'status.external': 'Koneksi Eksternal',
    'status.monitoring': 'Pemantauan',
    'status.operational': 'Beroperasi',

    // External Services
    'external.title': 'Layanan Eksternal',
    'external.description': 'Pantau dan kelola integrasi layanan eksternal untuk ekosistem IDS',
    'external.refresh': 'Segarkan',
    'external.service': 'Layanan',
    'external.type': 'Tipe',
    'external.authentication': 'Autentikasi',
    'external.last-sync': 'Sinkronisasi Terakhir',
    'external.status': 'Status',
    'external.actions': 'Aksi',
    'external.online': 'Online',
    'external.offline': 'Offline',
    'external.error': 'Error',
    'external.syncing': 'Sinkronisasi',
    'external.never': 'Tidak Pernah',
    'external.every': 'Setiap',
    'external.min': 'menit',

    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Error',
    'common.success': 'Berhasil',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.view': 'Lihat',
    'common.add': 'Tambah',
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.export': 'Ekspor',
    'common.import': 'Impor',

    // Language
    'language.switch': 'Ganti Bahasa',
    'language.english': 'Inggris',
    'language.indonesian': 'Indonesia',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('id'); // Default to Indonesian

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}