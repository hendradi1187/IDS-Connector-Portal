'use client';

import ContractManagement from '@/components/contracts/ContractManagement';

export default function ContractsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Contract Management</h1>
        <p className="text-muted-foreground">
          Kelola kontrak penggunaan data dan perjanjian akses
        </p>
      </div>
      <ContractManagement />
    </div>
  );
}