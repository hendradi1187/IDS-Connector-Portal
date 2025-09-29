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
  Mountain,
  Download,
  Target,
  Gauge,
  Droplets,
  Flame,
  Factory
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
import FieldForm from './FieldForm';

interface Field {
  id: string;
  fieldId: string;
  fieldName: string;
  wkId: string;
  basin?: string;
  formationName?: string;
  discoveryDate?: string;
  fieldType: 'OIL' | 'GAS' | 'OIL_GAS' | 'NON_PRODUCTION' | 'CONDENSATE';
  status: 'ACTIVE' | 'ABANDONED' | 'SUSPENDED' | 'DEVELOPMENT' | 'DISCOVERY';
  operator: string;
  isOffshore: boolean;
  shape: any;
  reservoirType?: string;
  estimatedReserves?: number;
  currentProduction?: number;
  createdAt: string;
  updatedAt: string;
  workingArea?: {
    wkName: string;
    kkksName: string;
  };
  wells?: Array<{
    id: string;
    uwi: string;
    wellName: string;
    statusType: string;
  }>;
  _count?: {
    wells: number;
    facilities: number;
  };
}

interface FieldStats {
  overview: {
    totalFields: number;
    activeFields: number;
    onshoreFields: number;
    offshoreFields: number;
    oilFields: number;
    gasFields: number;
    recentActivity: number;
  };
  distribution: {
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byWorkingArea: Array<{ wkId: string; wkName: string; kkksName: string; count: number }>;
    byOperator: Array<{ operator: string; count: number }>;
    byBasin: Array<{ basin: string; count: number }>;
  };
  trends: {
    yearly: Array<{ year: number; count: number }>;
    monthly: Array<{ month: number; count: number }>;
  };
  performance: {
    production: {
      avg_production: number;
      min_production: number;
      max_production: number;
      total_production: number;
    };
    reserves: {
      avg_reserves: number;
      min_reserves: number;
      max_reserves: number;
      total_reserves: number;
    };
  };
  topFields: {
    byWells: Array<{
      id: string;
      fieldName: string;
      _count: {
        wells: number;
        facilities: number;
      };
    }>;
  };
}

