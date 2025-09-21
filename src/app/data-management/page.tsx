'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceManagement from '@/components/configuration/ResourceManagement';
import ContractManagement from '@/components/contracts/ContractManagement';
import RouteManagement from '@/components/routes/RouteManagement';
import ConfigManagement from '@/components/configs/ConfigManagement';

export default function DataManagementPage() {
  const tabs = [
    { value: 'resources', label: 'Sumber Daya (Resources)' },
    { value: 'contracts', label: 'Kontrak Penggunaan' },
    { value: 'routes', label: 'Rute Data' },
    { value: 'configs', label: 'Konfigurasi' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
           <header>
            <h1 className="font-semibold text-3xl">Manajemen Data</h1>
            <p className="text-muted-foreground">Kelola sumber daya data (seperti peta GeoJSON), kontrak, rute, dan konfigurasi.</p>
          </header>
          <Tabs defaultValue="resources" className="grid gap-4">
            <div className="overflow-x-auto">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="resources">
              <ResourceManagement />
            </TabsContent>
            <TabsContent value="contracts">
              <ContractManagement />
            </TabsContent>
            <TabsContent value="routes">
              <RouteManagement />
            </TabsContent>
            <TabsContent value="configs">
              <ConfigManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
