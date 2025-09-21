'use client';

import BrokerManagement from '@/components/brokers/BrokerManagement';
import ConfigManagement from '@/components/configs/ConfigManagement';
import DataRequestManagement from '@/components/data-requests/DataRequestManagement';
import ResourceManagement from '@/components/configuration/ResourceManagement';
import RouteManagement from '@/components/routes/RouteManagement';
import NetworkSettings from '@/components/network/NetworkSettings';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function PlaceholderTab({ title, description, content }: { title: string, description: string, content: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GuiPage() {
  const tabs = [
    { value: 'request-data', label: 'Permintaan Data (Consumer)' },
    { value: 'resource-management', label: 'Manajemen Sumber Daya (Provider)' },
    { value: 'app-routes', label: 'Rute Data' },
    { value: 'broker-management', label: 'Manajemen Broker' },
    { value: 'network-settings', label: 'Pengaturan Jaringan' },
    { value: 'container-management', label: 'Manajemen Kontainer' },
    { value: 'configure-connector', label: 'Konfigurasi Konektor' },
    { value: 'data-sources', label: 'Sumber Data Eksternal' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
          <h1 className="font-semibold text-3xl">Portal Operasional GUI</h1>
           <p className="text-muted-foreground">Antarmuka untuk mengelola semua aspek operasional konektor data hulu migas.</p>
          <Tabs defaultValue="request-data" className="grid gap-4">
            <div className="overflow-x-auto">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="request-data">
              <DataRequestManagement />
            </TabsContent>
            <TabsContent value="resource-management">
              <ResourceManagement />
            </TabsContent>
            <TabsContent value="app-routes">
              <RouteManagement />
            </TabsContent>
             <TabsContent value="broker-management">
              <BrokerManagement />
            </TabsContent>
            <TabsContent value="network-settings">
              <NetworkSettings />
            </TabsContent>
            <TabsContent value="container-management">
              <PlaceholderTab 
                title="Manajemen Kontainer" 
                description="Kelola, monitor, dan operasikan kontainer Docker tempat konektor data berjalan."
                content="UI untuk Start/Stop/Restart kontainer dan memonitor CPU, Memori, dan Log."
              />
            </TabsContent>
            <TabsContent value="configure-connector">
              <ConfigManagement />
            </TabsContent>
            <TabsContent value="data-sources">
              <PlaceholderTab 
                title="Kelola Sumber Data"
                description="Konfigurasi koneksi ke sumber data internal KKKS (misalnya: database, data lake)."
                content="UI Manajemen Sumber Data Internal"
               />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
