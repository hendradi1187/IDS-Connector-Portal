import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceManagement from '@/components/configuration/ResourceManagement';
import RouteManagement from '@/components/routes/RouteManagement';
import ConfigManagement from '@/components/configs/ConfigManagement';
import BrokerManagement from '@/components/brokers/BrokerManagement';

function PlaceholderTab({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Kelola {title.toLowerCase()} untuk konektor Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">{title} UI Manajemen</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GuiPage() {
  const tabs = [
    { value: 'request-data', label: 'Minta Data' },
    { value: 'app-routes', label: 'Rute Aplikasi' },
    { value: 'network-settings', label: 'Pengaturan Jaringan' },
    { value: 'container-management', label: 'Manajemen Kontainer' },
    { value: 'configure-connector', label: 'Konfigurasi Konektor' },
    { value: 'resource-management', label: 'Kelola Sumber Daya' },
    { value: 'data-sources', label: 'Kelola Sumber Data' },
    { value: 'broker-management', label: 'Kelola Broker' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
          <h1 className="font-semibold text-3xl">GUI</h1>
          <Tabs defaultValue="resource-management" className="grid gap-4">
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
              <PlaceholderTab title="Minta Data" />
            </TabsContent>
            <TabsContent value="app-routes">
              <RouteManagement />
            </TabsContent>
            <TabsContent value="network-settings">
              <PlaceholderTab title="Pengaturan Jaringan" />
            </TabsContent>
            <TabsContent value="container-management">
              <PlaceholderTab title="Manajemen Kontainer" />
            </TabsContent>
            <TabsContent value="configure-connector">
              <ConfigManagement />
            </TabsContent>
            <TabsContent value="resource-management">
              <ResourceManagement />
            </TabsContent>
            <TabsContent value="data-sources">
              <PlaceholderTab title="Kelola Sumber Data" />
            </TabsContent>
            <TabsContent value="broker-management">
              <BrokerManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
