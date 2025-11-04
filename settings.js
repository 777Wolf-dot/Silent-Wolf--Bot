// settings.js

/**
 * Global Configuration Settings for WolfBot
 * * NOTE: These settings are used across different command files.
 */

// 🐺 ALPHA (OWNER) NUMBER
// The full WhatsApp number of the bot's owner (the Alpha).
// DO NOT include the '@s.whatsapp.net' suffix.
export const OWNER_NUMBER = '254788710904'; 


// 🤖 BOT IDENTITY
// The name the bot uses and how it is displayed.
export const BOT_NAME = 'WolfBot';

// The command prefix used to trigger commands (e.g., '.alpha help' or '!alpha help').
export const COMMAND_PREFIX = '.'; 


// 📝 SESSION MANAGEMENT
/* The term 'session' in WhatsApp bots often refers to the authentication data 
    (like a QR scan) that allows the bot to connect to your WhatsApp account.
    
    This is typically handled by the specific WhatsApp library you are using 
    (e.g., `whatsapp-web.js`, `baileys`) and is usually stored in a folder 
    (like `session-data/`) or an environment variable (`SESSION_ID`).

    For your current file (`wolfbot.js`), you do not need to define the session 
    here unless your library specifically requires a session ID to be passed as a variable.
    If so, you would export it like this:
    export const SESSION_ID = 'your_long_session_string';
*/

// Default export for easy access
export default {
    OWNER_NUMBER,
    BOT_NAME,
    COMMAND_PREFIX
};