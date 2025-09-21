import DashboardStats from '@/components/dashboard/DashboardStats';
import DataTrafficChart from '@/components/dashboard/DataTrafficChart';
import ActivityLog from '@/components/dashboard/ActivityLog';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardStats />
      <DataTrafficChart />
      <Separator />
      <ActivityLog />
    </div>
  );
}
