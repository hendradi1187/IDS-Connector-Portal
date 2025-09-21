import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { mockServices } from '@/lib/data';
  import { cn } from '@/lib/utils';
  
  const statusColors = {
    Online: 'bg-green-500',
    Offline: 'bg-red-500',
    Degraded: 'bg-yellow-500',
  };
  
  export default function ExternalServices() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>External Services</CardTitle>
          <CardDescription>
            Status of aggregated external services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {service.url}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          statusColors[service.status]
                        )}
                      />
                      <span className="text-sm">{service.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  