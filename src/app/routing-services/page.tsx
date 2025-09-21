import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RouteManagement from '@/components/routes/RouteManagement';

function PlaceholderTab({ title, description }: { title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">{title} UI</p>
        </div>
      </CardContent>
    </Card>
  );
}


export default function RoutingServicesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4">
           <header>
            <h1 className="font-semibold text-3xl">Routing & Services</h1>
            <p className="text-muted-foreground">Manage Camel routes and service applications.</p>
          </header>
          <Tabs defaultValue="camel-routes" className="grid gap-4">
            <div className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="camel-routes">Camel Routes</TabsTrigger>
                <TabsTrigger value="service-applications">Service Applications</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="camel-routes">
              <RouteManagement />
            </TabsContent>
            <TabsContent value="service-applications">
                <PlaceholderTab 
                    title="Service Applications" 
                    description="Manage service applications registered with the connector."
                />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
