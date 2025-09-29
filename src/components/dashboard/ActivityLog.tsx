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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';

const statusVariants = {
  Success: 'default',
  Failed: 'destructive',
  'In Progress': 'secondary',
};

interface ActivityLogData {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  details: string;
  status: 'Success' | 'Failed' | 'In Progress';
  timestamp: string;
}

export default function ActivityLog() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Mock activity log data with translations
  const logs: ActivityLogData[] = [
    {
      id: '1',
      user: { name: 'Admin KKKS', avatar: '' },
      action: t('activity.new-resource'),
      details: 'Seismic Data Blok X',
      status: 'Success',
      timestamp: '2 jam yang lalu'
    },
    {
      id: '2',
      user: { name: 'SKK Migas', avatar: '' },
      action: t('activity.route-configured'),
      details: 'Data exchange route untuk PT ABC',
      status: 'Success',
      timestamp: '4 jam yang lalu'
    },
    {
      id: '3',
      user: { name: 'User KKKS', avatar: '' },
      action: t('activity.user-login'),
      details: 'Login dari IP 192.168.1.100',
      status: 'Success',
      timestamp: '6 jam yang lalu'
    },
    {
      id: '4',
      user: { name: 'System', avatar: '' },
      action: t('activity.data-sync'),
      details: 'Sinkronisasi dengan broker IDS',
      status: 'Success',
      timestamp: '8 jam yang lalu'
    },
    {
      id: '5',
      user: { name: 'Admin', avatar: '' },
      action: t('activity.system-update'),
      details: 'Update konfigurasi keamanan',
      status: 'In Progress',
      timestamp: '1 hari yang lalu'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('activity.title')}</CardTitle>
        <CardDescription>
          Log aktivitas terbaru dalam sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="hidden sm:table-cell">User</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.details}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.user.avatar} alt={log.user.name} />
                        <AvatarFallback>
                          {log.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{log.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        statusVariants[log.status] as
                          | 'default'
                          | 'destructive'
                          | 'secondary'
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
