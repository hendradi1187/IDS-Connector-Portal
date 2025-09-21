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
import { Module } from '@/lib/types';
import { collection, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

type ModuleCounts = {
  [key: string]: number;
};

const initialModules: Omit<Module, 'items'>[] = [
  {
    id: '1',
    name: 'Resource Handler',
    description: 'Manage data resources and offerings.',
    collectionName: 'resources',
  },
  {
    id: '2',
    name: 'Usage Control',
    description: 'Define and enforce data usage policies.',
    collectionName: 'policies',
  },
  {
    id: '3',
    name: 'Message Handling',
    description: 'Process and route IDS messages.',
    collectionName: 'messages',
  },
  {
    id: '4',
    name: 'Identity Management',
    description: 'Manage connector and user identities.',
    collectionName: 'users',
  },
];

export default function DataspaceModules() {
  const [counts, setCounts] = useState<ModuleCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const promises = initialModules.map(async (module) => {
          if (!module.collectionName) return { name: module.name, count: 0 };
          const coll = collection(db, module.collectionName);
          const snapshot = await getCountFromServer(coll);
          return { name: module.name, count: snapshot.data().count };
        });

        const results = await Promise.all(promises);
        const newCounts: ModuleCounts = {};
        results.forEach((result) => {
          newCounts[result.name] = result.count;
        });
        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching counts from server: ", error);
        // Fallback or error state
        const errorCounts: ModuleCounts = {};
        initialModules.forEach(mod => errorCounts[mod.name] = 0);
        setCounts(errorCounts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();

    // Set up listeners for real-time updates if needed, though getCountFromServer is more efficient for just counts.
    const unsubscribes = initialModules.map(module => {
      if (!module.collectionName) return () => {};
      const coll = collection(db, module.collectionName);
      return onSnapshot(coll, async () => {
         // Re-fetch counts when data changes
         // This is a simple way to trigger refresh. For high-frequency updates, a more sophisticated approach might be needed.
         const snapshot = await getCountFromServer(coll);
         setCounts(prevCounts => ({
           ...prevCounts,
           [module.name]: snapshot.data().count
         }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());

  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataspace Connector Modules</CardTitle>
        <CardDescription>
          Overview of integrated data management modules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead className="text-right">Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                     <Skeleton className="mt-2 h-4 w-48" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              initialModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <div className="font-medium">{module.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {module.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {counts[module.name] ?? 0}
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
