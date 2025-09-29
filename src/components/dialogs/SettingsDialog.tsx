'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, CheckCircle, AlertCircle, Database, Globe, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // General Settings
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  // Data Settings
  const [coordinateSystem, setCoordinateSystem] = useState('EPSG:4326');
  const [dataValidation, setDataValidation] = useState(true);
  const [complianceChecking, setComplianceChecking] = useState(true);
  const [geometryValidation, setGeometryValidation] = useState(true);

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [auditLogging, setAuditLogging] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        // Apply loaded settings to state
        setRefreshInterval(settings.refreshInterval || '30');
        setMaxFileSize(settings.maxFileSize || '10');
        setEnableNotifications(settings.enableNotifications ?? true);
        setAutoBackup(settings.autoBackup ?? false);
        setCoordinateSystem(settings.coordinateSystem || 'EPSG:4326');
        setDataValidation(settings.dataValidation ?? true);
        setComplianceChecking(settings.complianceChecking ?? true);
        setGeometryValidation(settings.geometryValidation ?? true);
        setSessionTimeout(settings.sessionTimeout || '60');
        setAuditLogging(settings.auditLogging ?? true);
        setDataEncryption(settings.dataEncryption ?? true);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const settings = {
        refreshInterval: parseInt(refreshInterval),
        maxFileSize: parseInt(maxFileSize),
        enableNotifications,
        autoBackup,
        coordinateSystem,
        dataValidation,
        complianceChecking,
        geometryValidation,
        sessionTimeout: parseInt(sessionTimeout),
        auditLogging,
        dataEncryption,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save settings.');
      }
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setRefreshInterval('30');
    setMaxFileSize('10');
    setEnableNotifications(true);
    setAutoBackup(false);
    setCoordinateSystem('EPSG:4326');
    setDataValidation(true);
    setComplianceChecking(true);
    setGeometryValidation(true);
    setSessionTimeout('60');
    setAuditLogging(true);
    setDataEncryption(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!saving) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError('');
        setSuccess(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MDM System Settings
          </DialogTitle>
          <DialogDescription>
            Configure system preferences untuk Vocabulary Provider MDM.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data & Validation</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">General Preferences</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refresh">Dashboard Refresh (seconds)</Label>
                  <Input
                    id="refresh"
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    disabled={saving}
                    min="10"
                    max="300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filesize">Max File Size (MB)</Label>
                  <Input
                    id="filesize"
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(e.target.value)}
                    disabled={saving}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                    disabled={saving}
                  />
                  <Label htmlFor="notifications">
                    Enable system notifications
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="backup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                    disabled={saving}
                  />
                  <Label htmlFor="backup">
                    Enable automatic data backup (daily)
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data & Validation Settings */}
          <TabsContent value="data" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Data & Validation</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinate">Default Coordinate System</Label>
                  <Select value={coordinateSystem} onValueChange={setCoordinateSystem} disabled={saving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EPSG:4326">WGS 84 (EPSG:4326)</SelectItem>
                      <SelectItem value="EPSG:3857">Web Mercator (EPSG:3857)</SelectItem>
                      <SelectItem value="EPSG:32748">UTM Zone 48S (EPSG:32748)</SelectItem>
                      <SelectItem value="EPSG:32749">UTM Zone 49S (EPSG:32749)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Sesuai SKK Migas Data Specification v2 requirements
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validation"
                      checked={dataValidation}
                      onCheckedChange={setDataValidation}
                      disabled={saving}
                    />
                    <Label htmlFor="validation">
                      Enable strict data validation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compliance"
                      checked={complianceChecking}
                      onCheckedChange={setComplianceChecking}
                      disabled={saving}
                    />
                    <Label htmlFor="compliance">
                      Enable SKK Migas compliance checking
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="geometry"
                      checked={geometryValidation}
                      onCheckedChange={setGeometryValidation}
                      disabled={saving}
                    />
                    <Label htmlFor="geometry">
                      Enable geometry validation for spatial data
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Security & Compliance</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session">Session Timeout (minutes)</Label>
                  <Input
                    id="session"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    disabled={saving}
                    min="15"
                    max="480"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="audit"
                      checked={auditLogging}
                      onCheckedChange={setAuditLogging}
                      disabled={saving}
                    />
                    <Label htmlFor="audit">
                      Enable audit logging for all operations
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="encryption"
                      checked={dataEncryption}
                      onCheckedChange={setDataEncryption}
                      disabled={saving}
                    />
                    <Label htmlFor="encryption">
                      Enable data encryption at rest
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Success Alert */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Settings saved successfully! Changes will take effect immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}