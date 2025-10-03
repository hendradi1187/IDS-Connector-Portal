'use client';

import {
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { User } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteUser } from '@/app/users/actions';
import { useToast } from '@/hooks/use-toast';
import EditUserDialog from './EditUserDialog';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const roleVariants: { [key in User['role']]: 'default' | 'secondary' | 'outline' } = {
  Admin: 'default',
  'KKKS-Provider': 'secondary',
  'SKK-Consumer': 'outline',
};

type UserTableRowProps = {
  user: User;
};

export default function UserTableRow({ user }: UserTableRowProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  // RBAC: Only Admin can manage users, and users can't delete themselves
  const canEditUser = currentUser?.role === 'Admin';
  const canDeleteUser = currentUser?.role === 'Admin' && currentUser.id !== user.id;

  const handleDelete = async () => {
    if (!canDeleteUser) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to delete this user.',
      });
      return;
    }

    try {
      await deleteUser(user.id);
      toast({
        title: 'User Deleted',
        description: `User ${user.name} has been successfully deleted.`,
      });
      // Refresh the page using Next.js router
      router.refresh();
    } catch (error) {
      console.error('Delete user error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user. Please try again.',
      });
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={roleVariants[user.role]}
        >
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
         <div className="text-sm text-muted-foreground">{user.organization}</div>
      </TableCell>
      <TableCell className="text-right">
        {(canEditUser || canDeleteUser) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {/* Edit User - Only for Admin */}
              {canEditUser && (
                <EditUserDialog user={user}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit
                  </DropdownMenuItem>
                </EditUserDialog>
              )}

              {/* Delete User - Only for Admin and can't delete self */}
              {canDeleteUser && (
                <>
                  {canEditUser && <DropdownMenuSeparator />}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          the user account for {user.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {/* Show message if no actions available */}
              {!canEditUser && !canDeleteUser && (
                <DropdownMenuItem disabled>
                  No actions available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Show disabled button if user has no permissions
          <Button aria-haspopup="true" size="icon" variant="ghost" disabled>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">No actions available</span>
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
