import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function RoutingServicesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing & Services</CardTitle>
        <CardDescription>Manage Camel routes and service applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">Routing & Services UI</p>
        </div>
      </CardContent>
    </Card>
  );
}
