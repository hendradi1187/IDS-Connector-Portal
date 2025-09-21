'use client';

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
import { db } from '@/lib/firebase';
import { ExternalService } from '@/lib/types';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

const statusColors: { [key in ExternalService['status']]: string } = {
  Online: 'bg-green-500',
  Offline: 'bg-red-500',
  Degraded: 'bg-yellow-500',
};

export default function ExternalServices() {
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'external-services'),
      (snapshot) => {
        const servicesData: ExternalService[] = [];
        snapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() } as ExternalService);
        });
        setServices(servicesData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="mt-2 h-4 w-48" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              services.map((service) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
