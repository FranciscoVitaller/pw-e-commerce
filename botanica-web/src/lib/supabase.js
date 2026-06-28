import { createClient } from '@supabase/supabase-js';

// Traemos las credenciales de la caja fuerte
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Creamos y exportamos el cliente (el cable de conexión)
export const supabase = createClient(supabaseUrl, supabaseKey);