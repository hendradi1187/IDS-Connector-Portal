'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plug, Route, AlertTriangle, Database, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';

type Stat = {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: string;
};

const iconComponents: { [key: string]: React.ReactNode } = {
  Database: <Database className="h-4 w-4 text-muted-foreground" />,
  Route: <Route className="h-4 w-4 text-muted-foreground" />,
  TrendingUp: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  Clock: <Clock className="h-4 w-4 text-muted-foreground" />,
};

export default function DashboardStats() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Mock stats data with translations
  const stats = [
    {
      id: '1',
      title: t('stats.total-resources'),
      value: '847',
      change: '+12.5% dari bulan lalu',
      icon: 'Database'
    },
    {
      id: '2',
      title: t('stats.active-routes'),
      value: '156',
      change: '+8 rute baru',
      icon: 'Route'
    },
    {
      id: '3',
      title: t('stats.total-requests'),
      value: '24,891',
      change: '+1,204 hari ini',
      icon: 'TrendingUp'
    },
    {
      id: '4',
      title: t('stats.system-uptime'),
      value: '99.8%',
      change: `45 ${t('stats.days')} uptime`,
      icon: 'Clock'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
