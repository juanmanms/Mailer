const fs = require('fs');
const path = require('path');

// Cargar la API Key desde el archivo de configuración
const apiKeyConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/apiKey.json'), 'utf8')
);

process.env.API_KEY = process.env.API_KEY || apiKeyConfig.API_KEY;

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? ['https://yourdomain.com']
//     : true,
//   credentials: true
// }));


// Middleware de logging profesional
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
const subscribersRouter = require('./routes/subscribers');
app.use('/api/v1/subscribers', subscribersRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MailerLite API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      subscribers: '/api/v1/subscribers',
      documentation: '/api/v1/docs'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled server error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  const errorResponse = {
    success: false,
    error: 'Internal server error',
    code: 'SERVER_ERROR'
  };

  // Solo mostrar detalles en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = error.message;
  }

  res.status(500).json(errorResponse);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

