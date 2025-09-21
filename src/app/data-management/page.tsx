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
          Manage {title.toLowerCase()} for your connector.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">{title} Management UI</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataManagementPage() {
  const tabs = [
    { value: 'resources', label: 'Resources' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'routes', label: 'Routes' },
    { value: 'configs', label: 'Configs' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
           <header>
            <h1 className="font-semibold text-3xl">Data Management</h1>
            <p className="text-muted-foreground">Manage resources, contracts, routes, and configs.</p>
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
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {tab.value === 'resources' ? (
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