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
  resourceId: z.string().min(1, { message: 'Silakan pilih sumber daya.' }),
  contractId: z.string().min(1, { message: 'Silakan pilih kontrak.' }),
  destination: z.string().url({ message: 'Silakan masukkan URL tujuan yang valid.' }),
  status: z.enum(['Tertunda', 'Disetujui', 'Terkirim', 'Ditolak']),
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
      status: 'Tertunda',
    },
  });

  useEffect(() => {
    const resQuery = query(collection(db, 'resources'), where('status', '==', 'Tersedia'));
    const conQuery = query(collection(db, 'contracts'), where('status', '==', 'Aktif'));

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
        throw new Error("Sumber daya atau kontrak yang dipilih tidak ditemukan.");
      }

      const requestData = {
        ...values,
        resourceName: selectedResource.name,
        contractName: selectedContract.name,
        created: new Date().toISOString(),
      };

      await addDataRequest(requestData as Omit<DataRequest, 'id'>);
      toast({
        title: 'Permintaan Data Terkirim',
        description: `Permintaan Anda untuk "${selectedResource.name}" telah berhasil dikirim.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengirim permintaan data. Silakan coba lagi.',
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
              <FormLabel>Sumber Daya</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sumber daya yang tersedia" />
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
              <FormLabel>Kontrak</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kontrak yang aktif" />
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
              <FormLabel>URL Tujuan</FormLabel>
              <FormControl>
                <Input placeholder="https://api.skkmigas.go.id/data-receiver" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Permintaan'}
        </Button>
      </form>
    </Form>
  );
}
