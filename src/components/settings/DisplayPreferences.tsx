'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { DisplaySettings } from '@/lib/types';

interface DisplayPreferencesProps {
  settings: DisplaySettings;
  onChange: (updates: Partial<DisplaySettings>) => void;
}

export default function DisplayPreferences({ settings, onChange }: DisplayPreferencesProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Set your preferred language and regional formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Language</Label>
            <Select value={settings.language} onValueChange={(value) => onChange({ language: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Timezone</Label>
            <Select value={settings.timezone} onValueChange={(value) => onChange({ timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date & Time Format</CardTitle>
          <CardDescription>Customize how dates and times are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Date Format</Label>
            <Select value={settings.dateFormat} onValueChange={(value) => onChange({ dateFormat: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time Format</Label>
            <Select value={settings.timeFormat} onValueChange={(value) => onChange({ timeFormat: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12 Hour</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Number & Currency Format</CardTitle>
          <CardDescription>Set format for numbers and coordinates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Number Format</Label>
            <Select value={settings.numberFormat} onValueChange={(value) => onChange({ numberFormat: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Indonesian (1.234,56)</SelectItem>
                <SelectItem value="en-US">US (1,234.56)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Currency Format</Label>
            <Select value={settings.currencyFormat} onValueChange={(value) => onChange({ currencyFormat: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                <SelectItem value="USD">USD (Dollar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Coordinate Format</Label>
            <Select value={settings.coordinateFormat} onValueChange={(value) => onChange({ coordinateFormat: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">Decimal Degrees</SelectItem>
                <SelectItem value="dms">Degrees Minutes Seconds (DMS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interface Options</CardTitle>
          <CardDescription>Additional display options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Tooltips</Label>
            <Switch checked={settings.showTooltips} onCheckedChange={(checked) => onChange({ showTooltips: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Animations</Label>
            <Switch checked={settings.animationsEnabled} onCheckedChange={(checked) => onChange({ animationsEnabled: checked })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
