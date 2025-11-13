const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules for create
const createClientValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('phone').optional().trim(),
  body('industry').optional().trim(),
  body('notes').optional().trim(),
  validate
];

// Validation rules for update (name optional)
const updateClientValidation = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('phone').optional().trim(),
  body('industry').optional().trim(),
  body('notes').optional().trim(),
  validate
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.route('/')
  .get(getClients)
  .post(createClientValidation, createClient);

router.route('/:id')
  .get(getClient)
  .put(updateClientValidation, updateClient)
  .delete(deleteClient);

module.exports = router;
