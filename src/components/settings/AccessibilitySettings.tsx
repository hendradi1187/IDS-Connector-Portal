'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { AccessibilitySettings as AccessibilitySettingsType } from '@/lib/types';

interface AccessibilitySettingsProps {
  settings: AccessibilitySettingsType;
  onChange: (updates: Partial<AccessibilitySettingsType>) => void;
}

export default function AccessibilitySettings({ settings, onChange }: AccessibilitySettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visual Accessibility</CardTitle>
          <CardDescription>Adjust visual settings for better readability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => onChange({ highContrast: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => onChange({ reduceMotion: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Screen Reader</CardTitle>
          <CardDescription>Optimize interface for screen readers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Screen Reader Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced ARIA labels and semantic HTML
              </p>
            </div>
            <Switch
              checked={settings.screenReaderOptimized}
              onCheckedChange={(checked) => onChange({ screenReaderOptimized: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard Navigation</CardTitle>
          <CardDescription>Configure keyboard accessibility options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Keyboard Navigation Only</Label>
              <p className="text-sm text-muted-foreground">
                Disable mouse/touch interactions
              </p>
            </div>
            <Switch
              checked={settings.keyboardNavigationOnly}
              onCheckedChange={(checked) => onChange({ keyboardNavigationOnly: checked })}
            />
          </div>
          <div>
            <Label>Focus Indicator Style</Label>
            <Select
              value={settings.focusIndicator}
              onValueChange={(value) => onChange({ focusIndicator: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="thick">Thick Border</SelectItem>
                <SelectItem value="glow">Glow Effect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Information</CardTitle>
          <CardDescription>Keyboard shortcuts and accessibility features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tab Navigation</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">Tab</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Activate Element</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Close Dialog</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">Esc</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Search</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">Ctrl</kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">K</kbd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
