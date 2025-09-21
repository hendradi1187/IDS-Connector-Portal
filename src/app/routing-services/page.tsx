import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RouteManagement from '@/components/routes/RouteManagement';
import ServiceApplicationManagement from '@/components/service-applications/ServiceApplicationManagement';

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
              <ServiceApplicationManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
