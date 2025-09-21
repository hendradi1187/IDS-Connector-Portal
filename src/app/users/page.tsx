import UserTable from '@/components/users/UserTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddUserDialog from '@/components/users/AddUserDialog';

export default function UsersPage() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="operator">Operators</TabsTrigger>
          <TabsTrigger value="viewer">Viewers</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline">
            Export
          </Button>
          <AddUserDialog />
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage all user accounts and their roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable role="all" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="admin">
        <Card>
          <CardHeader>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Users with full administrative privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable role="Admin" />
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="operator">
        <Card>
          <CardHeader>
            <CardTitle>Operators</CardTitle>
            <CardDescription>
              Users who can manage connectors and routes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable role="Operator" />
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="viewer">
        <Card>
          <CardHeader>
            <CardTitle>Viewers</CardTitle>
            <CardDescription>
             Users with read-only access to the portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable role="Viewer" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
