import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://muvlkcoykridabaoikju.supabase.co";
const supabaseKey = "sb_publishable_SZ5fn23FROcU41OY34F8Kw_33jPgyoh";

export const supabase = createClient(supabaseUrl, supabaseKey);