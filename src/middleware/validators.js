const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        logger.warn('Validation failed', {
            ip: req.ip,
            errors: errorDetails,
            body: req.body
        });

        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errorDetails
        });
    }

    next();
};

// Validadores para subscriber
const validateSubscriber = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),

    body('groups')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Groups must be a non-empty array if provided')
        .custom((groups) => {
            if (groups && groups.some(group => typeof group !== 'string')) {
                throw new Error('All group IDs must be strings');
            }
            return true;
        }),

    handleValidationErrors
];

module.exports = {
    validateSubscriber,
    handleValidationErrors
};