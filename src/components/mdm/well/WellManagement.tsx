'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Building2,
  Activity,
  BarChart3,
  Map,
  Drill,
  Download,
  Target,
  Gauge
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import WellForm from './WellForm';

interface Well {
  id: string;
  uwi: string;
  wkId: string;
  fieldId?: string;
  wellName: string;
  operator: string;
  currentClass: 'EXPLORATION' | 'DEVELOPMENT' | 'INJECTION' | 'OBSERVATION' | 'STRATIGRAPHIC';
  statusType: 'PRODUCE' | 'INJECT' | 'SUSPENDED' | 'ABANDONED' | 'DRILLING' | 'PLANNED';
  environmentType: 'LAND' | 'MARINE' | 'TRANSITION';
  profileType: 'VERTICAL' | 'HORIZONTAL' | 'DIRECTIONAL' | 'MULTILATERAL';
  spudDate?: string;
  finalDrillDate?: string;
  surfaceLongitude: number;
  surfaceLatitude: number;
  nsUtm?: number;
  ewUtm?: number;
  utmEpsg?: number;
  shape: any;
  totalDepth?: number;
  waterDepth?: number;
  kellyBushingElevation?: number;
  createdAt: string;
  updatedAt: string;
  workingArea?: {
    wkName: string;
    kkksName: string;
  };
  field?: {
    fieldName: string;
    fieldType: string;
  };
}

