'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { Connector } from '@/lib/types';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { Power } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export default function ConnectorStatus() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'controllers'), (snapshot) => {
      const connectorsData: Connector[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        connectorsData.push({ id: doc.id, name: data.name, status: data.status ? 'active' : 'inactive' });
      });
      setConnectors(connectorsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connector Controller</CardTitle>
        <CardDescription>Status of core components.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </>
        ) : (
          connectors.map((connector) => (
            <div
              key={connector.id}
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
