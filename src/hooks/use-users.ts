import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function useAppUsers() {
  return useQuery({
    queryKey: ['app-users'],
    queryFn: async (): Promise<AppUserRow[]> => {
      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('*');
      if (rErr) throw rErr;

      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*');
      if (pErr) throw pErr;

      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

      return (roles || []).map((r: any) => {
        const p = profileMap.get(r.user_id);
        return {
          id: r.user_id,
          name: p?.name || '',
          email: p?.email || '',
          role: r.role,
          status: r.status,
        };
      });
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ status })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-users'] }),
  });
}
