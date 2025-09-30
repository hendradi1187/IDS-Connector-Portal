'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { NotificationSettings as NotificationSettingsType } from '@/lib/types';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onChange: (updates: Partial<NotificationSettingsType>) => void;
}

export default function NotificationSettings({ settings, onChange }: NotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => onChange({ emailNotifications: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Push Notifications</Label>
            <Switch checked={settings.pushNotifications} onCheckedChange={(checked) => onChange({ pushNotifications: checked })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Select which events you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Approval Notifications</Label>
            <Switch checked={settings.notifyOnApproval} onCheckedChange={(checked) => onChange({ notifyOnApproval: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Rejection Notifications</Label>
            <Switch checked={settings.notifyOnReject} onCheckedChange={(checked) => onChange({ notifyOnReject: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Comment Notifications</Label>
            <Switch checked={settings.notifyOnComment} onCheckedChange={(checked) => onChange({ notifyOnComment: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Mention Notifications</Label>
            <Switch checked={settings.notifyOnMention} onCheckedChange={(checked) => onChange({ notifyOnMention: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Data Update Notifications</Label>
            <Switch checked={settings.notifyOnDataUpdate} onCheckedChange={(checked) => onChange({ notifyOnDataUpdate: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>System Alert Notifications</Label>
            <Switch checked={settings.notifyOnSystemAlert} onCheckedChange={(checked) => onChange({ notifyOnSystemAlert: checked })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>Control how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Digest Frequency</Label>
            <Select value={settings.digestFrequency} onValueChange={(value) => onChange({ digestFrequency: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Set times when notifications should be paused</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Quiet Hours</Label>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(checked) => onChange({ quietHours: { ...settings.quietHours, enabled: checked } })}
            />
          </div>
          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => onChange({ quietHours: { ...settings.quietHours, start: e.target.value } })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => onChange({ quietHours: { ...settings.quietHours, end: e.target.value } })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
