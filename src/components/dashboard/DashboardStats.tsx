'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plug, Route, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';

type Stat = {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: string;
};

const iconComponents: { [key: string]: React.ReactNode } = {
  Plug: <Plug className="h-4 w-4 text-muted-foreground" />,
  Route: <Route className="h-4 w-4 text-muted-foreground" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
};

export default function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'stats'), (snapshot) => {
      const statsData: Stat[] = [];
      snapshot.forEach((doc) => {
        statsData.push({ id: doc.id, ...doc.data() } as Stat);
      });
      // Ensure a consistent order
      const orderedTitles = ['Active Connectors', 'Data Routes', 'Recent Errors'];
      statsData.sort((a, b) => orderedTitles.indexOf(a.title) - orderedTitles.indexOf(b.title));
      setStats(statsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/4" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/4" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {iconComponents[stat.icon]}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}