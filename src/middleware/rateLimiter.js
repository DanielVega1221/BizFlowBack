const rateLimit = require('express-rate-limit');

// Rate limiter general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requests por IP (aumentado para desarrollo)
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter más permisivo para login y registro
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos (aumentado de 5)
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor intente más tarde.'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para APIs
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto (aumentado de 30)
  message: {
    success: false,
    error: 'Límite de solicitudes excedido. Por favor espere un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter
};
