// Middleware simple de protección CSRF para APIs REST
const crypto = require('crypto');

// Almacenamiento temporal de tokens (en producción usar Redis)
const csrfTokens = new Map();

// Generar token CSRF
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware para generar y enviar token
const csrfTokenGenerator = (req, res, next) => {
  const token = generateCsrfToken();
  const userId = req.user?.id || req.ip;
  
  csrfTokens.set(userId, token);
  
  // Enviar token en header de respuesta
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

// Middleware para validar token
const csrfProtection = (req, res, next) => {
  // Skip CSRF para GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const userId = req.user?.id || req.ip;
  const token = req.headers['x-csrf-token'];
  const storedToken = csrfTokens.get(userId);

  if (!token || !storedToken || token !== storedToken) {
    return res.status(403).json({
      success: false,
      error: 'Token CSRF inválido o faltante'
    });
  }

  next();
};

// Limpiar tokens antiguos (ejecutar periódicamente)
setInterval(() => {
  csrfTokens.clear();
}, 3600000); // Limpiar cada hora

module.exports = {
  csrfTokenGenerator,
  csrfProtection
};
