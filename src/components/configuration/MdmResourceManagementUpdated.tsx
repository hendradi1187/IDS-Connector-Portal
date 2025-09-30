'use client';

import { useState } from 'react';
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
  Shield,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

import WorkingAreaManagement from '@/components/mdm/working-area/WorkingAreaManagement';
import SeismicSurveyManagement from '@/components/mdm/seismic-survey/SeismicSurveyManagement';
import WellManagement from '@/components/mdm/well/WellManagement';
import FieldManagement from '@/components/mdm/field/FieldManagement';
import FacilityManagement from '@/components/mdm/facility/FacilityManagement';
import ValidationDashboard from '@/components/mdm/validation/ValidationDashboard';
import { useAuth } from '@/context/AuthContext';
const mdmDomains = [
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
  },
  {
    id: 'validation',
    label: 'Validation',
    title: 'Validasi Data',
    description: 'Validasi mandatory fields dan foreign key relationships',
    icon: Shield,
    color: 'bg-indigo-500',
    stats: { total: 0, active: 0, inactive: 0 }
  }
];



export default function MdmResourceManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  // RBAC: Define permissions
  const canImportData = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canExportReport = true; // All roles can export
  const canAccessSettings = user?.role === 'Admin';
  const canManageData = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const isReadOnly = user?.role === 'SKK-Consumer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Vocabulary Provider - MDM Hulu Migas
              </CardTitle>
              <CardDescription>
                Fungsi ini digunakan oleh KKKS untuk mendaftarkan dan mengelola metadata sumber daya data yang akan dibagikan sesuai SKK Migas Data Specification v2.
              </CardDescription>
              {isReadOnly && (
                <Badge variant="outline" className="mt-2">
                  Read-only Access
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {canImportData && (
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              )}
              {canExportReport && (
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
              {canAccessSettings && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="working-area">Working Area</TabsTrigger>
          <TabsTrigger value="seismic">Seismic</TabsTrigger>
          <TabsTrigger value="well">Well</TabsTrigger>
          <TabsTrigger value="field">Field</TabsTrigger>
          <TabsTrigger value="facility">Facility</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                          Total: <span className="font-medium">{domain.stats.total}</span>
                        </span>
                        <span className="text-green-600">
                          Active: <span className="font-medium">{domain.stats.active}</span>
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
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">All domains combined</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Compliance Status</p>
                  <div className="flex gap-2">
                    <Badge variant="default">Compliant: 0</Badge>
                    <Badge variant="destructive">Issues: 0</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Geometry Data</p>
                  <p className="text-sm text-muted-foreground">
                    WGS 84 (EPSG:4326)
                  </p>
                  <Badge variant="outline">CRS Validated</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('id-ID')}
                  </p>
                  <Badge variant="outline">Real-time</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain-specific Tabs */}
        <TabsContent value="working-area">
          <WorkingAreaManagement canManage={canManageData} isReadOnly={isReadOnly} />
        </TabsContent>

        <TabsContent value="seismic">
          <SeismicSurveyManagement canManage={canManageData} isReadOnly={isReadOnly} />
        </TabsContent>

        <TabsContent value="well">
          <WellManagement canManage={canManageData} isReadOnly={isReadOnly} />
        </TabsContent>

        <TabsContent value="field">
          <FieldManagement canManage={canManageData} isReadOnly={isReadOnly} />
        </TabsContent>

        <TabsContent value="facility">
          <FacilityManagement canManage={canManageData} isReadOnly={isReadOnly} />
        </TabsContent>

        <TabsContent value="validation">
          <ValidationDashboard canManage={canManageData} isReadOnly={isReadOnly} />
        </TabsContent>
      </Tabs>
    </div>
  );
}