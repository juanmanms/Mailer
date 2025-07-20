const Subscriber = require('../models/subscriber');
const logger = require('../utils/logger');

// Utilidad para generar request ID único
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Mapear errores a códigos HTTP
const mapErrorToHttpStatus = (errorMessage) => {
    const errorMappings = {
        'Invalid subscriber data': { status: 422, code: 'INVALID_DATA' },
        'Rate limit exceeded': { status: 429, code: 'RATE_LIMIT' },
        'Invalid API key': { status: 401, code: 'UNAUTHORIZED' },
        'Email already exists': { status: 409, code: 'DUPLICATE_EMAIL' }
    };

    for (const [key, value] of Object.entries(errorMappings)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    return { status: 500, code: 'SERVER_ERROR' };
};

// Formatear respuesta de éxito
const formatSuccessResponse = (result, requestId) => ({
    success: true,
    message: 'Subscriber created successfully',
    requestId,
    data: {
        id: result.id,
        email: result.email,
        status: result.status,
        groups: result.groups,
        created_at: result.created_at
    }
});

// Formatear respuesta de error
const formatErrorResponse = (error, requestId, statusInfo) => ({
    success: false,
    error: error.message || 'Internal server error',
    code: statusInfo.code,
    requestId
});

exports.createSubscriber = async (req, res) => {
    const requestId = generateRequestId();

    try {
        const { email, groups } = req.body;

        logger.info('Processing subscriber creation', {
            requestId,
            email,
            groupsCount: groups?.length || 0,
            ip: req.ip
        });

        const subscriber = new Subscriber(email, groups);
        const result = await subscriber.save();

        logger.info('Subscriber created successfully', {
            requestId,
            email,
            subscriberId: result.id
        });

        res.status(201).json(formatSuccessResponse(result, requestId));

    } catch (error) {
        const statusInfo = mapErrorToHttpStatus(error.message);

        logger.error('Subscriber creation failed', {
            requestId,
            email: req.body.email,
            error: error.message,
            statusCode: statusInfo.status,
            ip: req.ip
        });

        res.status(statusInfo.status).json(
            formatErrorResponse(error, requestId, statusInfo)
        );
    }
};