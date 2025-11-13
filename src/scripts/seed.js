require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Sample data
const industries = ['Tecnología', 'Retail', 'Servicios', 'Manufactura', 'Salud', 'Educación', 'Construcción', 'Hostelería'];
const descriptions = [
  'Servicio de consultoría',
  'Venta de productos',
  'Mantenimiento mensual',
  'Proyecto especial',
  'Licencia software',
  'Capacitación',
  'Soporte técnico'
];

const statuses = ['pending', 'paid', 'cancelled'];

// Generate random date in last 6 months
const randomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const diff = now.getTime() - sixMonthsAgo.getTime();
  const randomTime = Math.random() * diff;
  
  return new Date(sixMonthsAgo.getTime() + randomTime);
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Clear existing data
    console.log('🗑️  Limpiando datos existentes...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Sale.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Datos limpiados');

    // Create admin user
    console.log('👤 Creando usuario admin...');
    const adminUser = await User.create({
      name: 'Admin BizFlow',
      email: 'admin@bizflow.test',
      password: 'Test1234',
      role: 'admin'
    });
    console.log('✅ Usuario admin creado:', adminUser.email);

    // Create regular user
    const regularUser = await User.create({
      name: 'Usuario Demo',
      email: 'demo@bizflow.test',
      password: 'Test1234',
      role: 'user'
    });
    console.log('✅ Usuario regular creado:', regularUser.email);

    // Create clients
    console.log('👥 Creando clientes...');
    const clients = [];
    
    const clientNames = [
      'Taller Mecánico Pérez',
      'Restaurante El Buen Sabor',
      'Consultora TechSolutions',
      'Farmacia Santa Rosa',
      'Constructora Edificar',
      'Tienda de Ropa ModaActual',
      'Gimnasio FitLife',
      'Librería El Conocimiento',
      'Peluquería Estilo y Belleza',
      'Panadería La Espigas'
    ];

    for (let i = 0; i < 10; i++) {
      const client = await Client.create({
        name: clientNames[i],
        email: `cliente${i + 1}@example.com`,
        phone: `+34 ${600 + i}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
        industry: industries[Math.floor(Math.random() * industries.length)],
        notes: `Cliente registrado el ${new Date().toLocaleDateString()}`
      });
      clients.push(client);
    }
    console.log(`✅ ${clients.length} clientes creados`);

    // Create sales
    console.log('💰 Creando ventas...');
    const sales = [];
    
    for (let i = 0; i < 25; i++) {
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomAmount = Math.floor(Math.random() * 5000) + 100;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      const sale = await Sale.create({
        client: randomClient._id,
        amount: randomAmount,
        description: randomDesc,
        date: randomDate(),
        status: randomStatus
      });
      sales.push(sale);
    }
    console.log(`✅ ${sales.length} ventas creadas`);

    // Create products
    console.log('📦 Creando productos...');
    const products = [];
    
    const productList = [
      { name: 'Consultoría Empresarial', description: 'Servicio de consultoría estratégica', price: 50000, category: 'Consultoría', stock: 999 },
      { name: 'Desarrollo Web', description: 'Desarrollo de sitio web corporativo', price: 150000, category: 'Servicio', stock: 999 },
      { name: 'Licencia Software Anual', description: 'Licencia de uso por 12 meses', price: 80000, category: 'Licencia', stock: 100 },
      { name: 'Capacitación en Ventas', description: 'Curso de técnicas de ventas', price: 35000, category: 'Capacitación', stock: 50 },
      { name: 'Mantenimiento Mensual', description: 'Servicio de mantenimiento preventivo', price: 15000, category: 'Mantenimiento', stock: 999 },
      { name: 'Hosting Empresarial', description: 'Hosting y dominio anual', price: 25000, category: 'Servicio', stock: 200 },
      { name: 'Diseño de Logo', description: 'Diseño de identidad corporativa', price: 20000, category: 'Servicio', stock: 999 },
      { name: 'Marketing Digital', description: 'Campaña de marketing en redes sociales', price: 60000, category: 'Servicio', stock: 999 },
      { name: 'Auditoría de Seguridad', description: 'Análisis de seguridad informática', price: 45000, category: 'Consultoría', stock: 999 },
      { name: 'Producto Físico Ejemplo', description: 'Producto de ejemplo con stock', price: 12500, category: 'Producto', stock: 150, sku: 'PROD-001' }
    ];

    for (const prodData of productList) {
      const product = await Product.create(prodData);
      products.push(product);
    }
    console.log(`✅ ${products.length} productos creados`);

    // Calculate totals
    const totalAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const paidSales = sales.filter(s => s.status === 'paid');
    const paidAmount = paidSales.reduce((sum, sale) => sum + sale.amount, 0);

    console.log('\n📊 RESUMEN DEL SEED:');
    console.log('='.repeat(50));
    console.log(`👥 Usuarios creados: 2`);
    console.log(`   - Admin: admin@bizflow.test / Test1234`);
    console.log(`   - Demo:  demo@bizflow.test / Test1234`);
    console.log(`\n👥 Clientes creados: ${clients.length}`);
    console.log(`💰 Ventas creadas: ${sales.length}`);
    console.log(`   - Total general: $${totalAmount.toFixed(2)}`);
    console.log(`   - Pagadas (${paidSales.length}): $${paidAmount.toFixed(2)}`);
    console.log(`\n📦 Productos creados: ${products.length}`);
    console.log('='.repeat(50));
    console.log('\n✅ Seed completado exitosamente!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
