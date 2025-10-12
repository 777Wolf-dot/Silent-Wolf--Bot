import fetch from 'node-fetch';

const apiKey = 'e5e511480d4d90968425acc9c31ea02a'; // Replace with your API key

export default {
  name: 'weather',
  alias: ['forecast'],
  description: '🌦️ Get weather updates for any city',
  category: 'utility',
  usage: '.weather <city name>',

  async execute(sock, m, args, from, isGroup, sender) {
    if (!args.length) {
      return sock.sendMessage(
        typeof from === 'string' ? from : m.key.remoteJid,
        { text: '❌ Please provide a city name.\nExample: `.weather Rongo`' },
        { quoted: m }
      );
    }

    const city = args.join(' ');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        return sock.sendMessage(
          typeof from === 'string' ? from : m.key.remoteJid,
          { text: `❌ Could not find weather for "${city}".` },
          { quoted: m }
        );
      }

      const weatherText = `🌍 Weather for *${data.name}, ${data.sys.country}*:
🌡 Temperature: ${data.main.temp}°C
💧 Humidity: ${data.main.humidity}%
🌬 Wind: ${data.wind.speed} m/s
⛅ Description: ${data.weather[0].description}`;

      // ✅ Ensure 'from' is a string
      const jid = typeof from === 'string' ? from : m.key.remoteJid;
      if (typeof jid !== 'string') {
        console.error('Invalid JID:', jid);
        return;
      }

      await sock.sendMessage(jid, { text: weatherText }, { quoted: m });

    } catch (err) {
      console.error('[Weather Error]', err);
      const jid = typeof from === 'string' ? from : m.key.remoteJid;
      if (typeof jid === 'string') {
        sock.sendMessage(jid, { text: '❌ Failed to fetch weather. Please try again later.' }, { quoted: m });
      }
    }
  }
}
