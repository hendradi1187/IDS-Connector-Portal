'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { DashboardSettings } from '@/lib/types';

interface DashboardCustomizationProps {
  settings: DashboardSettings;
  onChange: (updates: Partial<DashboardSettings>) => void;
}

export default function DashboardCustomization({ settings, onChange }: DashboardCustomizationProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Default View</CardTitle>
          <CardDescription>Choose your default landing page</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.defaultView} onValueChange={(value) => onChange({ defaultView: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Dashboard</SelectItem>
              <SelectItem value="data-management">Data Management</SelectItem>
              <SelectItem value="vocabularies">Vocabularies</SelectItem>
              <SelectItem value="metadata">Metadata Management</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
          <CardDescription>Customize dashboard layout and appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Layout Style</Label>
            <Select value={settings.layout} onValueChange={(value) => onChange({ layout: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cards Per Row</Label>
            <Select value={settings.cardsPerRow.toString()} onValueChange={(value) => onChange({ cardsPerRow: parseInt(value) as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Cards</SelectItem>
                <SelectItem value="3">3 Cards</SelectItem>
                <SelectItem value="4">4 Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Widgets</CardTitle>
          <CardDescription>Show or hide dashboard sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Quick Actions</Label>
            <Switch checked={settings.showQuickActions} onCheckedChange={(checked) => onChange({ showQuickActions: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Statistics</Label>
            <Switch checked={settings.showStatistics} onCheckedChange={(checked) => onChange({ showStatistics: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Recent Activity</Label>
            <Switch checked={settings.showRecentActivity} onCheckedChange={(checked) => onChange({ showRecentActivity: checked })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto Refresh</CardTitle>
          <CardDescription>Automatically refresh dashboard data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Auto Refresh</Label>
            <Switch checked={settings.autoRefresh} onCheckedChange={(checked) => onChange({ autoRefresh: checked })} />
          </div>
          {settings.autoRefresh && (
            <div>
              <Label>Refresh Interval (seconds)</Label>
              <Input
                type="number"
                min="30"
                max="3600"
                value={settings.refreshInterval}
                onChange={(e) => onChange({ refreshInterval: parseInt(e.target.value) })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