interface WellStats {
  overview: {
    totalWells: number;
    activeWells: number;
    explorationWells: number;
    developmentWells: number;
    wellsWithFields: number;
    recentActivity: number;
  };
  distribution: {
    byClass: Array<{ class: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byEnvironment: Array<{ environment: string; count: number }>;
    byProfile: Array<{ profile: string; count: number }>;
    byWorkingArea: Array<{ wkId: string; wkName: string; kkksName: string; count: number }>;
    byOperator: Array<{ operator: string; count: number }>;
    byField: Array<{ fieldId: string; fieldName: string; fieldType: string; count: number }>;
  };
  trends: {
    yearly: Array<{ year: number; count: number }>;
    monthly: Array<{ month: number; count: number }>;
  };
  technical: {
    depth: {
      avg_total_depth: number;
      min_total_depth: number;
      max_total_depth: number;
      avg_water_depth: number;
      min_water_depth: number;
      max_water_depth: number;
    };
    drilling: {
      avg_drilling_days: number;
      min_drilling_days: number;
      max_drilling_days: number;
    };
  };
}

export default function WellManagement() {
  const [wells, setWells] = useState<Well[]>([]);
  const [stats, setStats] = useState<WellStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWell, setEditingWell] = useState<Well | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load wells
  const loadWells = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(classFilter && { currentClass: classFilter }),
        ...(statusFilter && { statusType: statusFilter }),
        ...(environmentFilter && { environmentType: environmentFilter }),
        ...(operatorFilter && { operator: operatorFilter })
      });

      const response = await fetch(`/api/mdm/wells?${params}`);
      const data = await response.json();

      if (response.ok) {
        setWells(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading wells:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/mdm/wells/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadWells(), loadStats()]);
      setLoading(false);
    };
    loadData();
  }, [page, search, classFilter, statusFilter, environmentFilter, operatorFilter]);

  // Handle form submission
  const handleFormSubmit = async (wellData: any) => {
    try {
      const url = editingWell
        ? `/api/mdm/wells/${editingWell.id}`
        : '/api/mdm/wells';

      const response = await fetch(url, {
        method: editingWell ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wellData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingWell(null);
        await loadWells();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save well');
      }
    } catch (error) {
      console.error('Error saving well:', error);
      alert('Failed to save well');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/mdm/wells/${deleteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadWells();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete well');
      }
    } catch (error) {
      console.error('Error deleting well:', error);
      alert('Failed to delete well');
    }
    setDeleteId(null);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      PRODUCE: 'bg-green-100 text-green-800',
      INJECT: 'bg-blue-100 text-blue-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      ABANDONED: 'bg-red-100 text-red-800',
      DRILLING: 'bg-purple-100 text-purple-800',
      PLANNED: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || ''}>
        {status}
      </Badge>
    );
  };

  // Get class badge
  const getClassBadge = (wellClass: string) => {
    const colors = {
      EXPLORATION: 'bg-orange-100 text-orange-800',
      DEVELOPMENT: 'bg-green-100 text-green-800',
      INJECTION: 'bg-blue-100 text-blue-800',
      OBSERVATION: 'bg-purple-100 text-purple-800',
      STRATIGRAPHIC: 'bg-cyan-100 text-cyan-800'
    };
    return (
      <Badge className={colors[wellClass as keyof typeof colors] || ''}>
        {wellClass}
      </Badge>
    );
  };

  // Get environment badge
  const getEnvironmentBadge = (environment: string) => {
    const colors = {
      LAND: 'bg-green-100 text-green-800',
      MARINE: 'bg-blue-100 text-blue-800',
      TRANSITION: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge className={colors[environment as keyof typeof colors] || ''}>
        {environment}
      </Badge>
    );
  };

  // Get profile badge
  const getProfileBadge = (profile: string) => {
    const colors = {
      VERTICAL: 'bg-gray-100 text-gray-800',
      HORIZONTAL: 'bg-indigo-100 text-indigo-800',
      DIRECTIONAL: 'bg-orange-100 text-orange-800',
      MULTILATERAL: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[profile as keyof typeof colors] || ''}>
        {profile}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="list">Well List</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Wells</CardTitle>
                  <Drill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.totalWells}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.overview.recentActivity} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Wells</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.activeWells}</div>
                  <p className="text-xs text-muted-foreground">
                    Producing/Injecting
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exploration</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.explorationWells}</div>
                  <p className="text-xs text-muted-foreground">
                    Exploration wells
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Development</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.developmentWells}</div>
                  <p className="text-xs text-muted-foreground">
                    Development wells
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">With Fields</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.wellsWithFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Assigned to fields
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Depth</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.technical.depth.avg_total_depth || 0)}m
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total depth
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Distribution Charts */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Wells by Classification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byClass.map((item) => (
                      <div key={item.class} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getClassBadge(item.class)}
                          <span className="text-sm">{item.class}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Wells by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status)}
                          <span className="text-sm">{item.status}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Wells by Environment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byEnvironment.map((item) => (
                      <div key={item.environment} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getEnvironmentBadge(item.environment)}
                          <span className="text-sm">{item.environment}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Wells by Profile Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byProfile.map((item) => (
                      <div key={item.profile} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getProfileBadge(item.profile)}
                          <span className="text-sm">{item.profile}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Working Areas */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Working Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byWorkingArea.slice(0, 5).map((item) => (
                      <div key={item.wkId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{item.wkName}</div>
                          <div className="text-xs text-muted-foreground">{item.kkksName}</div>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Operators */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Operators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byOperator.slice(0, 5).map((item) => (
                      <div key={item.operator} className="flex items-center justify-between">
                        <span className="text-sm">{item.operator}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Header with Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Wells</h3>
              <p className="text-sm text-muted-foreground">
                Manage well data and drilling information
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Well</span>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search wells..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    <SelectItem value="EXPLORATION">Exploration</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                    <SelectItem value="INJECTION">Injection</SelectItem>
                    <SelectItem value="OBSERVATION">Observation</SelectItem>
                    <SelectItem value="STRATIGRAPHIC">Stratigraphic</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="PRODUCE">Produce</SelectItem>
                    <SelectItem value="INJECT">Inject</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                    <SelectItem value="DRILLING">Drilling</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Environments</SelectItem>
                    <SelectItem value="LAND">Land</SelectItem>
                    <SelectItem value="MARINE">Marine</SelectItem>
                    <SelectItem value="TRANSITION">Transition</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by operator..."
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Well List */}
          <div className="grid gap-4">
            {wells.map((well) => (
              <Card key={well.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{well.wellName}</h4>
                        {getStatusBadge(well.statusType)}
                        {getClassBadge(well.currentClass)}
                        {getEnvironmentBadge(well.environmentType)}
                        {getProfileBadge(well.profileType)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">UWI:</span>
                          <div className="text-muted-foreground">{well.uwi}</div>
                        </div>
                        <div>
                          <span className="font-medium">Working Area:</span>
                          <div className="text-muted-foreground">
                            {well.workingArea?.wkName || well.wkId}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Operator:</span>
                          <div className="text-muted-foreground">{well.operator}</div>
                        </div>
                        <div>
                          <span className="font-medium">Spud Date:</span>
                          <div className="text-muted-foreground">{formatDate(well.spudDate)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-2">
                        <div>
                          <span className="font-medium">Field:</span>
                          <div className="text-muted-foreground">
                            {well.field?.fieldName || well.fieldId || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Total Depth:</span>
                          <div className="text-muted-foreground">
                            {well.totalDepth ? `${well.totalDepth}m` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Water Depth:</span>
                          <div className="text-muted-foreground">
                            {well.waterDepth ? `${well.waterDepth}m` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Coordinates:</span>
                          <div className="text-muted-foreground">
                            {well.surfaceLatitude.toFixed(4)}, {well.surfaceLongitude.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingWell(well);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(well.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Well Map View</CardTitle>
              <CardDescription>
                Geographic visualization of wells with drilling information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Map visualization coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will display well locations with drilling status and depth information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Well Analytics</CardTitle>
              <CardDescription>
                Detailed analysis and reporting for well performance and drilling operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Advanced analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will include drilling performance metrics, depth analysis, and production trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      {showForm && (
        <WellForm
          well={editingWell}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingWell(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Well</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this well? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}