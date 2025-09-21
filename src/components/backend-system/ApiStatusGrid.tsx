'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { ApiStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

const statusColors: { [key in ApiStatus['status']]: string } = {
  Online: 'bg-green-500',
  Offline: 'bg-red-500',
  Degraded: 'bg-yellow-500',
};

const statusTextColors: { [key in ApiStatus['status']]: string } = {
  Online: 'text-green-500',
  Offline: 'text-red-500',
  Degraded: 'text-yellow-500',
};

export default function ApiStatusGrid() {
  const [apis, setApis] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'apis'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apisData: ApiStatus[] = [];
      snapshot.forEach((doc) => {
        apisData.push({ id: doc.id, ...doc.data() } as ApiStatus);
      });
      setApis(apisData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Status</CardTitle>
        <CardDescription>
          Real-time status of backend service APIs.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
             <Card key={i}>
              <CardHeader className='pb-2'>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                 <Skeleton className="h-6 w-1/4" />
                 <Skeleton className="h-5 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          apis.map((api) => (
            <Card key={api.id}>
              <CardHeader className='pb-2'>
                <CardTitle className="text-lg">{api.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      statusColors[api.status]
                    )}
                  />
                  <span className={cn('font-semibold', statusTextColors[api.status])}>
                    {api.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {api.latency}ms
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
