'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Shield,
  GitBranch,
  CheckCircle,
  Database,
  Layers
} from 'lucide-react';
import MigasMetadataRegistration from './MigasMetadataRegistration';
import MigasLineageViewer from './MigasLineageViewer';
import MigasApprovalWorkflow from './MigasApprovalWorkflow';
import DatasetMetadataManagement from './DatasetMetadataManagement';
import { useAuth } from '@/context/AuthContext';

export default function MigasMetadataManagementTabs() {
  const { user } = useAuth();
  const [selectedMetadataId, setSelectedMetadataId] = useState<string>('1');

  // RBAC: Define tab visibility
  const canRegister = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canApprove = user?.role === 'Admin';

  const tabs = [
    {
      value: 'catalog',
      label: 'Data Catalog',
      icon: Database,
      visible: true,
      description: 'Browse dan kelola dataset metadata yang ada'
    },
    {
      value: 'register',
      label: 'Registrasi Metadata',
      icon: FileText,
      visible: canRegister,
      description: 'Daftarkan dataset baru dengan validasi PPDM & Master Data Management'
    },
    {
      value: 'lineage',
      label: 'Lineage & Versioning',
      icon: GitBranch,
      visible: true,
      description: 'Tracking asal-usul data dan riwayat perubahan'
    },
    {
      value: 'approval',
      label: 'Workflow Approval',
      icon: CheckCircle,
      visible: canApprove,
      description: 'Review dan approval metadata dari KKKS'
    },
    {
      value: 'validation',
      label: 'Schema Validation',
      icon: Shield,
      visible: true,
      description: 'Validasi otomatis terhadap standar industri'
    }
  ].filter(tab => tab.visible);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">
                Metadata Management Migas
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Sistem metadata management untuk sektor migas dengan standar PPDM, Master Data Management, dan Satu Data Indonesia
              </p>
              <div className="flex gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-gray-700">PPDM Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span className="font-medium text-gray-700">Master Data Management</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded">
                  <Database className="h-3 w-3 text-purple-600" />
                  <span className="font-medium text-gray-700">Satu Data Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={tabs[0].value} className="space-y-4">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Data Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <DatasetMetadataManagement />
        </TabsContent>

        {/* Registration Tab */}
        {canRegister && (
          <TabsContent value="register" className="space-y-4">
            <MigasMetadataRegistration />
          </TabsContent>
        )}

        {/* Lineage & Versioning Tab */}
        <TabsContent value="lineage" className="space-y-4">
          <div className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <strong>Pilih dataset</strong> dari catalog untuk melihat lineage dan version history.
                Saat ini menampilkan contoh untuk dataset ID: <code className="bg-muted px-1 py-0.5 rounded">{selectedMetadataId}</code>
              </p>
            </Card>
            <MigasLineageViewer metadataId={selectedMetadataId} />
          </div>
        </TabsContent>

        {/* Approval Workflow Tab */}
        {canApprove && (
          <TabsContent value="approval" className="space-y-4">
            <MigasApprovalWorkflow />
          </TabsContent>
        )}

        {/* Schema Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Validasi Schema Otomatis</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sistem otomatis memvalidasi schema metadata terhadap standar industri
                  </p>
                </div>
              </div>

              {/* Validation Standards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600 rounded">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">PPDM 3.9</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Professional Petroleum Data Management Association standard
                      </p>
                      <ul className="mt-2 text-xs text-blue-800 space-y-1">
                        <li>✓ Well ID format & uniqueness</li>
                        <li>✓ Field ID linkage</li>
                        <li>✓ Coordinate system validation</li>
                        <li>✓ Data type conformance</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-600 rounded">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">Master Data Management</h4>
                      <p className="text-xs text-green-700 mt-1">
                        MDM Hulu Migas - SKK Migas Data Specification v2
                      </p>
                      <ul className="mt-2 text-xs text-green-800 space-y-1">
                        <li>✓ Working Area (WK_ID) validation</li>
                        <li>✓ Well Data (UWI, coordinates)</li>
                        <li>✓ Seismic Survey (2D/3D, EPSG)</li>
                        <li>✓ Field & Facility data</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-600 rounded">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">Satu Data Indonesia</h4>
                      <p className="text-xs text-purple-700 mt-1">
                        Interoperabilitas data antar sistem pemerintah
                      </p>
                      <ul className="mt-2 text-xs text-purple-800 space-y-1">
                        <li>✓ Metadata completeness</li>
                        <li>✓ Descriptive naming</li>
                        <li>✓ Tagging for discovery</li>
                        <li>✓ Temporal coverage</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Validation Process */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Proses Validasi</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-700 font-bold">1</span>
                    </div>
                    <p className="text-sm font-medium">Metadata Submitted</p>
                    <p className="text-xs text-muted-foreground mt-1">KKKS submit metadata</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-700 font-bold">2</span>
                    </div>
                    <p className="text-sm font-medium">Auto Validation</p>
                    <p className="text-xs text-muted-foreground mt-1">System checks standards</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-700 font-bold">3</span>
                    </div>
                    <p className="text-sm font-medium">Report Generated</p>
                    <p className="text-xs text-muted-foreground mt-1">Errors & warnings listed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-700" />
                    </div>
                    <p className="text-sm font-medium">Fix & Resubmit</p>
                    <p className="text-xs text-muted-foreground mt-1">KKKS corrects issues</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Manfaat Validasi Otomatis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Konsistensi Data</p>
                      <p className="text-xs text-muted-foreground">Semua KKKS menggunakan format yang sama</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Kualitas Terjaga</p>
                      <p className="text-xs text-muted-foreground">Validasi mencegah data error masuk sistem</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Efisiensi Proses</p>
                      <p className="text-xs text-muted-foreground">Mengurangi revisi manual dari reviewer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Audit Trail</p>
                      <p className="text-xs text-muted-foreground">Semua validasi ter-log untuk compliance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
