'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useThemeColors, useAdaptiveColors } from '@/context/ThemeContext';
import { StatusIndicator } from '@/components/ui/theme-switcher';
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  AlertTriangle,
  Clock,
  Database,
  Network,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface DataTrafficMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    rate: number; // per minute
    trend: 'up' | 'down' | 'stable';
  };
  responses: {
    total: number;
    avgTime: number; // milliseconds
    successRate: number; // percentage
    trend: 'up' | 'down' | 'stable';
  };
  errors: {
    total: number;
    rate: number; // percentage
    critical: number;
    trend: 'up' | 'down' | 'stable';
  };
  latency: {
    avg: number; // milliseconds
    p95: number;
    p99: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export default function DataTrafficStats() {
  const [metrics, setMetrics] = useState<DataTrafficMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useAdaptiveColors();

  useEffect(() => {
    // Simulate fetching metrics
    const fetchMetrics = () => {
      setTimeout(() => {
        setMetrics({
          requests: {
            total: 12450,
            successful: 11890,
            failed: 560,
            rate: 85.2,
            trend: 'up'
          },
          responses: {
            total: 11890,
            avgTime: 245,
            successRate: 95.5,
            trend: 'stable'
          },
          errors: {
            total: 560,
            rate: 4.5,
            critical: 23,
            trend: 'down'
          },
          latency: {
            avg: 245,
            p95: 680,
            p99: 1200,
            trend: 'down'
          }
        });
        setLoading(false);
      }, 1000);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-3 w-3 text-energy-green" />;
      case 'down':
        return <ArrowDownRight className="h-3 w-3 text-safety-red" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodWhenUp = true) => {
    if (trend === 'stable') return 'text-muted-foreground';

    if (isGoodWhenUp) {
      return trend === 'up' ? 'text-energy-green' : 'text-safety-red';
    } else {
      return trend === 'up' ? 'text-safety-red' : 'text-energy-green';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="professional-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Requests Card */}
        <Card className="kpi-card-requests">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-data-request" />
              Requests
            </CardTitle>
            <Badge style={{ backgroundColor: colors.dataColors.requests, color: 'white' }}>
              {metrics.requests.rate}/min
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-data-request">
              {metrics.requests.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(metrics.requests.trend)}
              <span className={getTrendColor(metrics.requests.trend)}>
                {metrics.requests.successful.toLocaleString()} successful
              </span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Failed: </span>
              <span className="text-safety-red font-medium">
                {metrics.requests.failed.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Responses Card */}
        <Card className="kpi-card-responses">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-data-response" />
              Responses
            </CardTitle>
            <Badge style={{ backgroundColor: colors.dataColors.responses, color: 'white' }}>
              {metrics.responses.successRate}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-data-response">
              {metrics.responses.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(metrics.responses.trend)}
              <span className={getTrendColor(metrics.responses.trend)}>
                {metrics.responses.avgTime}ms avg
              </span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Success Rate: </span>
              <span className="text-energy-green font-medium">
                {metrics.responses.successRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Errors Card */}
        <Card className="kpi-card-errors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-data-error" />
              Errors
            </CardTitle>
            <Badge style={{ backgroundColor: colors.dataColors.errors, color: 'white' }}>
              {metrics.errors.rate}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-data-error">
              {metrics.errors.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(metrics.errors.trend)}
              <span className={getTrendColor(metrics.errors.trend, false)}>
                {metrics.errors.rate}% error rate
              </span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Critical: </span>
              <span className="text-safety-red font-medium">
                {metrics.errors.critical}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Latency/Performance Card */}
        <Card className="kpi-card-latency">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-data-latency" />
              Latency
            </CardTitle>
            <Badge style={{ backgroundColor: colors.dataColors.latency, color: 'white' }}>
              {metrics.latency.avg}ms
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-data-latency">
              {metrics.latency.avg}ms
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon(metrics.latency.trend)}
              <span className={getTrendColor(metrics.latency.trend, false)}>
                P95: {metrics.latency.p95}ms
              </span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">P99: </span>
              <span className="text-migas-orange font-medium">
                {metrics.latency.p99}ms
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card className="monitoring-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-industrial-blue" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* IDS Connectors */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">IDS Connectors</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Broker</span>
                <StatusIndicator status="online" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Catalog Service</span>
                <StatusIndicator status="online" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auth Provider</span>
                <StatusIndicator status="warning" />
              </div>
            </div>

            {/* External Services */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">External Services</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm">OGC-OSDU Adaptor</span>
                <StatusIndicator status="online" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SKK Migas API</span>
                <StatusIndicator status="online" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Monitoring System</span>
                <StatusIndicator status="error" />
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Performance</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <Badge className="status-online">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Throughput</span>
                <Badge className="status-warning">High</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <Badge className="status-online">Low</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Flow Visualization */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-energy-green" />
            Data Traffic Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8 py-6">
            {/* Requests Flow */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-data-request/20 flex items-center justify-center mb-2">
                <Database className="h-8 w-8 text-data-request" />
              </div>
              <div className="text-lg font-bold text-data-request">
                {metrics.requests.total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Requests</div>
            </div>

            {/* Arrow */}
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 bg-gradient-to-r from-data-request to-data-response flex-1"></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground mx-2" />
              <div className="h-0.5 bg-gradient-to-r from-data-response to-data-latency flex-1"></div>
            </div>

            {/* Responses Flow */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-data-response/20 flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-data-response" />
              </div>
              <div className="text-lg font-bold text-data-response">
                {metrics.responses.total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Responses</div>
            </div>

            {/* Arrow */}
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 bg-gradient-to-r from-data-response to-data-error flex-1"></div>
              <Clock className="h-4 w-4 text-muted-foreground mx-2" />
            </div>

            {/* Latency */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-data-latency/20 flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-data-latency" />
              </div>
              <div className="text-lg font-bold text-data-latency">
                {metrics.latency.avg}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Latency</div>
            </div>
          </div>

          {/* Error Rate Indicator */}
          {metrics.errors.rate > 5 && (
            <div className="mt-4 p-3 bg-safety-red/10 border border-safety-red/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-safety-red" />
                <span className="text-sm font-medium text-safety-red">
                  High Error Rate Detected
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Current error rate: {metrics.errors.rate}% (threshold: 5%)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}