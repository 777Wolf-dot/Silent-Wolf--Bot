// File: ./commands/owner/autobio.js
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'autobio',
    alias: ['autoprofile', 'autostatus', 'bio'],
    category: 'owner',
    description: 'Automatically update WhatsApp bio with status, time, date, and weather',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager, BOT_NAME, VERSION } = extra;
        
        // Debug logging for owner verification
        console.log('\n🔍 ========= AUTOBIO COMMAND DEBUG =========');
        console.log('Chat ID:', chatId);
        console.log('From Me:', msg.key.fromMe);
        
        const senderJid = msg.key.participant || chatId;
        const cleaned = jidManager.cleanJid(senderJid);
        console.log('Sender JID:', senderJid);
        console.log('Cleaned Number:', cleaned.cleanNumber);
        console.log('Is Owner:', jidManager.isOwner(msg));
        console.log('========================================\n');
        
        // ====== AUTO BIO CONFIG FILE ======
        const BIO_CONFIG_FILE = './autobio_config.json';
        
        // Default config
        const defaultConfig = {
            enabled: false,
            interval: 5, // minutes
            format: 'default',
            lastUpdate: null,
            nextUpdate: null,
            updateCount: 0,
            created: new Date().toISOString(),
            weather: {
                enabled: false,
                city: 'Nairobi',
                country: 'KE',
                apiKey: '',
                lastFetch: null
            },
            customTemplates: []
        };
        
        // Load or create config
        let config = defaultConfig;
        if (existsSync(BIO_CONFIG_FILE)) {
            try {
                config = JSON.parse(readFileSync(BIO_CONFIG_FILE, 'utf8'));
                // Merge with defaults for any missing fields
                config = { ...defaultConfig, ...config };
            } catch (error) {
                config = defaultConfig;
            }
        }
        
        // ====== WEATHER FUNCTIONS ======
        async function getWeather(city = 'Nairobi', country = 'KE') {
            try {
                // Using OpenWeatherMap API
                const apiKey = config.weather.apiKey || process.env.WEATHER_API_KEY;
                if (!apiKey) {
                    return null; // No API key configured
                }
                
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${apiKey}`
                );
                
                if (!response.ok) {
                    console.log('Weather API error:', await response.text());
                    return null;
                }
                
                const data = await response.json();
                return {
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    city: data.name,
                    icon: getWeatherIcon(data.weather[0].main),
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.log('Weather fetch error:', error.message);
                return null;
            }
        }
        
        function getWeatherIcon(condition) {
            const icons = {
                'Clear': '☀️',
                'Clouds': '☁️',
                'Rain': '🌧️',
                'Drizzle': '🌦️',
                'Thunderstorm': '⛈️',
                'Snow': '❄️',
                'Mist': '🌫️',
                'Smoke': '💨',
                'Haze': '🌫️',
                'Fog': '🌫️'
            };
            return icons[condition] || '🌡️';
        }
        
        // ====== BIO TEMPLATES ======
        const templates = {
            'default': () => {
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const date = now.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                });
                return `🐺 ${BOT_NAME} is online | ⌚ ${time} | 📅 ${date}`;
            },
            
            'detailed': async () => {
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
                const date = now.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric' 
                });
                
                let weatherText = '';
                if (config.weather.enabled && config.weather.apiKey) {
                    const weather = await getWeather(config.weather.city, config.weather.country);
                    if (weather) {
                        weatherText = ` | ${weather.icon} ${weather.temp}°C`;
                    }
                }
                
                return `🤖 ${BOT_NAME} v${VERSION} | ⏰ ${time} | 📅 ${date}${weatherText} | 🔄 Online`;
            },
            
            'minimal': () => {
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `🐺 Online | ${time}`;
            },
            
            'wolf-style': async () => {
                const now = new Date();
                const hours = now.getHours();
                let timeOfDay = '🕛';
                if (hours >= 5 && hours < 12) timeOfDay = '🌅';
                else if (hours >= 12 && hours < 17) timeOfDay = '☀️';
                else if (hours >= 17 && hours < 20) timeOfDay = '🌇';
                else timeOfDay = '🌙';
                
                const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                let weatherEmoji = '';
                if (config.weather.enabled && config.weather.apiKey) {
                    const weather = await getWeather(config.weather.city, config.weather.country);
                    if (weather) {
                        weatherEmoji = ` | ${weather.icon}`;
                    }
                }
                
                return `🐺 Silent Wolf | ${timeOfDay} ${time} | 📅 ${date}${weatherEmoji} | ⚡ v${VERSION}`;
            },
            
            'professional': async () => {
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
                });
                const date = now.toISOString().split('T')[0];
                
                let weatherInfo = '';
                if (config.weather.enabled && config.weather.apiKey) {
                    const weather = await getWeather(config.weather.city, config.weather.country);
                    if (weather) {
                        weatherInfo = ` | 🌡️ ${weather.temp}°C (${weather.description})`;
                    }
                }
                
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                
                return `🤖 ${BOT_NAME} | 🕒 ${time} UTC | 📅 ${date} | ⏱️ Uptime: ${hours}h ${minutes}m${weatherInfo}`;
            }
        };
        
        // ====== BIO UPDATE FUNCTION ======
        async function updateBio() {
            try {
                let bioText = '';
                
                // Use custom template if provided
                if (config.customTemplates.length > 0 && config.format === 'custom') {
                    const template = config.customTemplates[0];
                    bioText = template.text.replace(/{time}/g, new Date().toLocaleTimeString())
                                           .replace(/{date}/g, new Date().toLocaleDateString())
                                           .replace(/{botName}/g, BOT_NAME)
                                           .replace(/{version}/g, VERSION);
                } else {
                    // Use predefined template
                    const template = templates[config.format] || templates.default;
                    bioText = await template();
                }
                
                // Ensure bio doesn't exceed WhatsApp limit (139 characters)
                if (bioText.length > 139) {
                    bioText = bioText.substring(0, 136) + '...';
                }
                
                // Update WhatsApp bio
                await sock.updateProfileStatus(bioText);
                
                // Update config
                config.lastUpdate = new Date().toISOString();
                config.nextUpdate = new Date(Date.now() + config.interval * 60000).toISOString();
                config.updateCount++;
                
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                console.log(`✅ Bio updated: "${bioText}"`);
                return { success: true, bio: bioText };
                
            } catch (error) {
                console.log('❌ Bio update error:', error.message);
                return { success: false, error: error.message };
            }
        }
        
        // ====== COMMAND HANDLING ======
        const command = args[0]?.toLowerCase();
        
        // Show current status if no command
        if (!command) {
            let statusMessage = `🤖 *AUTO BIO SYSTEM*\n\n`;
            
            statusMessage += `📊 *Current Status:* ${config.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n`;
            if (config.enabled) {
                statusMessage += `⏰ *Interval:* Every ${config.interval} minutes\n`;
                statusMessage += `📝 *Format:* ${config.format}\n`;
                statusMessage += `🔄 *Last Update:* ${config.lastUpdate ? new Date(config.lastUpdate).toLocaleString() : 'Never'}\n`;
                statusMessage += `📈 *Total Updates:* ${config.updateCount}\n`;
            }
            
            if (config.weather.enabled) {
                statusMessage += `\n🌤️ *Weather:* ✅ ENABLED\n`;
                statusMessage += `📍 *Location:* ${config.weather.city}, ${config.weather.country}\n`;
                statusMessage += `🔑 *API Key:* ${config.weather.apiKey ? '✅ Set' : '❌ Not set'}\n`;
            } else {
                statusMessage += `\n🌤️ *Weather:* ❌ DISABLED\n`;
            }
            
            statusMessage += `\n📋 *Available Formats:*\n`;
            Object.keys(templates).forEach(format => {
                statusMessage += `├─ *${format}* - ${format === 'default' ? '(Default)' : ''}\n`;
            });
            statusMessage += `└─ *custom* - Use custom template\n`;
            
            statusMessage += `\n⚡ *Usage:*\n`;
            statusMessage += `├─ ${PREFIX}autobio on - Enable auto bio\n`;
            statusMessage += `├─ ${PREFIX}autobio off - Disable auto bio\n`;
            statusMessage += `├─ ${PREFIX}autobio interval 10 - Set interval (minutes)\n`;
            statusMessage += `├─ ${PREFIX}autobio format detailed - Change format\n`;
            statusMessage += `├─ ${PREFIX}autobio test - Test bio update\n`;
            statusMessage += `├─ ${PREFIX}autobio weather Nairobi KE - Enable weather\n`;
            statusMessage += `└─ ${PREFIX}autobio weather off - Disable weather`;
            
            return sock.sendMessage(chatId, {
                text: statusMessage
            }, { quoted: msg });
        }
        
        // ====== COMMAND PROCESSING ======
        switch (command) {
            case 'on':
            case 'enable':
            case 'start':
                config.enabled = true;
                config.lastUpdate = null;
                config.nextUpdate = null;
                
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                // Start the interval
                clearInterval(global.BIO_INTERVAL);
                global.BIO_INTERVAL = setInterval(async () => {
                    if (config.enabled) {
                        await updateBio();
                    }
                }, config.interval * 60000);
                
                // Do immediate update
                const result = await updateBio();
                
                let response = `✅ *Auto Bio ENABLED*\n\n`;
                response += `⏰ *Interval:* Every ${config.interval} minutes\n`;
                response += `📝 *Format:* ${config.format}\n`;
                response += `🔄 *Next update:* In ${config.interval} minutes\n\n`;
                
                if (result.success) {
                    response += `📄 *Current Bio:*\n\`\`\`${result.bio}\`\`\`\n\n`;
                }
                
                if (config.weather.enabled) {
                    response += `🌤️ *Weather updates:* ✅ ENABLED\n`;
                }
                
                response += `⚡ Bio will update automatically every ${config.interval} minutes.`;
                
                await sock.sendMessage(chatId, {
                    text: response
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
            case 'stop':
                config.enabled = false;
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                // Clear interval
                clearInterval(global.BIO_INTERVAL);
                global.BIO_INTERVAL = null;
                
                await sock.sendMessage(chatId, {
                    text: `✅ *Auto Bio DISABLED*\n\nBio will no longer update automatically.\n\nUse \`${PREFIX}autobio on\` to enable again.`
                }, { quoted: msg });
                break;
                
            case 'test':
            case 'update':
                const testResult = await updateBio();
                
                if (testResult.success) {
                    await sock.sendMessage(chatId, {
                        text: `✅ *Bio Updated Successfully!*\n\n📄 *New Bio:*\n\`\`\`${testResult.bio}\`\`\`\n\n📊 *Update Count:* ${config.updateCount}\n🕒 *Last Update:* ${new Date().toLocaleTimeString()}`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ *Bio Update Failed*\n\nError: ${testResult.error}\n\nCheck console for details.`
                    }, { quoted: msg });
                }
                break;
                
            case 'interval':
                const interval = parseInt(args[1]);
                if (!interval || interval < 1 || interval > 1440) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Invalid Interval*\n\nPlease specify a number between 1 and 1440 (24 hours).\n\nExample: ${PREFIX}autobio interval 10`
                    }, { quoted: msg });
                }
                
                config.interval = interval;
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                // Restart interval if enabled
                if (config.enabled) {
                    clearInterval(global.BIO_INTERVAL);
                    global.BIO_INTERVAL = setInterval(async () => {
                        if (config.enabled) {
                            await updateBio();
                        }
                    }, config.interval * 60000);
                }
                
                await sock.sendMessage(chatId, {
                    text: `✅ *Update Interval Changed*\n\n⏰ New interval: Every ${interval} minutes\n\n${config.enabled ? 'Interval restarted with new timing.' : 'Enable auto bio for changes to take effect.'}`
                }, { quoted: msg });
                break;
                
            case 'format':
                const format = args[1]?.toLowerCase();
                if (!format || (!templates[format] && format !== 'custom')) {
                    const formats = Object.keys(templates).join(', ');
                    return sock.sendMessage(chatId, {
                        text: `❌ *Invalid Format*\n\nAvailable formats: ${formats}, custom\n\nExample: ${PREFIX}autobio format detailed`
                    }, { quoted: msg });
                }
                
                config.format = format;
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                // Test the new format
                const formatTest = await updateBio();
                
                let formatMsg = `✅ *Bio Format Changed*\n\n📝 New format: *${format}*\n\n`;
                if (formatTest.success) {
                    formatMsg += `📄 *Preview:*\n\`\`\`${formatTest.bio}\`\`\`\n\n`;
                }
                formatMsg += `Changes applied immediately.`;
                
                await sock.sendMessage(chatId, {
                    text: formatMsg
                }, { quoted: msg });
                break;
                
            case 'weather':
                const subCommand = args[1]?.toLowerCase();
                
                if (!subCommand || subCommand === 'off') {
                    config.weather.enabled = false;
                    writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ *Weather Updates DISABLED*\n\nWeather information will no longer be included in the bio.`
                    }, { quoted: msg });
                    break;
                }
                
                if (subCommand === 'setkey') {
                    const apiKey = args[2];
                    if (!apiKey) {
                        return sock.sendMessage(chatId, {
                            text: `❌ *API Key Required*\n\nUsage: ${PREFIX}autobio weather setkey YOUR_API_KEY\n\nGet a free API key from: openweathermap.org/api`
                        }, { quoted: msg });
                    }
                    
                    config.weather.apiKey = apiKey;
                    config.weather.enabled = true;
                    writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                    
                    // Test weather fetch
                    const weather = await getWeather(config.weather.city, config.weather.country);
                    
                    let weatherMsg = `✅ *Weather API Key Set*\n\n`;
                    if (weather) {
                        weatherMsg += `🌤️ *Test Successful!*\n`;
                        weatherMsg += `📍 ${weather.city}: ${weather.icon} ${weather.temp}°C\n`;
                        weatherMsg += `📝 ${weather.description}\n`;
                        weatherMsg += `💧 Humidity: ${weather.humidity}%\n\n`;
                    }
                    weatherMsg += `Weather updates are now enabled.`;
                    
                    await sock.sendMessage(chatId, {
                        text: weatherMsg
                    }, { quoted: msg });
                    break;
                }
                
                // Enable weather with location
                const city = args[1];
                const country = args[2] || 'KE';
                
                if (!city) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *City Required*\n\nUsage: ${PREFIX}autobio weather <city> [country]\nExample: ${PREFIX}autobio weather Nairobi KE`
                    }, { quoted: msg });
                }
                
                config.weather.enabled = true;
                config.weather.city = city;
                config.weather.country = country;
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                // Test weather fetch
                const locationWeather = await getWeather(city, country);
                
                let locationMsg = `✅ *Weather Updates ENABLED*\n\n`;
                locationMsg += `📍 *Location:* ${city}, ${country}\n`;
                
                if (locationWeather) {
                    locationMsg += `🌤️ *Current Weather:*\n`;
                    locationMsg += `├─ ${locationWeather.icon} ${locationWeather.temp}°C\n`;
                    locationMsg += `├─ Feels like: ${locationWeather.feels_like}°C\n`;
                    locationMsg += `├─ ${locationWeather.description}\n`;
                    locationMsg += `└─ Humidity: ${locationWeather.humidity}%\n\n`;
                } else {
                    locationMsg += `⚠️ *Weather fetch failed*\n`;
                    locationMsg += `Set an API key: ${PREFIX}autobio weather setkey YOUR_API_KEY\n\n`;
                }
                
                locationMsg += `Weather will be included in your bio updates.`;
                
                await sock.sendMessage(chatId, {
                    text: locationMsg
                }, { quoted: msg });
                break;
                
            case 'custom':
                const customText = args.slice(1).join(' ');
                if (!customText) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Custom Template Required*\n\nUsage: ${PREFIX}autobio custom "Your bio with {time}, {date}, {botName}, {version}"\n\nVariables: {time}, {date}, {botName}, {version}`
                    }, { quoted: msg });
                }
                
                config.format = 'custom';
                config.customTemplates = [{
                    text: customText,
                    created: new Date().toISOString()
                }];
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
                // Test the custom template
                const customResult = await updateBio();
                
                let customMsg = `✅ *Custom Template Set*\n\n`;
                customMsg += `📝 *Template:*\n\`\`\`${customText}\`\`\`\n\n`;
                
                if (customResult.success) {
                    customMsg += `📄 *Generated Bio:*\n\`\`\`${customResult.bio}\`\`\`\n\n`;
                }
                
                customMsg += `Variables: {time}, {date}, {botName}, {version}\n`;
                customMsg += `Template saved and will be used for all future updates.`;
                
                await sock.sendMessage(chatId, {
                    text: customMsg
                }, { quoted: msg });
                break;
                
            case 'reset':
                config = defaultConfig;
                writeFileSync(BIO_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
                
                clearInterval(global.BIO_INTERVAL);
                global.BIO_INTERVAL = null;
                
                await sock.sendMessage(chatId, {
                    text: `✅ *Auto Bio RESET*\n\nAll settings have been reset to default values.\n\nAuto bio is now disabled.`
                }, { quoted: msg });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: `❌ *Unknown Command*\n\nUse \`${PREFIX}autobio\` without arguments to see all options.\n\nExample: ${PREFIX}autobio on`
                }, { quoted: msg });
        }
    }
};


















