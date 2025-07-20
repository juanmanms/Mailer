const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Configuración base para rate limiting
const createRateLimitConfig = (windowMs, max, identifier) => ({
    windowMs,
    max,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Handler personalizado para logging
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            identifier,
            userAgent: req.get('User-Agent')
        });

        res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(windowMs / 1000)
        });
    }
});

// Rate limiting específico para creación de subscribers
const createSubscriberLimiter = rateLimit(
    createRateLimitConfig(
        parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        'create_subscriber'
    )
);

// Rate limiting general para toda la API
const generalLimiter = rateLimit(
    createRateLimitConfig(
        15 * 60 * 1000, // 15 minutos
        1000,
        'general'
    )
);

module.exports = {
    createSubscriberLimiter,
    generalLimiter
};