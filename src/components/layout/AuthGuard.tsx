'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const FullPageLoader = () => (
    <div className="flex-1 p-4 lg:p-6">
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[125px] w-full" />
                <Skeleton className="h-[125px] w-full" />
                <Skeleton className="h-[125px] w-full" />
            </div>
            <Skeleton className="h-[350px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
    </div>
);


export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== '/login') {
      router.push('/login');
    }

    if (user && pathname === '/login') {
     router.push('/');
    }
  }, [user, loading, router, pathname]);

  if (loading || (!user && pathname !== '/login') || (user && pathname === '/login')) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