// // File: ./commands/owner/autobio.js
// import { writeFileSync, readFileSync, existsSync } from 'fs';

// export default {
//     name: 'autobio',
//     alias: ['autoprofile', 'autostatus', 'bio'],
//     category: 'owner',
//     description: 'Automatically update WhatsApp bio with status, time, date, and weather',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
//         const { jidManager, BOT_NAME, VERSION } = extra;
        
//         // Debug logging
//         console.log('\n🔍 ========= AUTOBIO COMMAND DEBUG =========');
//         console.log('Chat ID:', chatId);
//         console.log('From Me:', msg.key.fromMe);
        
//         const senderJid = msg.key.participant || chatId;
//         const cleaned = jidManager.cleanJid(senderJid);
//         console.log('Sender JID:', senderJid);
//         console.log('Is Owner:', jidManager.isOwner(msg));
//         console.log('========================================\n');
        
//         // ====== AUTO BIO CONFIG FILE ======
//         const BIO_CONFIG_FILE = './autobio_config.json';
        
//         // Default config
//         const defaultConfig = {
//             enabled: false,
//             interval: 5, // minutes
//             format: 'default',
//             lastUpdate: null,
//             nextUpdate: null,
//             updateCount: 0,
//             created: new Date().toISOString(),
//             weather: {
//                 enabled: false,
//                 city: 'Nairobi',
//                 country: 'KE',
//                 apiKey: '',
//                 lastFetch: null
//             },
//             customTemplates: []
//         };
        
