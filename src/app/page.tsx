import DashboardStats from '@/components/dashboard/DashboardStats';
import DataTrafficChart from '@/components/dashboard/DataTrafficChart';
import ActivityLog from '@/components/dashboard/ActivityLog';
import ConnectorStatus from '@/components/dashboard/ConnectorStatus';
import DataspaceModules from '@/components/dashboard/DataspaceModules';
import ExternalServices from '@/components/dashboard/ExternalServices';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardStats />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataTrafficChart />
        </div>
        <div>
          <ConnectorStatus />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DataspaceModules />
        <ExternalServices />
      </div>
      <Separator />
      <ActivityLog />
    </div>
  );
}
