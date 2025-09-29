'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'ids-portal-theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Hydrate theme from localStorage after component mounts
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setThemeState(storedTheme);
      } else {
        // Check system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setThemeState(systemTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(theme);

    // Store theme preference
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme, mounted, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware components and utilities
export const ThemeAwareComponent: React.FC<{
  lightContent: React.ReactNode;
  darkContent: React.ReactNode;
}> = ({ lightContent, darkContent }) => {
  const { isDark } = useTheme();
  return <>{isDark ? darkContent : lightContent}</>;
};

// Industrial theme presets
export const INDUSTRIAL_THEMES = {
  light: {
    name: 'Professional Light',
    description: 'Suitable for presentations, management reports, regulatory meetings',
    icon: '☀️',
    usage: 'Ideal for SKK Migas presentations, regulatory compliance, management dashboards'
  },
  dark: {
    name: 'Control Room Dark',
    description: 'Optimized for 24/7 monitoring, shift operations, technical analysis',
    icon: '🌙',
    usage: 'Perfect for SCADA monitoring, night shifts, real-time operations'
  }
} as const;

// Utility function to get current theme colors
export function useThemeColors() {
  const { theme } = useTheme();

  // Get CSS custom properties
  const getColor = (property: string) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  };

  return {
    // Primary Industrial Colors
    industrialBlue: `hsl(${getColor('--primary')})`,
    energyGreen: `hsl(${getColor('--secondary')})`,

    // Migas Accent Colors
    migasOrange: `hsl(${getColor('--accent')})`,
    safetyRed: `hsl(${getColor('--destructive')})`,

    // Data Traffic Colors
    dataRequest: `hsl(${getColor('--data-request')})`,
    dataResponse: `hsl(${getColor('--data-response')})`,
    dataError: `hsl(${getColor('--data-error')})`,
    dataLatency: `hsl(${getColor('--data-latency')})`,

    // Chart Colors
    chart: [
      `hsl(${getColor('--chart-1')})`,
      `hsl(${getColor('--chart-2')})`,
      `hsl(${getColor('--chart-3')})`,
      `hsl(${getColor('--chart-4')})`,
      `hsl(${getColor('--chart-5')})`,
    ],

    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
}

// Hook for adaptive colors based on theme
export function useAdaptiveColors() {
  const { theme } = useTheme();

  const colors = {
    light: {
      statusColors: {
        online: '#2E7D32',    // Energy Green
        warning: '#FF9800',   // Migas Orange
        error: '#D32F2F',     // Safety Red
        offline: '#90A4AE'    // Neutral Gray
      },
      dataColors: {
        requests: '#005B96',   // Industrial Blue
        responses: '#2E7D32',  // Energy Green
        errors: '#D32F2F',     // Safety Red
        latency: '#FF9800'     // Migas Orange
      }
    },
    dark: {
      statusColors: {
        online: '#00A884',    // Bright Energy Green
        warning: '#FF9800',   // Bright Orange
        error: '#F44336',     // Bright Red
        offline: '#90A4AE'    // Neutral Gray
      },
      dataColors: {
        requests: '#1976D2',   // Bright Industrial Blue
        responses: '#00A884',  // Bright Energy Green
        errors: '#F44336',     // Bright Red
        latency: '#FF9800'     // Bright Orange
      }
    }
  };

  return colors[theme];
}