//         // Load or create config
//         let config = defaultConfig;
//         if (existsSync(BIO_CONFIG_FILE)) {
//             try {
//                 config = JSON.parse(readFileSync(BIO_CONFIG_FILE, 'utf8'));
//                 // Merge with defaults for any missing fields
//                 config = { ...defaultConfig, ...config };
//             } catch (error) {
//                 config = defaultConfig;
//             }
//         }
        
//         // ====== BIO TEMPLATES ======
//         const templates = {
//             'default': () => {
//                 const now = new Date();
//                 const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//                 const date = now.toLocaleDateString('en-US', { 
//                     weekday: 'short', 
//                     month: 'short', 
//                     day: 'numeric' 
//                 });
//                 return `🐺 ${BOT_NAME} is online | ⌚ ${time} | 📅 ${date}`;
//             },
            
//             'detailed': async () => {
//                 const now = new Date();
//                 const time = now.toLocaleTimeString('en-US', { 
//                     hour: '2-digit', 
//                     minute: '2-digit',
//                     hour12: true 
//                 });
//                 const date = now.toLocaleDateString('en-US', { 
//                     weekday: 'long', 
//                     year: 'numeric',
//                     month: 'long', 
//                     day: 'numeric' 
//                 });
                
//                 return `🤖 ${BOT_NAME} v${VERSION} | ⏰ ${time} | 📅 ${date} | 🔄 Online`;
//             },
            
