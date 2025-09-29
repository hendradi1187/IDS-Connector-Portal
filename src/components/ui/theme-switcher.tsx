'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme, INDUSTRIAL_THEMES } from '@/context/ThemeContext';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Zap,
  Shield,
  Activity,
  Settings
} from 'lucide-react';

interface ThemeSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showDescription?: boolean;
}

export function ThemeSwitcher({
  variant = 'default',
  showDescription = true
}: ThemeSwitcherProps) {
  const { theme, setTheme, toggleTheme, isDark, isLight } = useTheme();

  const getCurrentIcon = () => {
    if (isDark) return <Moon className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  const getCurrentThemeInfo = () => {
    return INDUSTRIAL_THEMES[theme];
  };

  // Icon-only variant for compact spaces
  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      >
        {getCurrentIcon()}
      </Button>
    );
  }

  // Compact variant for sidebar/header
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            {getCurrentIcon()}
            <span className="hidden sm:inline">
              {isDark ? 'Control Room' : 'Professional'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Visual Theme
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">Professional Light</div>
              <div className="text-xs text-muted-foreground">
                Presentations & Reports
              </div>
            </div>
            {isLight && <Badge variant="secondary" className="text-xs">Active</Badge>}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">Control Room Dark</div>
              <div className="text-xs text-muted-foreground">
                24/7 Monitoring & Operations
              </div>
            </div>
            {isDark && <Badge variant="secondary" className="text-xs">Active</Badge>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default full variant
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-industrial-blue" />
          <h3 className="font-semibold">Industrial Theme</h3>
        </div>
        {getCurrentIcon()}
      </div>

      {showDescription && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {getCurrentThemeInfo().name}
            </Badge>
            <span className="text-lg">{getCurrentThemeInfo().icon}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {getCurrentThemeInfo().description}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Best for:</strong> {getCurrentThemeInfo().usage}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={isLight ? "default" : "outline"}
          onClick={() => setTheme('light')}
          className="flex-col h-auto p-4 gap-2"
        >
          <Sun className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium text-sm">Professional</div>
            <div className="text-xs opacity-70">Light Mode</div>
          </div>
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-3 rounded-full bg-industrial-blue"></div>
            <div className="w-3 h-3 rounded-full bg-energy-green"></div>
            <div className="w-3 h-3 rounded-full bg-migas-orange"></div>
          </div>
        </Button>

        <Button
          variant={isDark ? "default" : "outline"}
          onClick={() => setTheme('dark')}
          className="flex-col h-auto p-4 gap-2"
        >
          <Moon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium text-sm">Control Room</div>
            <div className="text-xs opacity-70">Dark Mode</div>
          </div>
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-3 rounded-full bg-industrial-blue"></div>
            <div className="w-3 h-3 rounded-full bg-energy-green"></div>
            <div className="w-3 h-3 rounded-full bg-migas-orange"></div>
          </div>
        </Button>
      </div>

      {/* Color Scheme Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Data Traffic Colors</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="w-full h-8 bg-data-request rounded mb-1"></div>
            <div className="text-xs font-medium">Requests</div>
            <div className="text-xs text-muted-foreground">Blue</div>
          </div>
          <div className="text-center">
            <div className="w-full h-8 bg-data-response rounded mb-1"></div>
            <div className="text-xs font-medium">Responses</div>
            <div className="text-xs text-muted-foreground">Green</div>
          </div>
          <div className="text-center">
            <div className="w-full h-8 bg-data-error rounded mb-1"></div>
            <div className="text-xs font-medium">Errors</div>
            <div className="text-xs text-muted-foreground">Red</div>
          </div>
          <div className="text-center">
            <div className="w-full h-8 bg-data-latency rounded mb-1"></div>
            <div className="text-xs font-medium">Latency</div>
            <div className="text-xs text-muted-foreground">Orange</div>
          </div>
        </div>
      </div>

      {/* Usage Context */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Theme Usage Context</h4>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
            <Shield className="h-3 w-3 text-industrial-blue" />
            <span className="font-medium">Light Mode:</span>
            <span className="text-muted-foreground">SKK Migas presentations, regulatory reports</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
            <Activity className="h-3 w-3 text-energy-green" />
            <span className="font-medium">Dark Mode:</span>
            <span className="text-muted-foreground">SCADA monitoring, night shift operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Toggle Button Component
export function QuickThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="gap-2"
      title={`Switch to ${isDark ? 'Professional Light' : 'Control Room Dark'} mode`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden md:inline">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </Button>
  );
}

// Status Indicator with Theme-aware Colors
export function StatusIndicator({
  status,
  label,
  showLabel = true
}: {
  status: 'online' | 'warning' | 'error' | 'offline';
  label?: string;
  showLabel?: boolean;
}) {
  const statusConfig = {
    online: {
      class: 'status-online',
      icon: <Zap className="h-3 w-3" />,
      label: 'Online'
    },
    warning: {
      class: 'status-warning',
      icon: <Settings className="h-3 w-3" />,
      label: 'Warning'
    },
    error: {
      class: 'status-error',
      icon: <Activity className="h-3 w-3" />,
      label: 'Error'
    },
    offline: {
      class: 'status-offline',
      icon: <Monitor className="h-3 w-3" />,
      label: 'Offline'
    }
  };

  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <Badge className={`${config.class} gap-1`}>
      {config.icon}
      {showLabel && displayLabel}
    </Badge>
  );
}