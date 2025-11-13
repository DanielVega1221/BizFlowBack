require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('../models/Client');

const industries = [
  'Tecnología',
  'Retail',
  'Salud',
  'Educación',
  'Construcción',
  'Manufactura',
  'Servicios Financieros',
  'Alimentos y Bebidas',
  'Turismo',
  'Transporte'
];

async function updateClients() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Contar clientes sin industria
    const clientsWithoutIndustry = await Client.countDocuments({
      $or: [
        { industry: { $exists: false } },
        { industry: null },
        { industry: '' }
      ]
    });

    console.log(`📊 Clientes sin industria: ${clientsWithoutIndustry}`);

    if (clientsWithoutIndustry > 0) {
      // Obtener todos los clientes sin industria
      const clients = await Client.find({
        $or: [
          { industry: { $exists: false } },
          { industry: null },
          { industry: '' }
        ]
      });

      // Actualizar cada cliente con una industria aleatoria
      for (const client of clients) {
        const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
        await Client.findByIdAndUpdate(client._id, { industry: randomIndustry });
        console.log(`  ✅ ${client.name} -> ${randomIndustry}`);
      }

      console.log(`\n✅ ${clientsWithoutIndustry} clientes actualizados`);
    } else {
      console.log('✅ Todos los clientes ya tienen industria asignada');
    }

    // Mostrar resumen por industria
    const summary = await Client.aggregate([
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📋 Distribución de clientes por industria:');
    summary.forEach(item => {
      console.log(`  ${item._id || 'Sin especificar'}: ${item.count} clientes`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Actualización completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateClients();