//             'minimal': () => {
//                 const now = new Date();
//                 const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//                 return `🐺 Online | ${time}`;
//             },
            
//             'wolf-style': async () => {
//                 const now = new Date();
//                 const hours = now.getHours();
//                 let timeOfDay = '🕛';
//                 if (hours >= 5 && hours < 12) timeOfDay = '🌅';
//                 else if (hours >= 12 && hours < 17) timeOfDay = '☀️';
//                 else if (hours >= 17 && hours < 20) timeOfDay = '🌇';
//                 else timeOfDay = '🌙';
                
//                 const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//                 const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
//                 return `🐺 ${BOT_NAME} | ${timeOfDay} ${time} | 📅 ${date} | ⚡ v${VERSION}`;
//             },
            
//             'professional': async () => {
//                 const now = new Date();
//                 const time = now.toLocaleTimeString('en-US', { 
//                     hour: '2-digit', 
//                     minute: '2-digit',
//                     second: '2-digit',
//                     hour12: false 
//                 });
//                 const date = now.toISOString().split('T')[0];
                
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
                
//                 return `🤖 ${BOT_NAME} | 🕒 ${time} | 📅 ${date} | ⏱️ ${hours}h ${minutes}m | v${VERSION}`;
//             },
            
//             'kenya-style': () => {
//                 const now = new Date();
//                 const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//                 const date = now.toLocaleDateString('en-US', { 
//                     weekday: 'short', 
//                     month: 'short', 
//                     day: 'numeric',
//                     year: 'numeric'
//                 });
//                 return `🇰🇪 ${BOT_NAME} | ⏰ ${time} EAT | 📅 ${date} | 🐺 Online`;
//             }
//         };
        
