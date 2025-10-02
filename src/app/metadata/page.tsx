'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MigasMetadataSimple from '@/components/metadata/MigasMetadataSimple';
import DataQualityManagement from '@/components/metadata/DataQualityManagement';
import AccessControlManagement from '@/components/metadata/AccessControlManagement';
import MetadataOverview from '@/components/metadata/MetadataOverview';
import MetadataApprovalQueue from '@/components/admin/MetadataApprovalQueue';
import { useAuth } from '@/context/AuthContext';

export default function MetadataPage() {
  const { user } = useAuth();

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'migas', label: 'Migas Metadata' },
    { value: 'quality', label: 'Data Quality' },
    { value: 'access', label: 'Access Control' },
    ...(user?.role === 'Admin' ? [{ value: 'approvals', label: 'Approval Queue' }] : []),
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
           <header>
            <h1 className="font-semibold text-3xl">Metadata Management</h1>
            <p className="text-muted-foreground">Kelola metadata dataset, kualitas data, dan kontrol akses untuk data migas dengan standar PPDM, Master Data Management, dan Satu Data Indonesia.</p>
          </header>
          <Tabs defaultValue="overview" className="grid gap-4">
            <div className="overflow-x-auto">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="overview">
              <MetadataOverview />
            </TabsContent>
            <TabsContent value="migas">
              <MigasMetadataSimple />
            </TabsContent>
            <TabsContent value="quality">
              <DataQualityManagement />
            </TabsContent>
            <TabsContent value="access">
              <AccessControlManagement />
            </TabsContent>
            {user?.role === 'Admin' && (
              <TabsContent value="approvals">
                <MetadataApprovalQueue />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}