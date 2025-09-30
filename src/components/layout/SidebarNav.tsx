'use client';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  LifeBuoy,
  Database,
  Waypoints,
  Server,
  Network,
  Plug,
  Boxes,
  Key,
  CreditCard,
  BookOpen,
  FileText,
  Activity,
  Building,
  History,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: ('Admin' | 'KKKS-Provider' | 'SKK-Consumer')[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Main',
    items: [
      { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/data-management', icon: Database, label: 'Metadata' },
      { href: '/mdm-geometry', icon: BookOpen, label: 'Catalog' },
      { href: '/vocabularies', icon: BookOpen, label: 'Vocabularies' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/policies', icon: Shield, label: 'Policy', roles: ['Admin'] },
      { href: '/contracts', icon: FileText, label: 'Contract' },
      { href: '/routing-services', icon: Waypoints, label: 'Transfer' },
      { href: '/activity-history', icon: History, label: 'History' },
      { href: '/clearing-house', icon: Banknote, label: 'Clearing House' },
    ]
  },
  {
    label: 'Administration',
    items: [
      { href: '/users', icon: Users, label: 'User Management', roles: ['Admin'] },
      { href: '/participants', icon: Building, label: 'Participants', roles: ['Admin'] },
      { href: '/license-management', icon: Key, label: 'License Management', roles: ['Admin'] },
      { href: '/connector-controller', icon: Plug, label: 'Connector Controller', roles: ['Admin'] },
      { href: '/dataspace-connector', icon: Boxes, label: 'Dataspace Connector', roles: ['Admin'] },
      { href: '/backend-system', icon: Server, label: 'Backend System', roles: ['Admin'] },
      { href: '/external-services', icon: Network, label: 'External IDS Services', roles: ['Admin'] },
      { href: '/gui', icon: Settings, label: 'GUI Settings', roles: ['Admin'] },
    ]
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    return user ? item.roles.includes(user.role) : false;
  };

  const getVisibleItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(hasAccess);
  };

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              IDS Portal
            </h2>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'Admin' ? 'Admin Control' :
               user?.role === 'KKKS-Provider' ? 'Data Provider' :
               'Data Consumer'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => {
          const visibleItems = getVisibleItems(group.items);

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support">
              <LifeBuoy className="h-4 w-4" />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={`Logged in as ${user.name}`}>
                <Users className="h-4 w-4" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
