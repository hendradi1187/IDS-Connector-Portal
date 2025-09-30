'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building, Users, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ParticipantsPage() {
  const participants = [
    {
      id: '1',
      name: 'PT Pertamina EP',
      type: 'KKKS-Provider',
      status: 'Active',
      dataTypes: ['Seismic', 'Well', 'Production'],
      joinedDate: '2024-01-15',
      lastActivity: '2024-12-01'
    },
    {
      id: '2',
      name: 'Chevron Indonesia',
      type: 'KKKS-Provider',
      status: 'Active',
      dataTypes: ['Seismic', 'Geological'],
      joinedDate: '2024-02-20',
      lastActivity: '2024-11-28'
    },
    {
      id: '3',
      name: 'SKK Migas',
      type: 'SKK-Consumer',
      status: 'Active',
      dataTypes: ['All'],
      joinedDate: '2024-01-01',
      lastActivity: '2024-12-01'
    },
    {
      id: '4',
      name: 'BPPT Research Center',
      type: 'Research Partner',
      status: 'Pending',
      dataTypes: ['Research Data'],
      joinedDate: '2024-11-30',
      lastActivity: '2024-11-30'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Participants Management</h1>
          <p className="text-muted-foreground">
            Kelola organisasi dan peserta dalam data space
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Participant
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Registered organizations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              KKKS data providers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Consumers</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              SKK Migas consumers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Participants</CardTitle>
          <CardDescription>
            Daftar organisasi yang terdaftar dalam data space
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Types</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{participant.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{participant.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={participant.status === 'Active' ? 'default' : 'secondary'}>
                      {participant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {participant.dataTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{participant.joinedDate}</TableCell>
                  <TableCell>{participant.lastActivity}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}