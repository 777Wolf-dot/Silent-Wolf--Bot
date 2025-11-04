// supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Save a session to Supabase
 * @param {string} name - session name
 * @param {object} data - session data (Baileys auth state)
 */
export async function saveSession(name, data) {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .upsert({
      session_name: name,
      session_data: data,
      updated_at: new Date()
    }, { onConflict: 'session_name' });

  if (error) console.error('❌ Failed to save session to Supabase:', error);
}

/**
 * Load a session from Supabase
 * @param {string} name - session name
 * @returns {object|null} - session data or null
 */
export async function loadSession(name) {
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('session_data')
    .eq('session_name', name)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') // ignore "no rows" error
      console.error('❌ Failed to load session from Supabase:', error);
    return null;
  }

  return data?.session_data ?? null;
}
