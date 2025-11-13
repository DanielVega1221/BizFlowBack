const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale
} = require('../controllers/saleController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules for create
const createSaleValidation = [
  body('clientId').notEmpty().withMessage('El cliente es requerido'),
  body('amount')
    .isNumeric()
    .withMessage('El monto debe ser numérico')
    .isFloat({ min: 0 })
    .withMessage('El monto no puede ser negativo'),
  body('description').optional().trim(),
  body('date').optional().isISO8601().withMessage('Fecha inválida'),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'cancelled'])
    .withMessage('Estado inválido'),
  validate
];

// Validation rules for update (all fields optional)
const updateSaleValidation = [
  body('clientId').optional().notEmpty().withMessage('El cliente no puede estar vacío'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('El monto debe ser numérico')
    .isFloat({ min: 0 })
    .withMessage('El monto no puede ser negativo'),
  body('description').optional().trim(),
  body('date').optional().isISO8601().withMessage('Fecha inválida'),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'cancelled'])
    .withMessage('Estado inválido'),
  validate
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.route('/')
  .get(getSales)
  .post(createSaleValidation, createSale);

router.route('/:id')
  .get(getSale)
  .put(updateSaleValidation, updateSale)
  .delete(deleteSale);

module.exports = router;
