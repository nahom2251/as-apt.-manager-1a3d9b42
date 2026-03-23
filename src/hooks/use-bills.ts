import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BillRow {
  id: string;
  tenant_id: string;
  tenant_name: string;
  apartment_id: string;
  unit_label: string;
  type: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  kwh: number | null;
  rate: number | null;
  months_count: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  paid_at: string | null;
}

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async (): Promise<BillRow[]> => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BillRow[];
    },
  });
}

export function useAddBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bill: Omit<BillRow, 'id' | 'created_at' | 'paid_at'>) => {
      const { error } = await supabase.from('bills').insert(bill);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
}

export function useMarkBillPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (billId: string) => {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', billId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
}

export function useDeleteBills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('bills').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
}
