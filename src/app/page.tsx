import DashboardStats from '@/components/dashboard/DashboardStats';
import DataTrafficStats from '@/components/dashboard/DataTrafficStats';
import DataTrafficChart from '@/components/dashboard/DataTrafficChart';
import ActivityLog from '@/components/dashboard/ActivityLog';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      {/* Industrial Energy Color Scheme Dashboard */}
      <DataTrafficStats />
      <Separator />
      <DataTrafficChart />
      <Separator />
      <ActivityLog />
    </div>
  );
}
