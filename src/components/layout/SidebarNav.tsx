'use client';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  LifeBuoy,
  Power,
  Database,
  Waypoints,
  Server,
  Network,
  Plug,
  Boxes,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'User Management' },
  { href: '/gui', icon: Settings, label: 'GUI' },
  { href: '/data-management', icon: Database, label: 'Data Management' },
  { href: '/connector-controller', icon: Plug, label: 'Connector Controller' },
  { href: '/dataspace-connector', icon: Boxes, label: 'Dataspace Connector' },
  { href: '/routing-services', icon: Waypoints, label: 'Routing & Services' },
  { href: '/backend-system', icon: Server, label: 'Backend System' },
  { href: '/external-services', icon: Network, label: 'External IDS Services' },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  }

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              IDS Portal
            </h2>
            <p className="text-xs text-muted-foreground">Connector Control</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                as={Link}
                href={item.href}
                isActive={
                  item.href === '/'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support">
              <LifeBuoy />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2" onClick={handleLogout}>
              <Power />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
