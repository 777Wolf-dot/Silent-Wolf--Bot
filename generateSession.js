import fs from 'fs';

const credsPath = './auth/creds.json'; // path to your creds.json
const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
const sessionBase64 = Buffer.from(JSON.stringify(creds)).toString('base64');

console.log('🟢 Copy this SESSION_BASE64 for your .env file:\n');
console.log(sessionBase64);
