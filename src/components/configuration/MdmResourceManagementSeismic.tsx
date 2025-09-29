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
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

import WorkingAreaManagement from '@/components/mdm/working-area/WorkingAreaManagement';

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
  }
];

function SeismicSurveyManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Seismic Survey Management
        </CardTitle>
        <CardDescription>
          Pengelolaan data survei seismik 2D/3D sesuai SKK Migas Data Spec v2
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Survey Identity:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• SEIS_ACQTN_SURVEY_ID</li>
                <li>• ACQTN_SURVEY_NAME</li>
                <li>• BA_LONG_NAME</li>
                <li>• WK_ID</li>
              </ul>
            </div>
            <div>
              <strong>Survey Details:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• PROJECT_ID</li>
                <li>• SEIS_DIMENSION (2D/3D)</li>
                <li>• ENVIRONMENT</li>
                <li>• SHOT_BY</li>
              </ul>
            </div>
            <div>
              <strong>Technical Specs:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• SEIS_LINE_TYPE</li>
                <li>• CRS_REMARK</li>
                <li>• SHAPE (WGS 84)</li>
                <li>• SHAPE_LENGTH</li>
              </ul>
            </div>
            <div>
              <strong>Schedule:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• START_DATE</li>
                <li>• COMPLETED_DATE</li>
                <li>• Status</li>
                <li>• Progress</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Waves className="h-4 w-4 mr-2" />
              Add Seismic Survey
            </Button>
            <Button variant="outline">Import SEGY</Button>
            <Button variant="outline">Validate CRS</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WellManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Drill className="h-5 w-5" />
          Well Management
        </CardTitle>
        <CardDescription>
          Pengelolaan data sumur eksplorasi dan produksi sesuai SKK Migas Data Spec v2
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Well Identity:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• UWI (unique)</li>
                <li>• WELL_NAME</li>
                <li>• WK_ID</li>
                <li>• FIELD_ID</li>
              </ul>
            </div>
            <div>
              <strong>Well Classification:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• CURRENT_CLASS</li>
                <li>• STATUS_TYPE</li>
                <li>• ENVIRONMENT_TYPE</li>
                <li>• PROFILE_TYPE</li>
              </ul>
            </div>
            <div>
              <strong>Coordinates:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• SURFACE_LONGITUDE</li>
                <li>• SURFACE_LATITUDE</li>
                <li>• UTM (NS_UTM, EW_UTM)</li>
                <li>• SHAPE (Point WGS 84)</li>
              </ul>
            </div>
            <div>
              <strong>Operations:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• OPERATOR</li>
                <li>• SPUD_DATE</li>
                <li>• FINAL_DRILL_DATE</li>
                <li>• Status</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Drill className="h-4 w-4 mr-2" />
              Add Well
            </Button>
            <Button variant="outline">Import Well Data</Button>
            <Button variant="outline">Validate UWI</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FieldManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mountain className="h-5 w-5" />
          Field Management
        </CardTitle>
        <CardDescription>
          Pengelolaan data lapangan minyak dan gas sesuai SKK Migas Data Spec v2
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Field Identity:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• FIELD_ID (unique)</li>
                <li>• FIELD_NAME</li>
                <li>• WK_ID</li>
                <li>• BASIN</li>
              </ul>
            </div>
            <div>
              <strong>Geology:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• FORMATION_NAME</li>
                <li>• DISCOVERY_DATE</li>
                <li>• FIELD_TYPE</li>
                <li>• IS_OFFSHORE</li>
              </ul>
            </div>
            <div>
              <strong>Operations:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• OPERATOR</li>
                <li>• STATUS</li>
                <li>• Production Status</li>
                <li>• Development Phase</li>
              </ul>
            </div>
            <div>
              <strong>Geography:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• SHAPE (Polygon)</li>
                <li>• Area (km²)</li>
                <li>• Water Depth</li>
                <li>• Location Type</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Mountain className="h-4 w-4 mr-2" />
              Add Field
            </Button>
            <Button variant="outline">Import Field Data</Button>
            <Button variant="outline">Validate Polygon</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FacilityManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Facility Management
        </CardTitle>
        <CardDescription>
          Pengelolaan fasilitas produksi dan transportasi sesuai SKK Migas Data Spec v2
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Pipeline:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• FACILITY_ID</li>
                <li>• TYPE (Flowline, Trunkline)</li>
                <li>• DIAMETER</li>
                <li>• LENGTH</li>
                <li>• FLUID_TYPE</li>
                <li>• SHAPE (Polyline)</li>
              </ul>
            </div>
            <div>
              <strong>Platform:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• TYPE (Well Head, Processing)</li>
                <li>• CAPACITY_PROD</li>
                <li>• WATER_DEPTH</li>
                <li>• NO_OF_WELL</li>
                <li>• STATUS</li>
                <li>• SHAPE (Point/Polygon)</li>
              </ul>
            </div>
            <div>
              <strong>Floating Facility:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• TYPE (FPSO, FSO, FLNG)</li>
                <li>• CAPACITY_PROD</li>
                <li>• VESSEL_CAPACITY</li>
                <li>• STATUS</li>
                <li>• SHAPE</li>
              </ul>
            </div>
            <div>
              <strong>Processing Plant:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• TYPE (LNG, LPG, Processing)</li>
                <li>• STORAGE_CAPACITY</li>
                <li>• PLANT_CAPACITY</li>
                <li>• POWER</li>
              </ul>
            </div>
            <div>
              <strong>Storage:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• STORAGE_CAPACITY</li>
                <li>• TYPE (Oil, LPG, LNG)</li>
                <li>• Tank Count</li>
                <li>• Safety Systems</li>
              </ul>
            </div>
            <div>
              <strong>Infrastructure:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Cable (Power, Fiber, Telecom)</li>
                <li>• Other Facilities</li>
                <li>• Support Structures</li>
                <li>• Utilities</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Factory className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
            <Button variant="outline">Import P&ID</Button>
            <Button variant="outline">Validate Layout</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MdmResourceManagement() {
  const [activeTab, setActiveTab] = useState('overview');

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
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
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
    </div>
  );
}