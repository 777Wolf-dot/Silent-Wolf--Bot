import readline from 'readline';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import chalk from 'chalk';

class PairServer extends EventEmitter {
    constructor() {
        super();
        this.pendingPairs = new Map();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    start() {
        console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║                🤖 PAIR SERVER                  ║
║                ==============                  ║
║           Ready to generate pair codes!        ║
╚════════════════════════════════════════════════╝
`));
        this.promptForNumber();
    }

    promptForNumber() {
        this.rl.question(chalk.yellow('📱 Enter your phone number (with country code, e.g., 1234567890): '), (number) => {
            const cleanedNumber = number.trim().replace(/\D/g, '');
            
            if (!cleanedNumber || cleanedNumber.length < 10) {
                console.log(chalk.red('❌ Invalid phone number. Please try again.'));
                this.promptForNumber();
                return;
            }

            this.generatePairCode(cleanedNumber);
        });
    }

    generatePairCode(number) {
        // Generate a 6-digit code
        const pairCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes expiry

        this.pendingPairs.set(pairCode, {
            number: number,
            expiresAt: expiresAt,
            status: 'pending'
        });

        console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║                ✅ PAIR CODE GENERATED          ║
╠════════════════════════════════════════════════╣
║ 📞 Phone Number: ${chalk.cyan(number.toString().padEnd(28))}║
║ 🔑 Pair Code: ${chalk.yellow(pairCode.toString().padEnd(31))}║
║ ⏰ Expires in: ${chalk.red('10 minutes'.padEnd(30))}║
╚════════════════════════════════════════════════╝
`));

        console.log(chalk.blue('💡 Send this code to the bot on WhatsApp to connect!'));
        console.log(chalk.gray('────────────────────────────────────────────────────\n'));

        // Set timeout to remove expired codes
        setTimeout(() => {
            if (this.pendingPairs.has(pairCode)) {
                this.pendingPairs.delete(pairCode);
                console.log(chalk.red(`❌ Pair code ${pairCode} has expired.`));
            }
        }, 10 * 60 * 1000);

        this.promptForAnother();
    }

    promptForAnother() {
        this.rl.question(chalk.blue('Generate another pair code? (y/n): '), (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                console.log('');
                this.promptForNumber();
            } else {
                console.log(chalk.gray('👋 Pair server ready for connections...\n'));
            }
        });
    }

    // Method to verify pair code (to be called from your bot)
    verifyPairCode(code, fromNumber) {
        const pairData = this.pendingPairs.get(code);
        
        if (!pairData) {
            return { success: false, message: 'Invalid pair code' };
        }

        if (Date.now() > pairData.expiresAt) {
            this.pendingPairs.delete(code);
            return { success: false, message: 'Pair code has expired' };
        }

        // Check if number matches
        const cleanedFromNumber = fromNumber.replace(/\D/g, '');
        const cleanedStoredNumber = pairData.number.replace(/\D/g, '');
        
        if (cleanedFromNumber !== cleanedStoredNumber) {
            return { 
                success: false, 
                message: 'Phone number does not match the pair code' 
            };
        }

        // Mark as connected
        pairData.status = 'connected';
        pairData.connectedAt = Date.now();

        // Emit connection event
        this.emit('connection', {
            number: fromNumber,
            pairCode: code,
            timestamp: new Date()
        });

        console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║              🔗 NEW CONNECTION                 ║
╠════════════════════════════════════════════════╣
║ 📞 Number: ${chalk.cyan(fromNumber.padEnd(35))}║
║ 🔑 Code: ${chalk.yellow(code.padEnd(38))}║
║ 🕒 Time: ${chalk.green(new Date().toLocaleTimeString().padEnd(32))}║
╚════════════════════════════════════════════════╝
`));

        return { 
            success: true, 
            message: 'Successfully connected!',
            data: pairData
        };
    }

    // Method to get connection status
    getConnectionStatus(number) {
        const cleanedNumber = number.replace(/\D/g, '');
        for (const [code, data] of this.pendingPairs.entries()) {
            if (data.number.replace(/\D/g, '') === cleanedNumber) {
                return { 
                    connected: data.status === 'connected', 
                    code, 
                    data 
                };
            }
        }
        return { connected: false };
    }

    // Get all active pair codes (for admin purposes)
    getActivePairs() {
        const activePairs = [];
        const now = Date.now();
        
        for (const [code, data] of this.pendingPairs.entries()) {
            if (now < data.expiresAt) {
                activePairs.push({
                    code,
                    number: data.number,
                    status: data.status,
                    expiresIn: Math.round((data.expiresAt - now) / 1000 / 60) + ' minutes'
                });
            }
        }
        
        return activePairs;
    }

    // Remove a specific pair code
    removePairCode(code) {
        if (this.pendingPairs.has(code)) {
            this.pendingPairs.delete(code);
            return true;
        }
        return false;
    }

    // Clean up expired pairs
    cleanupExpired() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [code, data] of this.pendingPairs.entries()) {
            if (now > data.expiresAt) {
                this.pendingPairs.delete(code);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(chalk.yellow(`🧹 Cleaned up ${cleanedCount} expired pair codes.`));
        }
        
        return cleanedCount;
    }

    // Get stats
    getStats() {
        const now = Date.now();
        let pending = 0;
        let connected = 0;
        let expired = 0;
        
        for (const [code, data] of this.pendingPairs.entries()) {
            if (now > data.expiresAt) {
                expired++;
            } else if (data.status === 'connected') {
                connected++;
            } else {
                pending++;
            }
        }
        
        return {
            total: this.pendingPairs.size,
            pending,
            connected,
            expired
        };
    }

    stop() {
        this.rl.close();
        console.log(chalk.yellow('🛑 Pair server stopped.'));
    }
}

export default PairServer;