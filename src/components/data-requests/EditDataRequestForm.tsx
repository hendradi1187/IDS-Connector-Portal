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
import { updateDataRequest } from '@/app/data-requests/actions';
import { useToast } from '@/hooks/use-toast';
import { DataRequest } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  status: z.enum(['Tertunda', 'Disetujui', 'Terkirim', 'Ditolak']),
});

type EditDataRequestFormProps = {
  dataRequest: DataRequest;
  setOpen: (open: boolean) => void;
};

export function EditDataRequestForm({ dataRequest, setOpen }: EditDataRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: dataRequest.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await updateDataRequest(dataRequest.id, values);
      toast({
        title: 'Permintaan Data Diperbarui',
        description: `Permintaan untuk "${dataRequest.resourceName}" telah diperbarui.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memperbarui permintaan data. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <div>
                <FormLabel>Sumber Daya</FormLabel>
                <Input readOnly disabled value={dataRequest.resourceName} />
            </div>
            <div>
                <FormLabel>Kontrak</FormLabel>
                <Input readOnly disabled value={dataRequest.contractName} />
            </div>
             <div>
                <FormLabel>Tujuan</FormLabel>
                <Input readOnly disabled value={dataRequest.destination} />
            </div>
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Perbarui status permintaan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Tertunda">Tertunda</SelectItem>
                  <SelectItem value="Disetujui">Disetujui</SelectItem>
                  <SelectItem value="Terkirim">Terkirim</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </Form>
  );
}
