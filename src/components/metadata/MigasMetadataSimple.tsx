'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, FileText, GitBranch, CheckCircle, Shield, Layers, Plus, Trash2 } from 'lucide-react';
import DatasetMetadataManagement from './DatasetMetadataManagement';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { seedSampleMetadata, clearSampleMetadata } from '@/lib/actions/seedMetadata';
import { useToast } from '@/hooks/use-toast';

export default function MigasMetadataSimple() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const canRegister = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canApprove = user?.role === 'Admin';

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedSampleMetadata();
      if (result.success) {
        toast({
          title: result.skipped ? 'Sample data already exists' : 'Sample data created',
          description: result.message,
        });
        if (!result.skipped) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to seed sample data',
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleClearData = async () => {
    setSeeding(true);
    try {
      const result = await clearSampleMetadata();
      if (result.success) {
        toast({
          title: 'Sample data cleared',
          description: result.message,
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear sample data',
      });
    } finally {
      setSeeding(false);
    }
  };

  const tabs = [
    { value: 'catalog', label: 'Data Catalog', icon: Database, visible: true },
    { value: 'info', label: 'Info Sistem', icon: Layers, visible: true },
    { value: 'register', label: 'Registrasi', icon: FileText, visible: canRegister },
    { value: 'validation', label: 'Validasi', icon: Shield, visible: true },
    { value: 'lineage', label: 'Lineage', icon: GitBranch, visible: true },
    { value: 'approval', label: 'Approval', icon: CheckCircle, visible: canApprove }
  ].filter(tab => tab.visible);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Metadata Management Migas
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Sistem metadata management untuk sektor migas dengan standar PPDM, Master Data Management, dan Satu Data Indonesia
                  </p>
                </div>
                {canRegister && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSeedData}
                      disabled={seeding}
                      className="bg-white/80"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {seeding ? 'Loading...' : 'Add Sample Data'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearData}
                      disabled={seeding}
                      className="bg-white/80 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Samples
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-gray-700">PPDM 3.9</span>
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
        </CardContent>
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
        <TabsContent value="catalog">
          <DatasetMetadataManagement />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sistem</CardTitle>
              <CardDescription>Overview metadata management migas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Fitur Utama:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Registrasi Metadata Migas (KKKS)</li>
                    <li>Validasi Schema (PPDM, Master Data Management, Satu Data Indonesia)</li>
                    <li>Lineage & Versioning Tracking</li>
                    <li>Workflow Approval (SKK Migas)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Standar Compliance:</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 bg-blue-50">
                      <p className="font-medium text-sm">PPDM 3.9</p>
                      <p className="text-xs text-muted-foreground">Professional Petroleum Data Management</p>
                    </Card>
                    <Card className="p-4 bg-green-50">
                      <p className="font-medium text-sm">Master Data Management</p>
                      <p className="text-xs text-muted-foreground">MDM Hulu Migas - SKK Migas v2</p>
                    </Card>
                    <Card className="p-4 bg-purple-50">
                      <p className="font-medium text-sm">Satu Data Indonesia</p>
                      <p className="text-xs text-muted-foreground">Interoperabilitas Nasional</p>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Tab */}
        {canRegister && (
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Form Registrasi Metadata</CardTitle>
                <CardDescription>Daftarkan dataset baru sebelum transfer data ke SKK Migas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">📋 Informasi Penting</p>
                    <p className="text-sm text-blue-700">
                      Sebelum mentransfer data fisik ke SKK Migas, pastikan metadata dataset sudah terdaftar dan tervalidasi.
                      Gunakan form registrasi di tab "Data Catalog" untuk menambah dataset baru.
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Komponen Form Mencakup:</p>
                    <ul className="mt-2 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Informasi Dasar:</strong> Nama dataset, tipe data (Well Log, Seismic, Production, dll), format file</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Lokasi & Wilayah Kerja:</strong> Working Area, Field ID, Block ID, koordinat geografis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Informasi Temporal:</strong> Tanggal akuisisi, periode data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Kepemilikan KKKS:</strong> Nama KKKS, KKKS ID, source system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Definisi Schema:</strong> Field definitions, data types, units</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Validation Tab */}
        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Validasi Schema Otomatis</CardTitle>
              <CardDescription>Sistem validasi terhadap standar industri migas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">PPDM 3.9</h4>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">Professional Petroleum Data Management</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>✓ Well ID format & uniqueness</li>
                      <li>✓ Field ID linkage</li>
                      <li>✓ Coordinate system validation</li>
                      <li>✓ Data type conformance</li>
                    </ul>
                  </Card>

                  <Card className="p-4 border-2 border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Master Data Management</h4>
                    </div>
                    <p className="text-xs text-green-700 mb-2">MDM Hulu Migas - SKK Migas v2</p>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>✓ Working Area (WK_ID) validation</li>
                      <li>✓ Well Data (UWI, coordinates)</li>
                      <li>✓ Seismic Survey (2D/3D, EPSG)</li>
                      <li>✓ Field & Facility data</li>
                    </ul>
                  </Card>

                  <Card className="p-4 border-2 border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Satu Data Indonesia</h4>
                    </div>
                    <p className="text-xs text-purple-700 mb-2">Interoperabilitas Nasional</p>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>✓ Metadata completeness</li>
                      <li>✓ Descriptive naming</li>
                      <li>✓ Tagging for discovery</li>
                      <li>✓ Temporal coverage</li>
                    </ul>
                  </Card>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Proses Validasi Otomatis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-700 font-bold">1</span>
                      </div>
                      <p className="text-sm font-medium">Submit</p>
                      <p className="text-xs text-muted-foreground">KKKS submit metadata</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-700 font-bold">2</span>
                      </div>
                      <p className="text-sm font-medium">Validate</p>
                      <p className="text-xs text-muted-foreground">System checks 3 standards</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-700 font-bold">3</span>
                      </div>
                      <p className="text-sm font-medium">Report</p>
                      <p className="text-xs text-muted-foreground">Errors & warnings</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-5 w-5 text-green-700" />
                      </div>
                      <p className="text-sm font-medium">Fix & Resubmit</p>
                      <p className="text-xs text-muted-foreground">KKKS corrects</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lineage Tab */}
        <TabsContent value="lineage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Data Lineage & Version History
              </CardTitle>
              <CardDescription>Tracking asal-usul data dan riwayat perubahan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Fitur Lineage:</strong> Sistem ini mencatat setiap perubahan pada metadata, termasuk siapa yang melakukan perubahan, kapan, dan apa yang berubah.
                    Pilih dataset dari catalog untuk melihat detail lineage.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">Dataset dibuat</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Validated</p>
                    <p className="text-xs text-muted-foreground">Schema divalidasi</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Versioned</p>
                    <p className="text-xs text-muted-foreground">Versi baru dibuat</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Approved</p>
                    <p className="text-xs text-muted-foreground">SKK Migas approve</p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Tab */}
        {canApprove && (
          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Workflow Approval - SKK Migas
                </CardTitle>
                <CardDescription>Review dan approval metadata yang disubmit oleh KKKS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900">
                      <strong>Proses Approval:</strong> Metadata yang sudah disubmit oleh KKKS akan masuk ke queue approval.
                      Reviewer dari SKK Migas dapat melihat detail metadata, memeriksa validasi, dan memberikan keputusan approve atau reject dengan catatan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">1</span>
                        </div>
                        <p className="font-medium text-sm">Submitted</p>
                      </div>
                      <p className="text-xs text-muted-foreground">KKKS submit metadata yang sudah tervalidasi</p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-700 font-bold text-sm">2</span>
                        </div>
                        <p className="font-medium text-sm">Under Review</p>
                      </div>
                      <p className="text-xs text-muted-foreground">SKK Migas reviewer periksa metadata</p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-700" />
                        </div>
                        <p className="font-medium text-sm">Approved/Rejected</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Keputusan final dengan catatan</p>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
