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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Palette,
  Monitor,
  Bell,
  LayoutDashboard,
  Eye,
  Save,
  RotateCcw,
} from 'lucide-react';
import ThemeCustomization from './ThemeCustomization';
import DisplayPreferences from './DisplayPreferences';
import NotificationSettings from './NotificationSettings';
import DashboardCustomization from './DashboardCustomization';
import AccessibilitySettings from './AccessibilitySettings';
import type { UserPreferences } from '@/lib/types';
import { saveUserPreferences, getUserPreferences, resetUserPreferences } from '@/app/gui/actions';

export default function GUISettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    userId: user?.id || '',
    theme: {
      mode: 'system',
      primaryColor: '#0ea5e9',
      accentColor: '#3b82f6',
      fontSize: 'medium',
      fontFamily: 'system',
      borderRadius: 'medium',
      compactMode: false,
    },
    display: {
      language: 'id',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      timezone: 'Asia/Jakarta',
      numberFormat: 'id',
      currencyFormat: 'IDR',
      coordinateFormat: 'decimal',
      showTooltips: true,
      animationsEnabled: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      notifyOnApproval: true,
      notifyOnReject: true,
      notifyOnComment: true,
      notifyOnMention: true,
      notifyOnDataUpdate: false,
      notifyOnSystemAlert: true,
      digestFrequency: 'daily',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
    },
    dashboard: {
      defaultView: 'overview',
      layout: 'grid',
      cardsPerRow: 3,
      showQuickActions: true,
      showStatistics: true,
      showRecentActivity: true,
      autoRefresh: false,
      refreshInterval: 300,
      pinnedItems: [],
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      screenReaderOptimized: false,
      keyboardNavigationOnly: false,
      focusIndicator: 'default',
    },
    updatedAt: new Date().toISOString(),
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        const result = await getUserPreferences(user.id);
        if (result.success && result.data) {
          setPreferences(result.data);
        }
      }
    };
    loadPreferences();
  }, [user]);

  const handleSave = async () => {
    try {
      const result = await saveUserPreferences(preferences);
      if (result.success) {
        setPreferences({
          ...preferences,
          updatedAt: new Date().toISOString(),
        });
        setHasChanges(false);
        toast({
          title: 'Settings Saved',
          description: 'Your preferences have been saved successfully.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
      });
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      if (user?.id) {
        const result = await resetUserPreferences(user.id);
        if (result.success && result.data) {
          setPreferences(result.data);
          setHasChanges(false);
          toast({
            title: 'Settings Reset',
            description: 'All settings have been reset to defaults.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to reset settings. Please try again.',
          });
        }
      }
    }
  };

  const updatePreferences = (section: keyof UserPreferences, updates: any) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...updates,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            GUI Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your interface preferences and experience
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="display">
            <Monitor className="h-4 w-4 mr-2" />
            Display
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Eye className="h-4 w-4 mr-2" />
            Accessibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeCustomization
            settings={preferences.theme}
            onChange={(updates) => updatePreferences('theme', updates)}
          />
        </TabsContent>

        <TabsContent value="display">
          <DisplayPreferences
            settings={preferences.display}
            onChange={(updates) => updatePreferences('display', updates)}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings
            settings={preferences.notifications}
            onChange={(updates) => updatePreferences('notifications', updates)}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardCustomization
            settings={preferences.dashboard}
            onChange={(updates) => updatePreferences('dashboard', updates)}
          />
        </TabsContent>

        <TabsContent value="accessibility">
          <AccessibilitySettings
            settings={preferences.accessibility}
            onChange={(updates) => updatePreferences('accessibility', updates)}
          />
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your settings affect the interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 bg-muted/20">
            <p className="text-sm text-muted-foreground mb-4">
              Current theme: {preferences.theme.mode} | Font size: {preferences.theme.fontSize} | Language: {preferences.display.language}
            </p>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded"
                  style={{ backgroundColor: preferences.theme.primaryColor }}
                />
                <span className="text-sm">Primary Color</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded"
                  style={{ backgroundColor: preferences.theme.accentColor }}
                />
                <span className="text-sm">Accent Color</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
