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


































// // supabase.js
// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';
// import crypto from 'crypto';

// dotenv.config();

// // Create Supabase client
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// // --- AES-192-CBC Decryption Setup ---
// if (!process.env.SESSION_ENCRYPTION_KEY) {
//   console.error('❌ Missing SESSION_ENCRYPTION_KEY in .env');
//   process.exit(1);
// }
// const key = Buffer.from(process.env.SESSION_ENCRYPTION_KEY, 'base64');

// function decryptBuffer(encryptedBase64) {
//   try {
//     const data = Buffer.from(encryptedBase64, 'base64');
//     const iv = data.slice(0, 16);
//     const encrypted = data.slice(16);
//     const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
//     const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//     return decrypted;
//   } catch (err) {
//     console.error('❌ Decryption failed:', err.message);
//     return null;
//   }
// }

// // --- Supabase Session Handling ---

// /**
//  * Save a session to Supabase
//  * @param {string} name - session name
//  * @param {object} data - session data (Baileys auth state)
//  */
// export async function saveSession(name, data) {
//   const { error } = await supabase
//     .from('whatsapp_sessions')
//     .upsert(
//       {
//         session_name: name,
//         session_data: data,
//         updated_at: new Date(),
//       },
//       { onConflict: 'session_name' }
//     );

//   if (error) console.error('❌ Failed to save session to Supabase:', error);
//   else console.log('✅ Session saved to Supabase');
// }

// /**
//  * Load a session from Supabase and decrypt it
//  * @param {string} name - session name
//  * @returns {object|null} - session data or null
//  */
// export async function loadSession(name) {
//   const { data, error } = await supabase
//     .from('whatsapp_sessions')
//     .select('session_data')
//     .eq('session_name', name)
//     .single();

//   if (error) {
//     if (error.code !== 'PGRST116')
//       console.error('❌ Failed to load session from Supabase:', error);
//     return null;
//   }

//   const encryptedData = data?.session_data;
//   if (!encryptedData) {
//     console.error('⚠️ No session data found for:', name);
//     return null;
//   }

//   const decryptedBuffer = decryptBuffer(encryptedData);
//   if (!decryptedBuffer) return null;

//   try {
//     const sessionJSON = JSON.parse(decryptedBuffer.toString());
//     console.log('✅ Session decrypted successfully');
//     return sessionJSON;
//   } catch (err) {
//     console.error('❌ Failed to parse decrypted session JSON:', err.message);
//     return null;
//   }
// }
