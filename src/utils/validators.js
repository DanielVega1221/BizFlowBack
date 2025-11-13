// Validaciones personalizadas para el backend
const validator = require('validator');

// Sanitizar y validar texto
const sanitizeText = (text, maxLength = 500) => {
  if (!text) return '';
  
  // Remover HTML tags y scripts
  let sanitized = text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
  
  // Limitar longitud
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Validar y sanitizar nombre
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('El nombre es requerido');
  }
  
  const sanitized = sanitizeText(name, 100);
  
  if (sanitized.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres');
  }
  
  // Solo letras, espacios, guiones y tildes
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/.test(sanitized)) {
    throw new Error('El nombre solo puede contener letras, espacios y guiones');
  }
  
  return sanitized;
};

// Validar email
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('El email es requerido');
  }
  
  const normalized = validator.normalizeEmail(email);
  
  if (!validator.isEmail(normalized)) {
    throw new Error('Email inválido');
  }
  
  if (normalized.length > 100) {
    throw new Error('Email demasiado largo');
  }
  
  return normalized;
};

// Validar teléfono
const validatePhone = (phone) => {
  if (!phone) return null; // Opcional
  
  if (typeof phone !== 'string') {
    throw new Error('Teléfono inválido');
  }
  
  // Remover espacios y caracteres especiales
  const clean = phone.replace(/[\s\-()]/g, '');
  
  // Validar que solo contenga números y +
  if (!/^[\+\d]+$/.test(clean)) {
    throw new Error('El teléfono solo puede contener números');
  }
  
  if (clean.length < 8 || clean.length > 15) {
    throw new Error('El teléfono debe tener entre 8 y 15 dígitos');
  }
  
  return phone;
};

// Validar monto
const validateAmount = (amount) => {
  if (amount === undefined || amount === null) {
    throw new Error('El monto es requerido');
  }
  
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    throw new Error('El monto debe ser un número válido');
  }
  
  if (num < 0) {
    throw new Error('El monto no puede ser negativo');
  }
  
  if (num > 99999999.99) {
    throw new Error('El monto es demasiado grande');
  }
  
  // Redondear a 2 decimales
  return Math.round(num * 100) / 100;
};

// Validar fecha
const validateDate = (date) => {
  if (!date) {
    throw new Error('La fecha es requerida');
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Fecha inválida');
  }
  
  // No permitir fechas antes del año 2000
  const minDate = new Date('2000-01-01');
  if (dateObj < minDate) {
    throw new Error('La fecha no puede ser anterior al año 2000');
  }
  
  // No permitir fechas más de 10 años en el futuro
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  if (dateObj > maxDate) {
    throw new Error('La fecha no puede ser tan futura');
  }
  
  return dateObj;
};

// Validar industria
const validateIndustry = (industry) => {
  if (!industry) return null; // Opcional
  
  const validIndustries = [
    'Tecnología',
    'Retail',
    'Salud',
    'Educación',
    'Construcción',
    'Manufactura',
    'Servicios Financieros',
    'Alimentos y Bebidas',
    'Turismo',
    'Transporte',
    'Servicios',
    'Hostelería',
    'Otro'
  ];
  
  if (!validIndustries.includes(industry)) {
    throw new Error('Industria no válida');
  }
  
  return industry;
};

// Validar estado de venta
const validateStatus = (status) => {
  const validStatuses = ['pending', 'paid', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error('Estado no válido');
  }
  
  return status;
};

// Validar contraseña
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña es requerida');
  }
  
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (password.length > 128) {
    throw new Error('La contraseña es demasiado larga');
  }
  
  // Validar complejidad mínima
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    throw new Error('La contraseña debe contener al menos una letra y un número');
  }
  
  return password;
};

// Validar datos de cliente
const validateClientData = (data) => {
  const validated = {};
  
  validated.name = validateName(data.name);
  validated.email = validateEmail(data.email);
  validated.phone = validatePhone(data.phone);
  validated.industry = validateIndustry(data.industry);
  validated.notes = sanitizeText(data.notes, 1000);
  
  return validated;
};

// Validar datos de venta
const validateSaleData = (data) => {
  const validated = {};
  
  // ClientId debe ser un ObjectId válido
  if (!data.client || !validator.isMongoId(data.client.toString())) {
    throw new Error('Cliente inválido');
  }
  validated.client = data.client;
  
  validated.amount = validateAmount(data.amount);
  validated.description = sanitizeText(data.description, 500);
  validated.date = validateDate(data.date);
  validated.status = validateStatus(data.status);
  
  return validated;
};

// Validar datos de usuario
const validateUserData = (data, isUpdate = false) => {
  const validated = {};
  
  validated.name = validateName(data.name);
  validated.email = validateEmail(data.email);
  
  if (!isUpdate || data.password) {
    validated.password = validatePassword(data.password);
  }
  
  if (data.role) {
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(data.role)) {
      throw new Error('Rol no válido');
    }
    validated.role = data.role;
  }
  
  return validated;
};

module.exports = {
  sanitizeText,
  validateName,
  validateEmail,
  validatePhone,
  validateAmount,
  validateDate,
  validateIndustry,
  validateStatus,
  validatePassword,
  validateClientData,
  validateSaleData,
  validateUserData
};
