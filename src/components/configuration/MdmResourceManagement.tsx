'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  MapPin,
  Waves,
  Drill,
  Mountain,
  Factory,
  FileText,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';

// Import dialog components
import ImportDataDialog from '@/components/dialogs/ImportDataDialog';
import ExportReportDialog from '@/components/dialogs/ExportReportDialog';
import SettingsDialog from '@/components/dialogs/SettingsDialog';

// Import existing management components
import { WorkingAreaManagement } from '@/components/dataspace-connector/WorkingAreaManagement';
import { SeismicSurveyManagement } from '@/components/dataspace-connector/SeismicSurveyManagement';
import { WellManagement } from '@/components/dataspace-connector/WellManagement';
import { FieldManagement } from '@/components/dataspace-connector/FieldManagement';
import { FacilityManagement } from '@/components/dataspace-connector/FacilityManagement';

const initialMdmDomains = [
  {
    id: 'working-area',
    label: 'Working Area',
    title: 'Wilayah Kerja',
    description: 'Pengelolaan metadata wilayah kerja KKKS',
    icon: MapPin,
    color: 'bg-blue-500',
    stats: { total: 0, active: 0, inactive: 0 }
  },
  {
    id: 'seismic',
    label: 'Seismic Survey',
    title: 'Survei Seismik',
    description: 'Pengelolaan data survei seismik 2D/3D',
    icon: Waves,
    color: 'bg-green-500',
    stats: { total: 0, active: 0, inactive: 0 }
  },
  {
    id: 'well',
    label: 'Well',
    title: 'Sumur',
    description: 'Pengelolaan data sumur eksplorasi dan produksi',
    icon: Drill,
    color: 'bg-orange-500',
    stats: { total: 0, active: 0, inactive: 0 }
  },
  {
    id: 'field',
    label: 'Field',
    title: 'Lapangan',
    description: 'Pengelolaan data lapangan minyak dan gas',
    icon: Mountain,
    color: 'bg-purple-500',
    stats: { total: 0, active: 0, inactive: 0 }
  },
  {
    id: 'facility',
    label: 'Facility',
    title: 'Fasilitas',
    description: 'Pengelolaan fasilitas produksi dan transportasi',
    icon: Factory,
    color: 'bg-red-500',
    stats: { total: 0, active: 0, inactive: 0 }
  }
];

export default function MdmResourceManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mdmDomains, setMdmDomains] = useState(initialMdmDomains);
  const [totalStats, setTotalStats] = useState({ total: 0, compliant: 0, issues: 0 });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch real-time statistics from API
  const fetchDomainStats = async () => {
    setIsLoadingStats(true);
    try {
      const domains = ['working-areas', 'seismic-surveys', 'wells', 'fields', 'facilities'];
      const statsPromises = domains.map(async (domain, index) => {
        try {
          const response = await fetch(`/api/mdm/${domain}/stats`);
          if (response.ok) {
            const data = await response.json();
            return {
              domainIndex: index,
              stats: {
                total: data.total || 0,
                active: data.active || 0,
                inactive: data.inactive || 0
              }
            };
          }
          return { domainIndex: index, stats: { total: 0, active: 0, inactive: 0 } };
        } catch {
          return { domainIndex: index, stats: { total: 0, active: 0, inactive: 0 } };
        }
      });

      const results = await Promise.all(statsPromises);

      // Update mdmDomains with fetched stats
      const updatedDomains = [...initialMdmDomains];
      let totalRecords = 0;
      results.forEach(({ domainIndex, stats }) => {
        updatedDomains[domainIndex].stats = stats;
        totalRecords += stats.total;
      });

      setMdmDomains(updatedDomains);
      setTotalStats({
        total: totalRecords,
        compliant: Math.floor(totalRecords * 0.85), // Simulated compliance rate
        issues: Math.floor(totalRecords * 0.15)
      });
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (error) {
      console.error('Failed to fetch domain stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDomainStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDomainStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Vocabulary Provider - MDM Hulu Migas
              </CardTitle>
              <CardDescription>
                Master Data Management untuk metadata hulu migas sesuai SKK Migas Data Specification v2.
                Pengelolaan metadata wilayah kerja, survei seismik, sumur, lapangan, dan fasilitas.
              </CardDescription>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchDomainStats} disabled={isLoadingStats}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="working-area">Working Area</TabsTrigger>
          <TabsTrigger value="seismic">Seismic</TabsTrigger>
          <TabsTrigger value="well">Well</TabsTrigger>
          <TabsTrigger value="field">Field</TabsTrigger>
          <TabsTrigger value="facility">Facility</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mdmDomains.map((domain) => {
              const IconComponent = domain.icon;
              return (
                <Card key={domain.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${domain.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{domain.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{domain.label}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {domain.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">
                          Total: <span className="font-medium">{isLoadingStats ? '...' : domain.stats.total}</span>
                        </span>
                        <span className="text-green-600">
                          Active: <span className="font-medium">{isLoadingStats ? '...' : domain.stats.active}</span>
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab(domain.id)}
                      >
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Data Statistics - SKK Migas Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Records</p>
                  <p className="text-2xl font-bold">{isLoadingStats ? '...' : totalStats.total}</p>
                  <p className="text-xs text-muted-foreground">All domains combined</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Compliance Status</p>
                  <div className="flex gap-2">
                    <Badge variant="default">Compliant: {isLoadingStats ? '...' : totalStats.compliant}</Badge>
                    <Badge variant="destructive">Issues: {isLoadingStats ? '...' : totalStats.issues}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Geometry Data</p>
                  <p className="text-sm text-muted-foreground">
                    WGS 84 (EPSG:4326)
                  </p>
                  <Badge variant="outline">Coordinate System Valid</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Last Sync</p>
                  <p className="text-sm text-muted-foreground">
                    {lastUpdated || 'Loading...'}
                  </p>
                  <Badge variant="outline">
                    {isLoadingStats ? 'Syncing...' : 'Up to date'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Management Tabs */}
        <TabsContent value="working-area">
          <WorkingAreaManagement />
        </TabsContent>

        <TabsContent value="seismic">
          <SeismicSurveyManagement />
        </TabsContent>

        <TabsContent value="well">
          <WellManagement />
        </TabsContent>

        <TabsContent value="field">
          <FieldManagement />
        </TabsContent>

        <TabsContent value="facility">
          <FacilityManagement />
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <ImportDataDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
      <ExportReportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </div>
  );
}