export default function FieldManagement() {
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<FieldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load fields
  const loadFields = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(typeFilter && { fieldType: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(locationFilter && { isOffshore: locationFilter }),
        ...(operatorFilter && { operator: operatorFilter })
      });

      const response = await fetch(`/api/mdm/fields?${params}`);
      const data = await response.json();

      if (response.ok) {
        setFields(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/mdm/fields/stats');
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
      await Promise.all([loadFields(), loadStats()]);
      setLoading(false);
    };
    loadData();
  }, [page, search, typeFilter, statusFilter, locationFilter, operatorFilter]);

  // Handle form submission
  const handleFormSubmit = async (fieldData: any) => {
    try {
      const url = editingField
        ? `/api/mdm/fields/${editingField.id}`
        : '/api/mdm/fields';

      const response = await fetch(url, {
        method: editingField ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingField(null);
        await loadFields();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save field');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save field');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/mdm/fields/${deleteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadFields();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
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
      ACTIVE: 'bg-green-100 text-green-800',
      ABANDONED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      DEVELOPMENT: 'bg-blue-100 text-blue-800',
      DISCOVERY: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || ''}>
        {status}
      </Badge>
    );
  };

  // Get type badge
  const getTypeBadge = (fieldType: string) => {
    const colors = {
      OIL: 'bg-orange-100 text-orange-800',
      GAS: 'bg-blue-100 text-blue-800',
      OIL_GAS: 'bg-purple-100 text-purple-800',
      NON_PRODUCTION: 'bg-gray-100 text-gray-800',
      CONDENSATE: 'bg-cyan-100 text-cyan-800'
    };

    const icons = {
      OIL: <Droplets className="w-3 h-3" />,
      GAS: <Flame className="w-3 h-3" />,
      OIL_GAS: <Factory className="w-3 h-3" />,
      NON_PRODUCTION: <Target className="w-3 h-3" />,
      CONDENSATE: <Gauge className="w-3 h-3" />
    };

    return (
      <Badge className={`${colors[fieldType as keyof typeof colors] || ''} flex items-center space-x-1`}>
        {icons[fieldType as keyof typeof icons]}
        <span>{fieldType.replace('_', ' ')}</span>
      </Badge>
    );
  };

  // Get location badge
  const getLocationBadge = (isOffshore: boolean) => {
    return (
      <Badge variant={isOffshore ? "default" : "secondary"}>
        {isOffshore ? 'Offshore' : 'Onshore'}
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
          <TabsTrigger value="list">Field List</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.totalFields}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.overview.recentActivity} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Fields</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.activeFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently producing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oil Fields</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.oilFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Oil & oil-gas fields
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gas Fields</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.gasFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Gas & condensate fields
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Onshore</CardTitle>
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.onshoreFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Land-based fields
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Offshore</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.offshoreFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Marine-based fields
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Production</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.performance.production.avg_production || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    BOPD/MMSCFD
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Distribution Charts */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Fields by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(item.type)}
                          <span className="text-sm">{item.type.replace('_', ' ')}</span>
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
                  <CardTitle>Fields by Status</CardTitle>
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

              {/* Top Basins */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Basins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byBasin.slice(0, 5).map((item) => (
                      <div key={item.basin} className="flex items-center justify-between">
                        <span className="text-sm">{item.basin}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Fields by Wells */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Fields by Wells</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topFields.byWells.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{item.fieldName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item._count.facilities} facilities
                          </div>
                        </div>
                        <span className="font-medium">{item._count.wells} wells</span>
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
              <h3 className="text-lg font-medium">Fields</h3>
              <p className="text-sm text-muted-foreground">
                Manage field data and production information
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field</span>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fields..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="OIL">Oil</SelectItem>
                    <SelectItem value="GAS">Gas</SelectItem>
                    <SelectItem value="OIL_GAS">Oil & Gas</SelectItem>
                    <SelectItem value="CONDENSATE">Condensate</SelectItem>
                    <SelectItem value="NON_PRODUCTION">Non-Production</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                    <SelectItem value="DISCOVERY">Discovery</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    <SelectItem value="false">Onshore</SelectItem>
                    <SelectItem value="true">Offshore</SelectItem>
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

          {/* Field List */}
          <div className="grid gap-4">
            {fields.map((field) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{field.fieldName}</h4>
                        {getStatusBadge(field.status)}
                        {getTypeBadge(field.fieldType)}
                        {getLocationBadge(field.isOffshore)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Field ID:</span>
                          <div className="text-muted-foreground">{field.fieldId}</div>
                        </div>
                        <div>
                          <span className="font-medium">Working Area:</span>
                          <div className="text-muted-foreground">
                            {field.workingArea?.wkName || field.wkId}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Operator:</span>
                          <div className="text-muted-foreground">{field.operator}</div>
                        </div>
                        <div>
                          <span className="font-medium">Discovery Date:</span>
                          <div className="text-muted-foreground">{formatDate(field.discoveryDate)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-2">
                        <div>
                          <span className="font-medium">Basin:</span>
                          <div className="text-muted-foreground">{field.basin || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Formation:</span>
                          <div className="text-muted-foreground">{field.formationName || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Wells:</span>
                          <div className="text-muted-foreground">
                            {field._count?.wells || 0} wells
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Production:</span>
                          <div className="text-muted-foreground">
                            {field.currentProduction ? `${field.currentProduction} BOPD/MMSCFD` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {field.estimatedReserves && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Estimated Reserves:</span>
                          <span className="ml-2 text-muted-foreground">
                            {field.estimatedReserves} MMSTB/BSCF
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingField(field);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(field.id)}
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
              <CardTitle>Field Map View</CardTitle>
              <CardDescription>
                Geographic visualization of oil and gas fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Map visualization coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will display field boundaries with production and reserve information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Field Analytics</CardTitle>
              <CardDescription>
                Production analysis, reserve estimation, and field performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Advanced analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will include production forecasting, reserve analysis, and field optimization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      {showForm && (
        <FieldForm
          field={editingField}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingField(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this field? This action cannot be undone and will affect associated wells and facilities.
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