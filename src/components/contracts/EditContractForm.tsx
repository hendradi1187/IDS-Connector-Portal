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
import { updateContract } from '@/app/contracts/actions';
import { useToast } from '@/hooks/use-toast';
import { Contract } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama kontrak minimal 2 karakter.',
  }),
  provider: z.string().min(2, {
    message: 'Provider harus diisi.',
  }),
  status: z.enum(['Aktif', 'Kadaluarsa']),
});

type EditContractFormProps = {
  contract: Contract;
  setOpen: (open: boolean) => void;
};

export function EditContractForm({ contract, setOpen }: EditContractFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contract.name,
      provider: contract.provider,
      status: contract.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await updateContract(contract.id, values);
      toast({
        title: 'Kontrak Diperbarui',
        description: `Kontrak "${values.name}" telah berhasil diperbarui.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memperbarui kontrak. Silakan coba lagi.',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kontrak</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Perjanjian Akses Data Produksi Q4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KKKS (Provider)</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Pertamina Hulu Energi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Kadaluarsa">Kadaluarsa</SelectItem>
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
