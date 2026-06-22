// ใส่ค่าจาก Supabase ของร้านตรงนี้
// Project Settings > API
const SUPABASE_URL = 'https://ueceurvoaglpcfvaiwey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tVdGKztKEsOChYFjohBNSg_4jhSMuvr';
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
