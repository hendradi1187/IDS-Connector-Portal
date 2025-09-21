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
import { mockActivityLogs } from '@/lib/data';
import { cn } from '@/lib/utils';

const statusVariants = {
  Success: 'default',
  Failed: 'destructive',
  'In Progress': 'secondary',
};

export default function ActivityLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of recent activities within the system.</CardDescription>
      </CardHeader>
      <CardContent>
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
            {mockActivityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-medium">{log.action}</div>
                  <div className="text-sm text-muted-foreground">{log.details}</div>
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
      </CardContent>
    </Card>
  );
}
