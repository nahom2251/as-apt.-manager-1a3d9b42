import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const user = supabase.auth.user();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, profiles(*)')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setProfile({
        id: user.id,
        email: user.email!,
        name: data.profiles.name,
        role: data.role,
        status: data.status,
      });
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => listener?.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signIn({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp(
      { email, password },
      { data: { name } }
    );
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.api.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    return { error };
  };

  return { profile, loading, signIn, signUp, signOut, resetPassword };
}