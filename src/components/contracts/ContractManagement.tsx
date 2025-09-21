'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Contract } from '@/lib/types';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import AddContractDialog from './AddContractDialog';
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
} from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteContract } from '@/app/contracts/actions';
import EditContractDialog from './EditContractDialog';

const statusVariants: { [key in Contract['status']]: 'default' | 'destructive' } = {
  Active: 'default',
  Expired: 'destructive',
};

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'contracts'), orderBy('created', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contractsData: Contract[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        contractsData.push({
          id: doc.id,
          name: data.name,
          provider: data.provider,
          created: data.created,
          status: data.status,
        });
      });
      setContracts(contractsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (contract: Contract) => {
    try {
      await deleteContract(contract.id);
      toast({
        title: 'Contract Deleted',
        description: `Contract "${contract.name}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete contract. Please try again.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>
              Browse, add, and manage data usage contracts.
            </CardDescription>
          </div>
          <AddContractDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-1/2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                   <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell>{contract.provider}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[contract.status]}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(contract.created).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <EditContractDialog contract={contract}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              Edit
                            </DropdownMenuItem>
                          </EditContractDialog>
                          <DropdownMenuSeparator />
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
                                  This action cannot be undone. This will permanently delete the contract "{contract.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(contract)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
