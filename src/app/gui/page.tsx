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
    { value: 'request-data', label: 'Minta Data' },
    { value: 'resource-management', label: 'Kelola Sumber Daya' },
    { value: 'app-routes', label: 'Rute Aplikasi' },
    { value: 'broker-management', label: 'Kelola Broker' },
    { value: 'network-settings', label: 'Pengaturan Jaringan' },
    { value: 'container-management', label: 'Manajemen Kontainer' },
    { value: 'configure-connector', label: 'Konfigurasi Konektor' },
    { value: 'data-sources', label: 'Kelola Sumber Data' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
          <h1 className="font-semibold text-3xl">GUI</h1>
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
                description="Kelola, monitor, dan operasikan kontainer tempat konektor berjalan."
                content="UI untuk Start/Stop/Restart, dan memonitor CPU, Memori, dan Log."
              />
            </TabsContent>
            <TabsContent value="configure-connector">
              <ConfigManagement />
            </TabsContent>
            <TabsContent value="data-sources">
              <PlaceholderTab 
                title="Kelola Sumber Data"
                description="Kelola sumber data eksternal yang terhubung dengan konektor."
                content="UI Manajemen Sumber Data"
               />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
