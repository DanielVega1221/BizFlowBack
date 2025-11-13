const Sale = require('../models/Sale');
const { validateSaleData } = require('../utils/validators');

// @desc    Get all sales with pagination and filters
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res, next) => {
  try {
    const { client, from, to, page = 1, limit = 10, status } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    
    if (client) {
      query.client = client;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    // Execute query with pagination
    const sales = await Sale.find(query)
      .populate('client', 'name email phone industry')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sales,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client', 'name email phone industry');

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    // Validar y sanitizar datos
    const validatedData = validateSaleData(req.body);

    const sale = await Sale.create(validatedData);

    // Populate client data before sending response
    await sale.populate('client', 'name email phone industry');

    res.status(201).json({
      success: true,
      data: sale,
      message: 'Venta creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
exports.updateSale = async (req, res, next) => {
  try {
    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    // Validar y sanitizar datos
    const validatedData = validateSaleData(req.body);

    sale = await Sale.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('client', 'name email phone industry');

    res.status(200).json({
      success: true,
      data: sale,
      message: 'Venta actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Venta no encontrada'
      });
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Venta eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
