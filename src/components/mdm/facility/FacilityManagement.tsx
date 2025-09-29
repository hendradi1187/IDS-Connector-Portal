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
  Factory,
  Download,
  Cable,
  Gauge,
  Ship,
  Zap,
  Database,
  Settings
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
import FacilityForm from './FacilityForm';

interface Facility {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: 'PIPELINE' | 'PLATFORM' | 'FLOATING_FACILITY' | 'CUSTODY_TRANSFER' | 'PROCESSING_PLANT' | 'STORAGE_TANK' | 'CABLE' | 'OTHER_FACILITIES';
  subType?: string;
  wkId: string;
  fieldId?: string;
  operator: string;
  status: 'OPERATIONAL' | 'UNDER_CONSTRUCTION' | 'PLANNED' | 'SUSPENDED' | 'DECOMMISSIONED' | 'ABANDONED';
  installationDate?: string;
  commissioningDate?: string;
  // Pipeline specific
  diameter?: number;
  length?: number;
  fluidType?: string;
  // Platform specific
  capacityProd?: number;
  waterDepth?: number;
  noOfWell?: number;
  // Floating facility specific
  vesselCapacity?: number;
  // Processing plant specific
  storageCapacity?: number;
  plantCapacity?: number;
  power?: number;
  // Location
  longitude?: number;
  latitude?: number;
  shape: any;
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
  wells?: Array<{
    well: {
      uwi: string;
      wellName: string;
      statusType: string;
    };
  }>;
  _count?: {
    wells: number;
    fields: number;
  };
}

