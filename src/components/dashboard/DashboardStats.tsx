import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plug, Route, AlertTriangle } from 'lucide-react';

const stats = [
  {
    title: 'Active Connectors',
    value: '12',
    icon: <Plug className="h-4 w-4 text-muted-foreground" />,
    change: '+2 from last month',
  },
  {
    title: 'Data Routes',
    value: '89',
    icon: <Route className="h-4 w-4 text-muted-foreground" />,
    change: '+15% this week',
  },
  {
    title: 'Recent Errors',
    value: '3',
    icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
    change: '1 critical',
  },
];

export default function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
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
