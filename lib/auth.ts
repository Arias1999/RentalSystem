'use client';

import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  createdAt: string;
}

type Profile = Pick<User, 'name' | 'phone' | 'address' | 'licenseNumber' | 'licenseExpiry'>;

function toAppUser(user: SupabaseUser): User {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Driver',
    email: user.email || '',
    phone: metadata.phone || undefined,
    address: metadata.address || undefined,
    licenseNumber: metadata.license_number || undefined,
    licenseExpiry: metadata.license_expiry || undefined,
    createdAt: user.created_at,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setUser(error || !data.user ? null : toAppUser(data.user));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export async function register(
  name: string,
  email: string,
  password: string,
  phone?: string,
  profile?: Pick<Profile, 'address' | 'licenseNumber' | 'licenseExpiry'>,
): Promise<{ error?: string; user?: User; needsEmailConfirmation?: boolean }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone,
        address: profile?.address,
        license_number: profile?.licenseNumber,
        license_expiry: profile?.licenseExpiry,
      },
    },
  });

  if (error) return { error: error.message };
  if (!data.session || !data.user) return { needsEmailConfirmation: true };
  return { user: toAppUser(data.user) };
}

export async function verifySignupCode(email: string, token: string): Promise<{ error?: string; user?: User }> {
  const { data, error } = await getSupabaseBrowserClient().auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });
  if (error) return { error: error.message };
  return data.user ? { user: toAppUser(data.user) } : { error: 'Could not verify your account. Please try again.' };
}

export async function resendSignupCode(email: string): Promise<{ error?: string }> {
  const { error } = await getSupabaseBrowserClient().auth.resend({ type: 'signup', email });
  return error ? { error: error.message } : {};
}

export async function login(email: string, password: string): Promise<{ error?: string; user?: User; isAdmin?: boolean }> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  if (!data.user) return { error: 'Could not load your account.' };
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  if (profileError) {
    return { error: 'Signed in, but could not check your account role. Make sure the admin migration is applied to the Supabase project configured in Vercel.' };
  }
  return { user: toAppUser(data.user), isAdmin: profile?.role === 'admin' };
}

export async function logout(): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<User | null> {
  const { data, error } = await getSupabaseBrowserClient().auth.getUser();
  return error || !data.user ? null : toAppUser(data.user);
}

export async function updateProfile(profile: Pick<User, 'name' | 'phone' | 'address'>): Promise<{ error?: string; user?: User }> {
  const supabase = getSupabaseBrowserClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return { error: 'Please sign in to update your profile.' };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: profile.name, phone: profile.phone, address: profile.address })
    .eq('id', authData.user.id);
  if (profileError) return { error: profileError.message };

  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: profile.name, phone: profile.phone, address: profile.address },
  });
  if (error) return { error: error.message };
  return data.user ? { user: toAppUser(data.user) } : { error: 'Could not reload your account.' };
}
