
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkgwvncsypynnlhcslql.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ3d2bmNzeXB5bm5saGNzbHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDAxNDgsImV4cCI6MjA4NzgxNjE0OH0.IJCoDqVs1GXLEqU8pitXH6kdtSYmYGJd3ZZmAGP6c8A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
