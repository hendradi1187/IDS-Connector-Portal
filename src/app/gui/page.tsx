import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceManagement from '@/components/configuration/ResourceManagement';

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
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.value === 'resource-management' ? (
                  <ResourceManagement />
                ) : (
                  <PlaceholderTab title={tab.label} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
