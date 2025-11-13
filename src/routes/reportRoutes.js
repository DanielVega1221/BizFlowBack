const express = require('express');
const router = express.Router();
const { 
  getSummary, 
  exportReport, 
  getTopClients, 
  getSalesTrends, 
  getSalesByIndustry 
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/summary', getSummary);
router.get('/export', exportReport);
router.get('/top-clients', getTopClients);
router.get('/trends', getSalesTrends);
router.get('/by-industry', getSalesByIndustry);

module.exports = router;