interface FacilityStats {
  overview: {
    totalFacilities: number;
    operationalFacilities: number;
    underConstructionFacilities: number;
    plannedFacilities: number;
    facilitiesWithWells: number;
    facilitiesWithFields: number;
    recentActivity: number;
  };
  distribution: {
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byWorkingArea: Array<{ wkId: string; wkName: string; kkksName: string; count: number }>;
    byOperator: Array<{ operator: string; count: number }>;
    byField: Array<{ fieldId: string; fieldName: string; fieldType: string; count: number }>;
  };
  trends: {
    yearly: Array<{ year: number; count: number }>;
    monthly: Array<{ month: number; count: number }>;
  };
  technical: {
    pipeline: {
      avg_diameter: number;
      avg_length: number;
      total_length: number;
    };
    platform: {
      avg_capacity: number;
      avg_water_depth: number;
      avg_wells: number;
    };
    processing: {
      avg_plant_capacity: number;
      avg_storage_capacity: number;
      avg_power: number;
    };
  };
  topFacilities: {
    byConnections: Array<{
      id: string;
      facilityName: string;
      facilityType: string;
      _count: {
        wells: number;
        fields: number;
      };
    }>;
  };
}

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState<FacilityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load facilities
  const loadFacilities = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(typeFilter && { facilityType: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(operatorFilter && { operator: operatorFilter }),
        ...(fieldFilter && { fieldId: fieldFilter })
      });

      const response = await fetch(`/api/mdm/facilities?${params}`);
      const data = await response.json();

      if (response.ok) {
        setFacilities(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading facilities:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/mdm/facilities/stats');
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
      await Promise.all([loadFacilities(), loadStats()]);
      setLoading(false);
    };
    loadData();
  }, [page, search, typeFilter, statusFilter, operatorFilter, fieldFilter]);

  // Handle form submission
  const handleFormSubmit = async (facilityData: any) => {
    try {
      const url = editingFacility
        ? `/api/mdm/facilities/${editingFacility.id}`
        : '/api/mdm/facilities';

      const response = await fetch(url, {
        method: editingFacility ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facilityData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingFacility(null);
        await loadFacilities();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save facility');
      }
    } catch (error) {
      console.error('Error saving facility:', error);
      alert('Failed to save facility');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/mdm/facilities/${deleteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadFacilities();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete facility');
      }
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert('Failed to delete facility');
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
      OPERATIONAL: 'bg-green-100 text-green-800',
      UNDER_CONSTRUCTION: 'bg-blue-100 text-blue-800',
      PLANNED: 'bg-purple-100 text-purple-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      DECOMMISSIONED: 'bg-gray-100 text-gray-800',
      ABANDONED: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || ''}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Get type badge with icon
  const getTypeBadge = (facilityType: string) => {
    const typeConfig = {
      PIPELINE: { color: 'bg-blue-100 text-blue-800', icon: Cable },
      PLATFORM: { color: 'bg-orange-100 text-orange-800', icon: Factory },
      FLOATING_FACILITY: { color: 'bg-cyan-100 text-cyan-800', icon: Ship },
      CUSTODY_TRANSFER: { color: 'bg-purple-100 text-purple-800', icon: Settings },
      PROCESSING_PLANT: { color: 'bg-green-100 text-green-800', icon: Factory },
      STORAGE_TANK: { color: 'bg-yellow-100 text-yellow-800', icon: Database },
      CABLE: { color: 'bg-gray-100 text-gray-800', icon: Cable },
      OTHER_FACILITIES: { color: 'bg-slate-100 text-slate-800', icon: Building2 }
    };

    const config = typeConfig[facilityType as keyof typeof typeConfig] || typeConfig.OTHER_FACILITIES;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{facilityType.replace('_', ' ')}</span>
      </Badge>
    );
  };

  // Get technical specs for facility
  const getTechnicalSpecs = (facility: Facility) => {
    const specs: string[] = [];

    if (facility.facilityType === 'PIPELINE') {
      if (facility.diameter) specs.push(`${facility.diameter}" diameter`);
      if (facility.length) specs.push(`${facility.length} km length`);
      if (facility.fluidType) specs.push(facility.fluidType);
    } else if (facility.facilityType === 'PLATFORM') {
      if (facility.capacityProd) specs.push(`${facility.capacityProd} capacity`);
      if (facility.waterDepth) specs.push(`${facility.waterDepth}m water depth`);
      if (facility.noOfWell) specs.push(`${facility.noOfWell} wells`);
    } else if (facility.facilityType === 'PROCESSING_PLANT') {
      if (facility.plantCapacity) specs.push(`${facility.plantCapacity} plant capacity`);
      if (facility.storageCapacity) specs.push(`${facility.storageCapacity} storage`);
      if (facility.power) specs.push(`${facility.power} MW power`);
    } else if (facility.facilityType === 'FLOATING_FACILITY') {
      if (facility.vesselCapacity) specs.push(`${facility.vesselCapacity} vessel capacity`);
    }

    return specs.slice(0, 3); // Limit to 3 specs for display
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="list">Facility List</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.totalFacilities}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.overview.recentActivity} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Operational</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.operationalFacilities}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Under Construction</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.underConstructionFacilities}</div>
                  <p className="text-xs text-muted-foreground">
                    Being built
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planned</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.plannedFacilities}</div>
                  <p className="text-xs text-muted-foreground">
                    Future projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">With Wells</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.facilitiesWithWells}</div>
                  <p className="text-xs text-muted-foreground">
                    Connected to wells
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">With Fields</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.facilitiesWithFields}</div>
                  <p className="text-xs text-muted-foreground">
                    Associated with fields
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Pipeline</CardTitle>
                  <Cable className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.technical.pipeline.avg_length || 0)}km
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average length
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
                  <CardTitle>Facilities by Type</CardTitle>
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
                  <CardTitle>Facilities by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status)}
                          <span className="text-sm">{item.status.replace('_', ' ')}</span>
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

              {/* Technical Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center space-x-1">
                        <Cable className="w-3 h-3" />
                        <span>Total Pipeline Length</span>
                      </span>
                      <span className="font-medium">{Math.round(stats.technical.pipeline.total_length || 0)} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center space-x-1">
                        <Factory className="w-3 h-3" />
                        <span>Avg Platform Capacity</span>
                      </span>
                      <span className="font-medium">{Math.round(stats.technical.platform.avg_capacity || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Avg Plant Power</span>
                      </span>
                      <span className="font-medium">{Math.round(stats.technical.processing.avg_power || 0)} MW</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Connected Facilities */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Connected Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topFacilities.byConnections.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{item.facilityName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item._count.fields} fields, {item._count.wells} wells
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTypeBadge(item.facilityType)}
                        </div>
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
              <h3 className="text-lg font-medium">Facilities</h3>
              <p className="text-sm text-muted-foreground">
                Manage production and transportation facility data
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search facilities..."
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
                    <SelectItem value="PIPELINE">Pipeline</SelectItem>
                    <SelectItem value="PLATFORM">Platform</SelectItem>
                    <SelectItem value="FLOATING_FACILITY">Floating Facility</SelectItem>
                    <SelectItem value="PROCESSING_PLANT">Processing Plant</SelectItem>
                    <SelectItem value="STORAGE_TANK">Storage Tank</SelectItem>
                    <SelectItem value="CUSTODY_TRANSFER">Custody Transfer</SelectItem>
                    <SelectItem value="CABLE">Cable</SelectItem>
                    <SelectItem value="OTHER_FACILITIES">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="OPERATIONAL">Operational</SelectItem>
                    <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by operator..."
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                />
                <Input
                  placeholder="Filter by field..."
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Facility List */}
          <div className="grid gap-4">
            {facilities.map((facility) => (
              <Card key={facility.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{facility.facilityName}</h4>
                        {getStatusBadge(facility.status)}
                        {getTypeBadge(facility.facilityType)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Facility ID:</span>
                          <div className="text-muted-foreground">{facility.facilityId}</div>
                        </div>
                        <div>
                          <span className="font-medium">Working Area:</span>
                          <div className="text-muted-foreground">
                            {facility.workingArea?.wkName || facility.wkId}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Operator:</span>
                          <div className="text-muted-foreground">{facility.operator}</div>
                        </div>
                        <div>
                          <span className="font-medium">Installation:</span>
                          <div className="text-muted-foreground">{formatDate(facility.installationDate)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-2">
                        <div>
                          <span className="font-medium">Field:</span>
                          <div className="text-muted-foreground">
                            {facility.field?.fieldName || facility.fieldId || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Sub Type:</span>
                          <div className="text-muted-foreground">{facility.subType || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Connections:</span>
                          <div className="text-muted-foreground">
                            {facility._count?.wells || 0} wells, {facility._count?.fields || 0} fields
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Commissioning:</span>
                          <div className="text-muted-foreground">{formatDate(facility.commissioningDate)}</div>
                        </div>
                      </div>

                      {/* Technical Specifications */}
                      {getTechnicalSpecs(facility).length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Technical Specs:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {getTechnicalSpecs(facility).map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFacility(facility);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(facility.id)}
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
              <CardTitle>Facility Map View</CardTitle>
              <CardDescription>
                Geographic visualization of production and transportation facilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Map visualization coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will display facility locations with pipeline networks and platform connections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Facility Analytics</CardTitle>
              <CardDescription>
                Capacity analysis, utilization metrics, and infrastructure optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Advanced analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will include capacity utilization, network analysis, and infrastructure planning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      {showForm && (
        <FacilityForm
          facility={editingFacility}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingFacility(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this facility? This action cannot be undone and will affect associated wells and fields.
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