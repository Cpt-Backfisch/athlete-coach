import { createClient } from '@supabase/supabase-js';

// Supabase URL und Publishable Key sind öffentlich sicher (kein Secret).
// ⚠️ NIEMALS den Service Role Key hier eintragen — nur den Publishable Key (beginnt mit eyJ...).
const SUPABASE_URL = 'https://cpzdqgrqodvwtnqmusso.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemRxZ3Jxb2R2d3RucW11c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzQxODUsImV4cCI6MjA5MDIxMDE4NX0.qJe5-VH7FHU6LQGyokrHxJ-XwvIFm8ikrIMxTE4PFZ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
