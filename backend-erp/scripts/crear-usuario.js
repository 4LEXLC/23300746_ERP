// Crea un usuario con la contraseña encriptada.
// Uso: node scripts/crear-usuario.js <usuario> <contraseña> <rol>
require('dotenv').config();
const bcrypt = require('bcrypt');
const conexion = require('../config/db');

async function main() {
  const [nombre_usuario, contrasena, rol] = process.argv.slice(2);

  if (!nombre_usuario || !contrasena || !rol) {
    console.log('Uso: node scripts/crear-usuario.js <usuario> <contraseña> <rol>');
    conexion.end();
    return;
  }

  try {
    const hash = await bcrypt.hash(contrasena, 10);
    await conexion.promise().query(
      'INSERT INTO usuario (nombre_usuario, contrasena, rol, activo) VALUES (?, ?, ?, 1)',
      [nombre_usuario, hash, rol]
    );
    console.log(`Usuario "${nombre_usuario}" creado con rol "${rol}"`);
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
  } finally {
    conexion.end();
  }
}

main();