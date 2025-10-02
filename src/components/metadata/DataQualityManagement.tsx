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
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QualityMetrics {
  totalDatasets: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  validationStatus: {
    validated: number;
    pending: number;
    failed: number;
  };
  trends: {
    improving: number;
    stable: number;
    declining: number;
  };
  recentValidations: Array<{
    id: string;
    datasetName: string;
    previousQuality: string;
    currentQuality: string;
    validatedAt: string;
    issues: string[];
  }>;
}

export default function DataQualityManagement() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const canRunValidation = user?.role === 'Admin' || user?.role === 'KKKS-Provider';

  useEffect(() => {
    fetchQualityMetrics();
  }, []);

  const fetchQualityMetrics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: QualityMetrics = {
        totalDatasets: 1247,
        qualityDistribution: {
          excellent: 456,
          good: 512,
          fair: 203,
          poor: 76,
        },
        validationStatus: {
          validated: 1180,
          pending: 44,
          failed: 23,
        },
        trends: {
          improving: 28,
          stable: 1156,
          declining: 63,
        },
        recentValidations: [
          {
            id: '1',
            datasetName: 'Seismic Survey Lapangan Minas 2024',
            previousQuality: 'GOOD',
            currentQuality: 'EXCELLENT',
            validatedAt: '2024-09-28T10:30:00Z',
            issues: [],
          },
          {
            id: '2',
            datasetName: 'Well Log Data Sumur Duri-001',
            previousQuality: 'FAIR',
            currentQuality: 'GOOD',
            validatedAt: '2024-09-28T09:15:00Z',
            issues: ['Missing gamma ray data for interval 2100-2150m'],
          },
          {
            id: '3',
            datasetName: 'Production Data Lapangan Badak',
            previousQuality: 'EXCELLENT',
            currentQuality: 'GOOD',
            validatedAt: '2024-09-27T16:45:00Z',
            issues: ['Late reporting for September 2024', 'Missing gas composition data'],
          },
        ],
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'fair':
        return <Clock className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (change: string) => {
    if (change === 'IMPROVED') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change === 'DECLINED') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Failed to load quality metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Data Quality Management
              </CardTitle>
              <CardDescription>
                Monitor dan kelola kualitas dataset untuk memastikan compliance dan reliability.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {canRunValidation && (
                <>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Validation
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Quality Report
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quality Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(metrics.qualityDistribution).map(([quality, count]) => {
          const percentage = (count / metrics.totalDatasets) * 100;
          return (
            <Card key={quality}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{quality}</CardTitle>
                <div className={`p-2 rounded-lg ${getQualityColor(quality)}`}>
                  {getQualityIcon(quality)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% of total datasets
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.validationStatus.validated}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.validationStatus.validated / metrics.totalDatasets) * 100).toFixed(1)}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Validation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.validationStatus.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting quality assessment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.validationStatus.failed}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quality Trends</CardTitle>
          <CardDescription>Changes in dataset quality over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Improving</p>
                <p className="text-2xl font-bold text-green-600">{metrics.trends.improving}</p>
                <p className="text-xs text-muted-foreground">Quality upgraded</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-gray-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Stable</p>
                <p className="text-2xl font-bold text-gray-600">{metrics.trends.stable}</p>
                <p className="text-xs text-muted-foreground">No significant change</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Declining</p>
                <p className="text-2xl font-bold text-red-600">{metrics.trends.declining}</p>
                <p className="text-xs text-muted-foreground">Quality downgraded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Quality Validations</CardTitle>
          <CardDescription>Latest validation results and quality changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentValidations.map((validation) => {
              const qualityChanged = validation.previousQuality !== validation.currentQuality;
              const qualityImproved = qualityChanged &&
                ['POOR', 'FAIR', 'GOOD', 'EXCELLENT'].indexOf(validation.currentQuality) >
                ['POOR', 'FAIR', 'GOOD', 'EXCELLENT'].indexOf(validation.previousQuality);

              return (
                <div key={validation.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{validation.datasetName}</h4>
                      {qualityChanged && getTrendIcon(qualityImproved ? 'IMPROVED' : 'DECLINED')}
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Previous:</span>
                        <Badge variant="outline" className={getQualityColor(validation.previousQuality)}>
                          {validation.previousQuality}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current:</span>
                        <Badge variant="outline" className={getQualityColor(validation.currentQuality)}>
                          {validation.currentQuality}
                        </Badge>
                      </div>
                    </div>

                    {validation.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-600 mb-1">Issues Found:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {validation.issues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(validation.validatedAt).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(validation.validatedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}