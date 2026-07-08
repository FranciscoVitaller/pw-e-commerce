import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey && supabaseUrl !== 'placeholder' && supabaseKey !== 'placeholder');

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : null;