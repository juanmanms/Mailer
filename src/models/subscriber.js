const MailerLite = require('@mailerlite/mailerlite-nodejs').default;
const logger = require('../utils/logger');
require('dotenv').config();

// Configuración y validación de entorno
class EnvironmentValidator {
  static validate() {
    const requiredVars = ['API_KEY'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      const error = `Missing required environment variables: ${missingVars.join(', ')}`;
      logger.error('Environment validation failed', { missingVars });
      throw new Error(error);
    }
  }
}

// Validar entorno al cargar el módulo
EnvironmentValidator.validate();

// Inicializar cliente MailerLite
const mailerlite = new MailerLite({
  api_key: process.env.API_KEY,
});

// Clase Subscriber refactorizada
class Subscriber {
  constructor(email, groups = null) {
    this.email = email;
    this.groups = this.normalizeGroups(groups);
  }

  // Normalizar grupos
  normalizeGroups(groups) {
    if (groups && Array.isArray(groups) && groups.length > 0) {
      return groups;
    }

    const defaultGroup = process.env.Group_ID_Default || '160331857972430358';
    return [defaultGroup];
  }

  // Crear parámetros para la API
  createApiParams() {
    return {
      email: this.email,
      groups: this.groups,
      status: 'active',
    };
  }

  // Manejar errores específicos de MailerLite
  handleApiError(error) {
    if (!error.response) {
      throw new Error('Failed to create subscriber');
    }

    const { status, data } = error.response;
    const errorMessages = {
      422: 'Invalid subscriber data provided',
      429: 'Rate limit exceeded. Please try again later',
      401: 'Invalid API key',
      409: 'Email already exists'
    };

    const message = errorMessages[status] || data.message || 'MailerLite API Error';
    throw new Error(message);
  }

  // Guardar subscriber
  async save() {
    const startTime = Date.now();

    try {
      logger.info('Creating subscriber via MailerLite API', {
        email: this.email,
        groupCount: this.groups.length
      });

      const params = this.createApiParams();
      const response = await mailerlite.subscribers.createOrUpdate(params);

      const duration = Date.now() - startTime;

      logger.info('Subscriber created successfully', {
        email: this.email,
        duration: `${duration}ms`,
        subscriberId: response.data.id
      });

      return response.data;

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('MailerLite API request failed', {
        email: this.email,
        duration: `${duration}ms`,
        error: error.message,
        statusCode: error.response?.status,
        apiResponse: error.response?.data
      });

      this.handleApiError(error);
    }
  }
}

module.exports = Subscriber;