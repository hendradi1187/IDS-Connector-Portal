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
  Layers,
  Download
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
import SeismicSurveyForm from './SeismicSurveyForm';

interface SeismicSurvey {
  id: string;
  seisAcqtnSurveyId: string;
  acqtnSurveyName: string;
  baLongName: string;
  wkId: string;
  projectId?: string;
  projectLevel?: string;
  startDate?: string;
  completedDate?: string;
  shotBy?: string;
  seisDimension: 'TWO_D' | 'THREE_D';
  environment: 'MARINE' | 'LAND' | 'TRANSITION';
  seisLineType: string;
  crsRemark: string;
  shape: any;
  shapeArea?: number;
  shapeLength?: number;
  crsEpsg: number;
  dataQuality?: string;
  processingStatus?: string;
  createdAt: string;
  updatedAt: string;
  workingArea?: {
    wkName: string;
    kkksName: string;
  };
}

interface SeismicSurveyStats {
  overview: {
    totalSurveys: number;
    activeSurveys: number;
    completedSurveys: number;
    pendingSurveys: number;
    recentActivity: number;
  };
  distribution: {
    byDimension: Array<{ dimension: string; count: number }>;
    byEnvironment: Array<{ environment: string; count: number }>;
    byWorkingArea: Array<{ wkId: string; wkName: string; kkksName: string; count: number }>;
    byCompany: Array<{ company: string; count: number }>;
  };
  trends: {
    yearly: Array<{ year: number; count: number }>;
    monthly: Array<{ month: number; count: number }>;
  };
  performance: {
    duration: {
      avg_duration_days: number;
      min_duration_days: number;
      max_duration_days: number;
    };
  };
}

export default function SeismicSurveyManagement() {
  const [surveys, setSurveys] = useState<SeismicSurvey[]>([]);
  const [stats, setStats] = useState<SeismicSurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<SeismicSurvey | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [dimensionFilter, setDimensionFilter] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load seismic surveys
  const loadSurveys = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(dimensionFilter && { seisDimension: dimensionFilter }),
        ...(environmentFilter && { environment: environmentFilter }),
        ...(companyFilter && { shotBy: companyFilter })
      });

      const response = await fetch(`/api/mdm/seismic-surveys?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSurveys(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading seismic surveys:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/mdm/seismic-surveys/stats');
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
      await Promise.all([loadSurveys(), loadStats()]);
      setLoading(false);
    };
    loadData();
  }, [page, search, dimensionFilter, environmentFilter, companyFilter]);

  // Handle form submission
  const handleFormSubmit = async (surveyData: any) => {
    try {
      const url = editingSurvey
        ? `/api/mdm/seismic-surveys/${editingSurvey.id}`
        : '/api/mdm/seismic-surveys';

      const response = await fetch(url, {
        method: editingSurvey ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingSurvey(null);
        await loadSurveys();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save seismic survey');
      }
    } catch (error) {
      console.error('Error saving seismic survey:', error);
      alert('Failed to save seismic survey');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/mdm/seismic-surveys/${deleteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSurveys();
        await loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete seismic survey');
      }
    } catch (error) {
      console.error('Error deleting seismic survey:', error);
      alert('Failed to delete seismic survey');
    }
    setDeleteId(null);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Get status badge
  const getStatusBadge = (survey: SeismicSurvey) => {
    if (survey.completedDate) {
      return <Badge variant="default">Completed</Badge>;
    } else if (survey.startDate) {
      return <Badge variant="secondary">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Planned</Badge>;
    }
  };

  // Get dimension badge
  const getDimensionBadge = (dimension: string) => {
    return (
      <Badge variant={dimension === 'THREE_D' ? 'default' : 'secondary'}>
        {dimension === 'THREE_D' ? '3D' : '2D'}
      </Badge>
    );
  };

  // Get environment badge
  const getEnvironmentBadge = (environment: string) => {
    const colors = {
      MARINE: 'bg-blue-100 text-blue-800',
      LAND: 'bg-green-100 text-green-800',
      TRANSITION: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge className={colors[environment as keyof typeof colors] || ''}>
        {environment}
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
          <TabsTrigger value="list">Survey List</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.totalSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.overview.recentActivity} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.activeSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.completedSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Finished surveys
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.pendingSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Not yet started
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.performance.duration.avg_duration_days || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    days per survey
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Distribution Charts */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dimension Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Survey Distribution by Dimension</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byDimension.map((item) => (
                      <div key={item.dimension} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getDimensionBadge(item.dimension)}
                          <span className="text-sm">{item.dimension === 'THREE_D' ? '3D Seismic' : '2D Seismic'}</span>
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
                  <CardTitle>Survey Distribution by Environment</CardTitle>
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

              {/* Top Companies */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Acquisition Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.distribution.byCompany.slice(0, 5).map((item) => (
                      <div key={item.company} className="flex items-center justify-between">
                        <span className="text-sm">{item.company}</span>
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
              <h3 className="text-lg font-medium">Seismic Surveys</h3>
              <p className="text-sm text-muted-foreground">
                Manage seismic survey data and acquisition information
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Survey</span>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search surveys..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={dimensionFilter} onValueChange={setDimensionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Dimensions</SelectItem>
                    <SelectItem value="TWO_D">2D</SelectItem>
                    <SelectItem value="THREE_D">3D</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Environments</SelectItem>
                    <SelectItem value="MARINE">Marine</SelectItem>
                    <SelectItem value="LAND">Land</SelectItem>
                    <SelectItem value="TRANSITION">Transition</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by company..."
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Survey List */}
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <Card key={survey.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{survey.acqtnSurveyName}</h4>
                        {getStatusBadge(survey)}
                        {getDimensionBadge(survey.seisDimension)}
                        {getEnvironmentBadge(survey.environment)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Survey ID:</span>
                          <div className="text-muted-foreground">{survey.seisAcqtnSurveyId}</div>
                        </div>
                        <div>
                          <span className="font-medium">Working Area:</span>
                          <div className="text-muted-foreground">
                            {survey.workingArea?.wkName || survey.wkId}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Company:</span>
                          <div className="text-muted-foreground">{survey.shotBy || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span>
                          <div className="text-muted-foreground">{formatDate(survey.startDate)}</div>
                        </div>
                      </div>

                      {survey.projectId && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Project:</span>
                          <span className="ml-2 text-muted-foreground">{survey.projectId}</span>
                          {survey.projectLevel && (
                            <span className="ml-2 text-muted-foreground">({survey.projectLevel})</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSurvey(survey);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(survey.id)}
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
              <CardTitle>Seismic Survey Map View</CardTitle>
              <CardDescription>
                Geographic visualization of seismic surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Map visualization coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will display seismic survey geometries on an interactive map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed analysis and reporting for seismic surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Advanced analytics coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Will include detailed charts, trends, and insights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      {showForm && (
        <SeismicSurveyForm
          survey={editingSurvey}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingSurvey(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Seismic Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this seismic survey? This action cannot be undone.
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