//         // ====== BIO UPDATE FUNCTION ======
//         async function updateBio() {
//             try {
//                 let bioText = '';
                
//                 // Use custom template if provided
//                 if (config.customTemplates.length > 0 && config.format === 'custom') {
//                     const template = config.customTemplates[0];
//                     const now = new Date();
//                     bioText = template.text
//                         .replace(/{time}/g, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
//                         .replace(/{date}/g, now.toLocaleDateString('en-US', { 
//                             weekday: 'short', 
//                             month: 'short', 
//                             day: 'numeric' 
//                         }))
//                         .replace(/{botName}/g, BOT_NAME)
//                         .replace(/{version}/g, VERSION)
//                         .replace(/{uptime}/g, () => {
//                             const uptime = process.uptime();
//                             const hours = Math.floor(uptime / 3600);
//                             const minutes = Math.floor((uptime % 3600) / 60);
//                             return `${hours}h ${minutes}m`;
//                         });
//                 } else {
//                     // Use predefined template
//                     const template = templates[config.format] || templates.default;
//                     bioText = await template();
//                 }
                
//                 // Ensure bio doesn't exceed WhatsApp limit (139 characters)
//                 if (bioText.length > 139) {
//                     bioText = bioText.substring(0, 136) + '...';
//                 }
                
