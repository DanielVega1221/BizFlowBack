require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Actualizar todos los usuarios que no tengan el campo role
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'admin' } }
    );

    console.log(`✅ ${result.modifiedCount} usuarios actualizados con role: admin`);

    // Mostrar todos los usuarios
    const users = await User.find({}).select('name email role');
    console.log('\n📋 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Actualización completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUsers();
