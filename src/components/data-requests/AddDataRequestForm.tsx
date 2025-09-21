'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addDataRequest } from '@/app/data-requests/actions';
import { useToast } from '@/hooks/use-toast';
import { DataRequest, Resource, Contract } from '@/lib/types';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  resourceId: z.string().min(1, { message: 'Please select a resource.' }),
  contractId: z.string().min(1, { message: 'Please select a contract.' }),
  destination: z.string().url({ message: 'Please enter a valid destination URL.' }),
  status: z.enum(['Pending', 'Approved', 'Delivered', 'Rejected']),
});

type AddDataRequestFormProps = {
  setOpen: (open: boolean) => void;
};

export function AddDataRequestForm({ setOpen }: AddDataRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceId: '',
      contractId: '',
      destination: '',
      status: 'Pending',
    },
  });

  useEffect(() => {
    const resQuery = query(collection(db, 'resources'), where('status', '==', 'Available'));
    const conQuery = query(collection(db, 'contracts'), where('status', '==', 'Active'));

    const unsubResources = onSnapshot(resQuery, (snapshot) => {
      const resourcesData: Resource[] = [];
      snapshot.forEach((doc) => resourcesData.push({ id: doc.id, ...doc.data() } as Resource));
      setResources(resourcesData);
    });

    const unsubContracts = onSnapshot(conQuery, (snapshot) => {
      const contractsData: Contract[] = [];
      snapshot.forEach((doc) => contractsData.push({ id: doc.id, ...doc.data() } as Contract));
      setContracts(contractsData);
    });

    return () => {
      unsubResources();
      unsubContracts();
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const selectedResource = resources.find(r => r.id === values.resourceId);
      const selectedContract = contracts.find(c => c.id === values.contractId);

      if (!selectedResource || !selectedContract) {
        throw new Error("Selected resource or contract not found.");
      }

      const requestData = {
        ...values,
        resourceName: selectedResource.name,
        contractName: selectedContract.name,
        created: new Date().toISOString(),
      };

      await addDataRequest(requestData as Omit<DataRequest, 'id'>);
      toast({
        title: 'Data Request Submitted',
        description: `Your request for "${selectedResource.name}" has been successfully submitted.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit data request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="resourceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an available resource" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {resources.map(resource => (
                    <SelectItem key={resource.id} value={resource.id}>{resource.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contractId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an active contract" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contracts.map(contract => (
                    <SelectItem key={contract.id} value={contract.id}>{contract.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/receive_data" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
}
