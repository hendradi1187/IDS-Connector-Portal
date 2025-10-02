'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  FileText,
  Shield,
  BarChart3,
  Users,
  MapPin,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MetadataStats {
  totalDatasets: number;
  activeDatasets: number;
  pendingReview: number;
  qualityIssues: number;
  publicAccess: number;
  restrictedAccess: number;
  dataTypes: {
    seismic: number;
    well: number;
    production: number;
    geological: number;
  };
  recentActivity: {
    newDatasets: number;
    updatedDatasets: number;
    qualityChecks: number;
  };
}

export default function MetadataOverview() {
  const [stats, setStats] = useState<MetadataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // RBAC: Define permissions
  const canManageMetadata = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canViewAll = user?.role === 'Admin';
  const isReadOnly = user?.role === 'SKK-Consumer';

  useEffect(() => {
    // Simulate API call to fetch metadata statistics
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockStats: MetadataStats = {
          totalDatasets: 1247,
          activeDatasets: 1180,
          pendingReview: 23,
          qualityIssues: 44,
          publicAccess: 892,
          restrictedAccess: 355,
          dataTypes: {
            seismic: 456,
            well: 342,
            production: 278,
            geological: 171,
          },
          recentActivity: {
            newDatasets: 12,
            updatedDatasets: 28,
            qualityChecks: 15,
          },
        };

        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching metadata stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Failed to load metadata statistics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Metadata Management Overview
              </CardTitle>
              <CardDescription>
                Ringkasan metadata dataset dan aktivitas terkini dalam sistem IDS Portal.
              </CardDescription>
              {isReadOnly && (
                <Badge variant="outline" className="mt-2">
                  Read-only Access
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {canManageMetadata && (
                <>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Metadata
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dataset</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDatasets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentActivity.newDatasets} dataset baru minggu ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dataset Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeDatasets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeDatasets / stats.totalDatasets) * 100).toFixed(1)}% dari total dataset
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              Memerlukan review quality assurance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.qualityIssues}</div>
            <p className="text-xs text-muted-foreground">
              Dataset dengan masalah kualitas data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Types Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Tipe Data</CardTitle>
            <CardDescription>Jumlah dataset berdasarkan kategori data migas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.dataTypes).map(([type, count]) => {
              const percentage = (count / stats.totalDatasets) * 100;
              const typeLabels = {
                seismic: 'Data Seismik',
                well: 'Data Sumur',
                production: 'Data Produksi',
                geological: 'Data Geologi',
              };

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{typeLabels[type as keyof typeof typeLabels]}</span>
                    <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontrol Akses</CardTitle>
            <CardDescription>Distribusi level akses dataset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Public Access</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.publicAccess} dataset</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.publicAccess / stats.totalDatasets) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Restricted Access</span>
                </div>
                <span className="text-sm text-muted-foreground">{stats.restrictedAccess} dataset</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.restrictedAccess / stats.totalDatasets) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
          <CardDescription>Ringkasan aktivitas metadata dalam 7 hari terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Dataset Baru</p>
                <p className="text-2xl font-bold text-blue-600">{stats.recentActivity.newDatasets}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Dataset Diperbarui</p>
                <p className="text-2xl font-bold text-green-600">{stats.recentActivity.updatedDatasets}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Quality Check</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recentActivity.qualityChecks}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {canManageMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Aksi cepat untuk pengelolaan metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start">
                <Database className="h-4 w-4 mr-2" />
                Add New Dataset
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Quality Review
              </Button>
              <Button variant="outline" className="justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Access Control
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}