
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bpanrzaihlxnyzhymxeq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwYW5yemFpaGx4bnl6aHlteGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTM5NjEsImV4cCI6MjA4NTk4OTk2MX0.8Z-wBT4AcdIbSDN8sNYRsVgwaKS_KvBObUPFUkpVnz4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
