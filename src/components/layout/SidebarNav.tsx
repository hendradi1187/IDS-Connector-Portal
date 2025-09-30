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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface MenuItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: ('Admin' | 'KKKS-Provider' | 'SKK-Consumer')[];
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  collapsible?: boolean;
  roles?: ('Admin' | 'KKKS-Provider' | 'SKK-Consumer')[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    collapsible: false,
    items: [
      { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Data Management',
    icon: Database,
    collapsible: true,
    items: [
      { href: '/data-management', icon: Database, label: 'Metadata' },
      { href: '/mdm-geometry', icon: BookOpen, label: 'Catalog' },
      { href: '/vocabularies', icon: BookOpen, label: 'Vocabularies' },
    ]
  },
  {
    label: 'Governance',
    icon: Shield,
    collapsible: true,
    items: [
      { href: '/policies', icon: Shield, label: 'Policy' },
      { href: '/contracts', icon: FileText, label: 'Contract' },
    ]
  },
  {
    label: 'Operations',
    icon: Activity,
    collapsible: true,
    items: [
      { href: '/routing-services', icon: Waypoints, label: 'Transfer' },
      { href: '/activity-history', icon: History, label: 'History' },
      { href: '/clearing-house', icon: Banknote, label: 'Clearing House' },
    ]
  },
  {
    label: 'Administration',
    icon: Settings,
    collapsible: true,
    roles: ['Admin'],
    items: [
      { href: '/users', icon: Users, label: 'User Management', roles: ['Admin'] },
      { href: '/participants', icon: Building, label: 'Participants', roles: ['Admin'] },
      { href: '/license-management', icon: Key, label: 'License Management', roles: ['Admin'] },
      { href: '/connector-controller', icon: Plug, label: 'Connector Controller', roles: ['Admin'] },
      { href: '/dataspace-connector', icon: Boxes, label: 'Dataspace Connector', roles: ['Admin'] },
      { href: '/backend-system', icon: Server, label: 'Backend System', roles: ['Admin'] },
      { href: '/external-services', icon: Network, label: 'External Services', roles: ['Admin'] },
      { href: '/gui', icon: Settings, label: 'GUI Settings', roles: ['Admin'] },
    ]
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Data Management': false,
    'Governance': false,
    'Operations': false,
    'Administration': false,
  });

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    return user ? item.roles.includes(user.role) : false;
  };

  const hasGroupAccess = (group: MenuGroup): boolean => {
    if (!group.roles || group.roles.length === 0) return true;
    return user ? group.roles.includes(user.role) : false;
  };

  const getVisibleItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(hasAccess);
  };

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups(prev => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const isAnyChildActive = (items: MenuItem[]): boolean => {
    return items.some(item =>
      item.href === '/'
        ? pathname === item.href
        : pathname.startsWith(item.href)
    );
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuGroups.map((group) => {
                if (!hasGroupAccess(group)) return null;

                const visibleItems = getVisibleItems(group.items);
                if (visibleItems.length === 0) return null;

                // Non-collapsible groups (like Main/Dashboard)
                if (!group.collapsible) {
                  return visibleItems.map((item) => (
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
                  ));
                }

                // Collapsible groups
                const isOpen = openGroups[group.label];
                const hasActiveChild = isAnyChildActive(visibleItems);

                return (
                  <Collapsible
                    key={group.label}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(group.label)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={group.label}
                          isActive={hasActiveChild}
                        >
                          <group.icon className="h-4 w-4" />
                          <span>{group.label}</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform ${
                              isOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {visibleItems.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  item.href === '/'
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href)
                                }
                              >
                                <Link href={item.href}>
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