//                 // ====== IMPORTANT FIX: Use correct method to update bio ======
//                 console.log(`📝 Attempting to update bio: "${bioText}"`);
                
//                 // Method 1: Try updateProfile (most common)
//                 try {
//                     await sock.updateProfile(BOT_NAME, bioText);
//                     console.log('✅ Bio updated via updateProfile()');
//                 } catch (error) {
//                     console.log('⚠️ updateProfile() failed:', error.message);
                    
//                     // Method 2: Try updateProfilePicture with status (alternative)
//                     try {
//                         // Update profile with name and about
//                         await sock.updateProfile(BOT_NAME, bioText);
//                         console.log('✅ Bio updated via alternative method');
//                     } catch (error2) {
//                         console.log('❌ All update methods failed:', error2.message);
                        
//                         // Method 3: Try direct WA Web API
//                         try {
//                             const updateQuery = {
//                                 tag: 'iq',
//                                 attrs: {
//                                     to: '@s.whatsapp.net',
//                                     type: 'set',
//                                     xmlns: 'status'
//                                 },
//                                 content: [{
//                                     tag: 'status',
//                                     attrs: {},
//                                     content: Buffer.from(bioText, 'utf-8')
//                                 }]
//                             };
                            
//                             await sock.query(updateQuery);
//                             console.log('✅ Bio updated via direct WA Web API');
//                         } catch (error3) {
//                             console.log('❌ Direct API also failed:', error3.message);
//                             throw new Error('All bio update methods failed');
//                         }
//                     }
//                 }
                
//                 // Update config
//                 config.lastUpdate = new Date().toISOString();
//                 config.nextUpdate = new Date(Date.now() + config.interval * 60000).toISOString();
//                 config.updateCount++;
                
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
//                 console.log(`✅ Bio update successful: "${bioText}"`);
//                 return { success: true, bio: bioText };
                
//             } catch (error) {
//                 console.log('❌ Bio update error:', error.message);
//                 return { success: false, error: error.message };
//             }
//         }
        
//         // ====== COMMAND HANDLING ======
//         const command = args[0]?.toLowerCase();
        
//         // Show current status if no command
//         if (!command) {
//             let statusMessage = `🤖 *AUTO BIO SYSTEM*\n\n`;
            
//             statusMessage += `📊 *Current Status:* ${config.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n`;
//             if (config.enabled) {
//                 statusMessage += `⏰ *Interval:* Every ${config.interval} minutes\n`;
//                 statusMessage += `📝 *Format:* ${config.format}\n`;
//                 statusMessage += `🔄 *Last Update:* ${config.lastUpdate ? new Date(config.lastUpdate).toLocaleString() : 'Never'}\n`;
//                 statusMessage += `📈 *Total Updates:* ${config.updateCount}\n`;
//             }
            
//             statusMessage += `\n📋 *Available Formats:*\n`;
//             Object.keys(templates).forEach(format => {
//                 statusMessage += `├─ *${format}* ${format === 'default' ? '(Default)' : ''}\n`;
//             });
//             statusMessage += `└─ *custom* - Use custom template\n`;
            
//             statusMessage += `\n⚡ *Usage:*\n`;
//             statusMessage += `├─ ${PREFIX}autobio on - Enable auto bio\n`;
//             statusMessage += `├─ ${PREFIX}autobio off - Disable auto bio\n`;
//             statusMessage += `├─ ${PREFIX}autobio interval 10 - Set interval (minutes)\n`;
//             statusMessage += `├─ ${PREFIX}autobio format detailed - Change format\n`;
//             statusMessage += `└─ ${PREFIX}autobio test - Test bio update\n`;
//             statusMessage += `└─ ${PREFIX}autobio custom "text" - Set custom template`;
            
//             return sock.sendMessage(chatId, {
//                 text: statusMessage
//             }, { quoted: msg });
//         }
        
//         // ====== COMMAND PROCESSING ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
//                 config.enabled = true;
//                 config.lastUpdate = null;
//                 config.nextUpdate = null;
                
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
//                 // Start the interval
//                 clearInterval(global.BIO_INTERVAL);
//                 global.BIO_INTERVAL = setInterval(async () => {
//                     if (config.enabled) {
//                         await updateBio();
//                     }
//                 }, config.interval * 60000);
                
