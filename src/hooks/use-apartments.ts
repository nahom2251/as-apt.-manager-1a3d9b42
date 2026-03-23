import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApartmentRow {
  id: string;
  floor: number;
  position: string;
}

export interface TenantRow {
  id: string;
  apartment_id: string;
  name: string;
  phone: string;
  move_in_date: string;
  monthly_rent: number;
  payment_months: number;
}

export interface ApartmentWithTenant extends ApartmentRow {
  tenant: TenantRow | null;
}

export function useApartments() {
  return useQuery({
    queryKey: ['apartments'],
    queryFn: async (): Promise<ApartmentWithTenant[]> => {
      const { data: apts, error: aptErr } = await supabase
        .from('apartments')
        .select('*')
        .order('floor', { ascending: true });
      if (aptErr) throw aptErr;

      const { data: tenants, error: tenErr } = await supabase
        .from('tenants')
        .select('*');
      if (tenErr) throw tenErr;

      const tenantMap = new Map<string, TenantRow>();
      (tenants || []).forEach((t: any) => tenantMap.set(t.apartment_id, t));

      return (apts || []).map((a: any) => ({
        id: a.id,
        floor: a.floor,
        position: a.position,
        tenant: tenantMap.get(a.id) || null,
      }));
    },
  });
}

export function useSetTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ apartmentId, tenant }: {
      apartmentId: string;
      tenant: { name: string; phone: string; move_in_date: string; monthly_rent: number; payment_months: number };
    }) => {
      const { error } = await supabase.from('tenants').insert({
        apartment_id: apartmentId,
        name: tenant.name,
        phone: tenant.phone,
        move_in_date: tenant.move_in_date,
        monthly_rent: tenant.monthly_rent,
        payment_months: tenant.payment_months,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  });
}

export function useRemoveTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (apartmentId: string) => {
      const { error } = await supabase.from('tenants').delete().eq('apartment_id', apartmentId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  });
}

export function useUpdateTenantPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ apartmentId, paymentMonths }: { apartmentId: string; paymentMonths: number }) => {
      const { error } = await supabase
        .from('tenants')
        .update({ payment_months: paymentMonths })
        .eq('apartment_id', apartmentId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['apartments'] }),
  });
}
