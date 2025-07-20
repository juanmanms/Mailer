const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsDir = path.join(__dirname, '../../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            meta,
            pid: process.pid
        };
    }

    writeToFile(level, logMessage) {
        const filename = path.join(this.logsDir, `${level}.log`);
        const logLine = JSON.stringify(logMessage) + '\n';

        fs.appendFile(filename, logLine, (err) => {
            if (err) console.error('Failed to write to log file:', err);
        });
    }

    info(message, meta = {}) {
        const logMessage = this.formatMessage('info', message, meta);
        console.log('ℹ️', logMessage.message, meta);
        this.writeToFile('info', logMessage);
    }

    error(message, meta = {}) {
        const logMessage = this.formatMessage('error', message, meta);
        console.error('❌', logMessage.message, meta);
        this.writeToFile('error', logMessage);
    }

    warn(message, meta = {}) {
        const logMessage = this.formatMessage('warn', message, meta);
        console.warn('⚠️', logMessage.message, meta);
        this.writeToFile('warn', logMessage);
    }

    debug(message, meta = {}) {
        if (process.env.NODE_ENV !== 'production') {
            const logMessage = this.formatMessage('debug', message, meta);
            console.log('🐛', logMessage.message, meta);
            this.writeToFile('debug', logMessage);
        }
    }
}

module.exports = new Logger();