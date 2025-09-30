'use client';

import ClearingHouseTransactionManagement from '@/components/clearing-house/ClearingHouseTransactionManagement';

export default function ClearingHousePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Clearing House</h1>
        <p className="text-muted-foreground">
          Manajemen transaksi dan pembayaran untuk pertukaran data
        </p>
      </div>
      <ClearingHouseTransactionManagement />
    </div>
  );
}