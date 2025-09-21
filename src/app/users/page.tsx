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
          <TabsTrigger value="kkks">KKKS-Providers</TabsTrigger>
          <TabsTrigger value="skk">SKK-Consumers</TabsTrigger>
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
       <TabsContent value="kkks">
        <Card>
          <CardHeader>
            <CardTitle>KKKS Providers</CardTitle>
            <CardDescription>
              Users from KKKS who provide data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable role="KKKS-Provider" />
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="skk">
        <Card>
          <CardHeader>
            <CardTitle>SKK Consumers</CardTitle>
            <CardDescription>
             Users from SKK Migas who consume data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable role="SKK-Consumer" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
