import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockConnectors } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Power } from 'lucide-react';

export default function ConnectorStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connector Controller</CardTitle>
        <CardDescription>Status of core components.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {mockConnectors.map((connector) => (
          <div
            key={connector.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{connector.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  connector.status === 'active'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                )}
              />
              <span
                className={cn(
                  'text-sm capitalize',
                  connector.status === 'active'
                    ? 'text-green-500'
                    : 'text-red-500'
                )}
              >
                {connector.status}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
