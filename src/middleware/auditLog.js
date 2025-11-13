const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const auditLog = (action, userId, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    userId,
    details,
    ip: details.ip || 'unknown'
  };

  const logFile = path.join(logsDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';

  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error('Error escribiendo log de auditoría:', err);
    }
  });
};

// Middleware para logging automático
const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Solo loguear operaciones exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        auditLog(action, req.user?.id || 'anonymous', {
          ip: req.ip,
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  auditLog,
  auditMiddleware
};
