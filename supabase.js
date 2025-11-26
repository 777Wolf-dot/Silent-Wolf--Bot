// ====== SUPABASE HELPER (FIXED) ======
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Utility to convert Baileys key store for safe Supabase storage
async function serializeSession(state) {
  return {
    creds: state.creds,
    keys: Object.fromEntries(await state.keys.entries()), // convert Maps -> plain object
  };
}

// Utility to restore serialized key store to Baileys-compatible format
function deserializeSession(data) {
  if (!data || !data.creds || !data.keys) return null;
  return {
    creds: data.creds,
    keys: new Map(Object.entries(data.keys)), // restore plain object -> Map
  };
}

/**
 * Save bot session to Supabase
 * @param {string} key - session key (e.g., 'main')
 * @param {object} session - Baileys auth state
 */
export async function saveSession(key, session) {
  try {
    const serialized = await serializeSession(session);
    const { error } = await supabase
      .from('bot_sessions')
      .upsert({ session_id: key, session_data: serialized })
      .eq('session_id', key);

    if (error) throw error;
    console.log(`💾 Session [${key}] saved to Supabase.`);
  } catch (err) {
    console.error('❌ Failed to save session to Supabase:', err);
  }
}

/**
 * Load bot session from Supabase
 * @param {string} key - session key
 * @returns {object|null}
 */
export async function loadSession(key) {
  try {
    const { data, error } = await supabase
      .from('bot_sessions')
      .select('*')
      .eq('session_id', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? deserializeSession(data.session_data) : null;
  } catch (err) {
    console.error('❌ Failed to load session from Supabase:', err);
    return null;
  }
}

/**
 * Get all bot sessions
 * @returns {Array<{ session_id: string, session_data: object }>}
 */
export async function getAllSessions() {
  try {
    const { data, error } = await supabase
      .from('bot_sessions')
      .select('*');

    if (error) throw error;

    return (data || []).map(sess => ({
      session_id: sess.session_id,
      session_data: deserializeSession(sess.session_data),
    }));
  } catch (err) {
    console.error('❌ Failed to fetch all sessions:', err);
    return [];
  }
}

/**
 * Remove session (optional helper)
 * @param {string} key
 */
export async function removeSession(key) {
  try {
    const { error } = await supabase.from('bot_sessions').delete().eq('session_id', key);
    if (error) throw error;
    console.log(`🗑️ Session [${key}] removed from Supabase.`);
  } catch (err) {
    console.error('❌ Failed to remove session:', err);
  }
}

/**
 * Link a user to the bot (store their JID for notifications)
 * @param {string} jid - WhatsApp JID (number@c.us)
 */
export async function linkUser(jid) {
  try {
    const { error } = await supabase.from('linked_users').upsert({ jid }).eq('jid', jid);
    if (error) throw error;
    console.log(`✅ Linked user saved: ${jid}`);
  } catch (err) {
    console.error('❌ Failed to link user:', err);
  }
}

/**
 * Get all users who have linked the bot
 * @returns {Array<{jid: string}>}
 */
export async function getAllLinkedUsers() {
  try {
    const { data, error } = await supabase.from('linked_users').select('jid');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Failed to fetch linked users:', err);
    return [];
  }
}
