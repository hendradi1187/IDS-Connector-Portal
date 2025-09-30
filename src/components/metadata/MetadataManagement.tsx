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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  CheckCircle,
  GitBranch,
  History,
  GitPullRequest,
  FileCheck,
  Globe,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ValidationDashboard from './ValidationDashboard';
import LineageViewer from './LineageViewer';
import VersionHistory from './VersionHistory';
import WorkflowApproval from './WorkflowApproval';
import StandardsIntegration from './StandardsIntegration';

export default function MetadataManagement() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMetadata: 0,
    validatedMetadata: 0,
    pendingApprovals: 0,
    activeWorkflows: 0,
    versionedEntities: 0,
    complianceScore: 0,
  });

  // RBAC
  const canManage = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canApprove = user?.role === 'Admin';
  const canView = true;

  useEffect(() => {
    // Fetch stats from Firebase
    // TODO: Implement real stats fetching
    setStats({
      totalMetadata: 156,
      validatedMetadata: 142,
      pendingApprovals: 8,
      activeWorkflows: 5,
      versionedEntities: 98,
      complianceScore: 91,
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Metadata Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive metadata governance with validation, lineage, versioning, and workflow approval
          </p>
          {!canManage && (
            <Badge variant="outline" className="mt-2">
              Read-only Access
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Metadata</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMetadata}</div>
            <p className="text-xs text-muted-foreground">All entities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.validatedMetadata}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.validatedMetadata / stats.totalMetadata) * 100)}% compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <GitPullRequest className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <GitBranch className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version Control</CardTitle>
            <History className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.versionedEntities}</div>
            <p className="text-xs text-muted-foreground">Tracked entities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">Standards compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">
            <CheckCircle className="h-4 w-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="lineage">
            <GitBranch className="h-4 w-4 mr-2" />
            Lineage
          </TabsTrigger>
          <TabsTrigger value="versioning">
            <History className="h-4 w-4 mr-2" />
            Versioning
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <GitPullRequest className="h-4 w-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="standards">
            <Globe className="h-4 w-4 mr-2" />
            Standards
          </TabsTrigger>
        </TabsList>

        {/* Validation Tab */}
        <TabsContent value="validation">
          <ValidationDashboard canManage={canManage} />
        </TabsContent>

        {/* Lineage Tab */}
        <TabsContent value="lineage">
          <LineageViewer />
        </TabsContent>

        {/* Versioning Tab */}
        <TabsContent value="versioning">
          <VersionHistory canManage={canManage} />
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <WorkflowApproval canManage={canManage} canApprove={canApprove} />
        </TabsContent>

        {/* Standards Integration Tab */}
        <TabsContent value="standards">
          <StandardsIntegration canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