//                 // Do immediate update
//                 const result = await updateBio();
                
//                 let response = `✅ *Auto Bio ENABLED*\n\n`;
//                 response += `⏰ *Interval:* Every ${config.interval} minutes\n`;
//                 response += `📝 *Format:* ${config.format}\n`;
//                 response += `🔄 *Next update:* In ${config.interval} minutes\n\n`;
                
//                 if (result.success) {
//                     response += `📄 *Current Bio:*\n\`\`\`${result.bio}\`\`\`\n\n`;
//                     response += `✅ Bio updated successfully!\n`;
//                 } else {
//                     response += `⚠️ *Bio update failed:* ${result.error}\n`;
//                     response += `Check console for more details.\n\n`;
//                 }
                
//                 response += `⚡ Bio will update automatically every ${config.interval} minutes.`;
                
//                 await sock.sendMessage(chatId, {
//                     text: response
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//             case 'disable':
//             case 'stop':
//                 config.enabled = false;
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
//                 // Clear interval
//                 clearInterval(global.BIO_INTERVAL);
//                 global.BIO_INTERVAL = null;
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *Auto Bio DISABLED*\n\nBio will no longer update automatically.\n\nUse \`${PREFIX}autobio on\` to enable again.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'test':
//             case 'update':
//                 console.log('\n🔧 TESTING BIO UPDATE...');
//                 const testResult = await updateBio();
                
//                 if (testResult.success) {
//                     await sock.sendMessage(chatId, {
//                         text: `✅ *Bio Updated Successfully!*\n\n📄 *New Bio:*\n\`\`\`${testResult.bio}\`\`\`\n\n📊 *Update Count:* ${config.updateCount}\n🕒 *Last Update:* ${new Date().toLocaleTimeString()}\n\n✅ Check your WhatsApp profile to see the change!`
//                     }, { quoted: msg });
                    
//                     // Also send a preview
//                     await sock.sendMessage(chatId, {
//                         text: `👁️ *Bio Preview:*\n\n${testResult.bio}\n\n📏 Length: ${testResult.bio.length} characters`
//                     });
//                 } else {
//                     await sock.sendMessage(chatId, {
//                         text: `❌ *Bio Update Failed*\n\nError: ${testResult.error}\n\n⚠️ Please check:\n1. Bot connection status\n2. Console for detailed error\n3. Try different format`
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'interval':
//                 const interval = parseInt(args[1]);
//                 if (!interval || interval < 1 || interval > 1440) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Invalid Interval*\n\nPlease specify a number between 1 and 1440 (24 hours).\n\nExample: ${PREFIX}autobio interval 10`
//                     }, { quoted: msg });
//                 }
                
//                 config.interval = interval;
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
//                 // Restart interval if enabled
//                 if (config.enabled) {
//                     clearInterval(global.BIO_INTERVAL);
//                     global.BIO_INTERVAL = setInterval(async () => {
//                         if (config.enabled) {
//                             await updateBio();
//                         }
//                     }, config.interval * 60000);
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *Update Interval Changed*\n\n⏰ New interval: Every ${interval} minutes\n\n${config.enabled ? 'Interval restarted with new timing.' : 'Enable auto bio for changes to take effect.'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'format':
//                 const format = args[1]?.toLowerCase();
//                 if (!format || (!templates[format] && format !== 'custom')) {
//                     const formats = Object.keys(templates).join(', ');
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Invalid Format*\n\nAvailable formats: ${formats}, custom\n\nExample: ${PREFIX}autobio format detailed`
//                     }, { quoted: msg });
//                 }
                
//                 config.format = format;
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
//                 // Test the new format
//                 const formatTest = await updateBio();
                
//                 let formatMsg = `✅ *Bio Format Changed*\n\n📝 New format: *${format}*\n\n`;
//                 if (formatTest.success) {
//                     formatMsg += `📄 *Preview:*\n\`\`\`${formatTest.bio}\`\`\`\n\n`;
//                     formatMsg += `✅ Bio updated successfully!\n`;
//                 } else {
//                     formatMsg += `⚠️ *Update failed:* ${formatTest.error}\n`;
//                 }
//                 formatMsg += `Changes applied immediately.`;
                
//                 await sock.sendMessage(chatId, {
//                     text: formatMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'custom':
//                 const customText = args.slice(1).join(' ');
//                 if (!customText) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Custom Template Required*\n\nUsage: ${PREFIX}autobio custom "Your bio with {time}, {date}, {botName}, {version}, {uptime}"\n\nAvailable variables:\n• {time} - Current time\n• {date} - Current date\n• {botName} - Bot name\n• {version} - Bot version\n• {uptime} - Bot uptime`
//                     }, { quoted: msg });
//                 }
                
//                 config.format = 'custom';
//                 config.customTemplates = [{
//                     text: customText,
//                     created: new Date().toISOString()
//                 }];
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(config, null, 2));
                
