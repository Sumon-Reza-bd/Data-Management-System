
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://keuurhylwmirznjpmkgi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXVyaHlsd21pcnpuanBta2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDU3MTEsImV4cCI6MjA4Nzk4MTcxMX0.MvPKNBsDgaKJuSZ9DeOqJLguU2wsBGs5iF_BaESkJTs';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing or using placeholder values. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sterling-hub-auth'
    }
  }
);
