const Sale = require('../models/Sale');
const Client = require('../models/Client');
const PDFDocument = require('pdfkit');

// @desc    Get summary report (total sales, clients, sales by month)
// @route   GET /api/reports/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    // Build date query
    let dateQuery = {};
    if (from || to) {
      dateQuery.date = {};
      if (from) {
        dateQuery.date.$gte = new Date(from);
      }
      if (to) {
        dateQuery.date.$lte = new Date(to);
      }
    }

    // Get total sales amount (only paid sales)
    const salesAgg = await Sale.aggregate([
      {
        $match: {
          ...dateQuery,
          status: { $in: ['paid', 'pending'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const totalSales = salesAgg.length > 0 ? salesAgg[0].totalSales : 0;
    const totalSalesCount = salesAgg.length > 0 ? salesAgg[0].totalCount : 0;

    // Get total clients
    const totalClients = await Client.countDocuments();

    // Get sales by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesByMonth = await Sale.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
          status: { $in: ['paid', 'pending'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          total: 1,
          count: 1
        }
      }
    ]);

    // Get sales by status
    const salesByStatus = await Sale.aggregate([
      {
        $match: dateQuery
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalSalesCount,
        totalClients,
        salesByMonth,
        salesByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export report as PDF
// @route   GET /api/reports/export
// @access  Private
exports.exportReport = async (req, res, next) => {
  try {
    const { from, to, format = 'pdf' } = req.query;

    // Only PDF is implemented for this demo
    if (format !== 'pdf') {
      return res.status(400).json({
        success: false,
        error: 'Solo el formato PDF está disponible actualmente'
      });
    }

    // Build date query
    let dateQuery = {};
    if (from || to) {
      dateQuery.date = {};
      if (from) {
        dateQuery.date.$gte = new Date(from);
      }
      if (to) {
        dateQuery.date.$lte = new Date(to);
      }
    }

    // Get sales data
    const sales = await Sale.find(dateQuery)
      .populate('client', 'name email')
      .sort({ date: -1 });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-ventas-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('BizFlow - Reporte de Ventas', { align: 'center' });
    doc.moveDown();
    
    if (from || to) {
      doc.fontSize(12).text(`Período: ${from || 'Inicio'} - ${to || 'Actual'}`, { align: 'center' });
      doc.moveDown();
    }

    doc.fontSize(10);
    
    // Calculate totals
    const totalAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);
    
    // Check if there are no sales
    if (sales.length === 0) {
      doc.text('No se encontraron ventas para el período seleccionado.', { align: 'center' });
      doc.moveDown();
      doc.end();
      return;
    }
    
    doc.text(`Total de ventas: ${sales.length}`);
    doc.text(`Monto total: $${totalAmount.toFixed(2)}`);
    doc.moveDown();

    // Add table headers
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Fecha', 50, tableTop);
    doc.text('Cliente', 120, tableTop);
    doc.text('Descripción', 250, tableTop);
    doc.text('Monto', 400, tableTop);
    doc.text('Estado', 480, tableTop);
    
    // Add horizontal line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Add sales data
    doc.font('Helvetica');
    let y = tableTop + 25;
    
    sales.forEach((sale, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      
      const date = new Date(sale.date).toLocaleDateString();
      const clientName = sale.client ? sale.client.name : 'N/A';
      const description = sale.description || '-';
      const amount = `$${sale.amount.toFixed(2)}`;
      const status = sale.status;
      
      doc.text(date, 50, y, { width: 70 });
      doc.text(clientName, 120, y, { width: 130 });
      doc.text(description, 250, y, { width: 150 });
      doc.text(amount, 400, y, { width: 80 });
      doc.text(status, 480, y, { width: 70 });
      
      y += 20;
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

// @desc    Get top clients by sales
// @route   GET /api/reports/top-clients
// @access  Private
exports.getTopClients = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topClients = await Sale.aggregate([
      {
        $match: { status: { $in: ['paid', 'pending'] } }
      },
      {
        $group: {
          _id: '$client',
          totalAmount: { $sum: '$amount' },
          salesCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $unwind: '$clientInfo'
      },
      {
        $project: {
          _id: 0,
          clientId: '$_id',
          name: '$clientInfo.name',
          email: '$clientInfo.email',
          totalSales: '$totalAmount',
          salesCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topClients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales trends (comparison with previous period)
// @route   GET /api/reports/trends
// @access  Private
exports.getSalesTrends = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month sales
    const currentMonthSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: currentMonthStart },
          status: { $in: ['paid', 'pending'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month sales
    const lastMonthSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: lastMonthStart, $lte: lastMonthEnd },
          status: { $in: ['paid', 'pending'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const currentTotal = currentMonthSales[0]?.total || 0;
    const currentCount = currentMonthSales[0]?.count || 0;
    const lastTotal = lastMonthSales[0]?.total || 0;
    const lastCount = lastMonthSales[0]?.count || 0;

    const amountChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100).toFixed(2) : 0;
    const countChange = lastCount > 0 ? ((currentCount - lastCount) / lastCount * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: currentTotal,
        lastMonth: lastTotal,
        change: {
          amount: parseFloat(amountChange),
          count: parseFloat(countChange)
        },
        weekly: [] // Para compatibilidad
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales by industry
// @route   GET /api/reports/by-industry
// @access  Private
exports.getSalesByIndustry = async (req, res, next) => {
  try {
    const salesByIndustry = await Sale.aggregate([
      {
        $match: { status: { $in: ['paid', 'pending'] } }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $unwind: '$clientInfo'
      },
      {
        $group: {
          _id: '$clientInfo.industry',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Calcular total global para porcentajes
    const grandTotal = salesByIndustry.reduce((sum, item) => sum + item.total, 0);

    // Agregar promedio y porcentaje a cada industria
    const enrichedData = salesByIndustry.map(item => ({
      _id: item._id || 'Sin especificar',
      total: item.total,
      count: item.count,
      average: item.count > 0 ? item.total / item.count : 0,
      percentage: grandTotal > 0 ? (item.total / grandTotal * 100) : 0
    }));

    res.status(200).json({
      success: true,
      data: enrichedData
    });
  } catch (error) {
    next(error);
  }
};