//                 // Test the custom template
//                 const customResult = await updateBio();
                
//                 let customMsg = `✅ *Custom Template Set*\n\n`;
//                 customMsg += `📝 *Template:*\n\`\`\`${customText}\`\`\`\n\n`;
                
//                 if (customResult.success) {
//                     customMsg += `📄 *Generated Bio:*\n\`\`\`${customResult.bio}\`\`\`\n\n`;
//                     customMsg += `✅ Bio updated successfully!\n\n`;
//                 }
                
//                 customMsg += `Variables: {time}, {date}, {botName}, {version}, {uptime}\n`;
//                 customMsg += `Template saved and will be used for all future updates.`;
                
//                 await sock.sendMessage(chatId, {
//                     text: customMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'preview':
//                 // Preview without actually updating
//                 let previewText = '';
//                 const previewFormat = args[1]?.toLowerCase() || config.format;
                
//                 if (previewFormat === 'custom' && config.customTemplates.length > 0) {
//                     const template = config.customTemplates[0];
//                     const now = new Date();
//                     previewText = template.text
//                         .replace(/{time}/g, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
//                         .replace(/{date}/g, now.toLocaleDateString('en-US', { 
//                             weekday: 'short', 
//                             month: 'short', 
//                             day: 'numeric' 
//                         }))
//                         .replace(/{botName}/g, BOT_NAME)
//                         .replace(/{version}/g, VERSION)
//                         .replace(/{uptime}/g, () => {
//                             const uptime = process.uptime();
//                             const hours = Math.floor(uptime / 3600);
//                             const minutes = Math.floor((uptime % 3600) / 60);
//                             return `${hours}h ${minutes}m`;
//                         });
//                 } else if (templates[previewFormat]) {
//                     previewText = await templates[previewFormat]();
//                 } else {
//                     previewText = await templates.default();
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: `👁️ *Bio Preview (${previewFormat}):*\n\n\`\`\`${previewText}\`\`\`\n\n📏 Length: ${previewText.length}/139 characters\n\nUse \`${PREFIX}autobio test\` to apply this bio.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'reset':
//                 config = defaultConfig;
//                 writeFileSync(BIO_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
                
//                 clearInterval(global.BIO_INTERVAL);
//                 global.BIO_INTERVAL = null;
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *Auto Bio RESET*\n\nAll settings have been reset to default values.\n\nAuto bio is now disabled.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'debug':
//                 // Debug command to test update methods
//                 console.log('\n🔧 DEBUGGING BIO UPDATE METHODS...');
//                 let debugMsg = `🔧 *Bio Update Debug*\n\n`;
                
//                 try {
//                     // Test method 1
//                     debugMsg += `1. Testing updateProfile()...\n`;
//                     await sock.updateProfile(BOT_NAME, `Test Bio ${Date.now()}`);
//                     debugMsg += `   ✅ Success\n\n`;
                    
//                     // Small delay
//                     await new Promise(resolve => setTimeout(resolve, 1000));
                    
//                     // Test method 2 - try with just about
//                     debugMsg += `2. Testing with empty name...\n`;
//                     await sock.updateProfile('', `🐺 ${BOT_NAME} Test`);
//                     debugMsg += `   ✅ Success\n\n`;
                    
//                     // Test final bio
//                     debugMsg += `3. Setting final test bio...\n`;
//                     const testBio = `🐺 ${BOT_NAME} is online | Test`;
//                     await sock.updateProfile(BOT_NAME, testBio);
//                     debugMsg += `   ✅ Final bio set: "${testBio}"\n\n`;
                    
//                     debugMsg += `✅ All update methods working!\n`;
//                     debugMsg += `Now try: ${PREFIX}autobio test`;
                    
//                 } catch (error) {
//                     debugMsg += `❌ Debug failed: ${error.message}\n\n`;
//                     debugMsg += `⚠️ The bot may not have permission to update profile.\n`;
//                     debugMsg += `Check if this is a business account or try different phone.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: debugMsg
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 await sock.sendMessage(chatId, {
//                     text: `❌ *Unknown Command*\n\nUse \`${PREFIX}autobio\` without arguments to see all options.\n\nQuick test: ${PREFIX}autobio test`
//                 }, { quoted: msg });
//         }
//     }
// };