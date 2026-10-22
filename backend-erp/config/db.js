// Configuración de la conexión a MySQL (base de datos cafeteriaerp).
// Todos los servicios (venta, producto, trabajador, etc.) usan esta misma conexión.
// Los datos de acceso se leen del archivo .env.
const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

conexion.connect((error) => {
  if (error) {
    console.error('Error de la conexion:', error);
    return;
  }
  console.log('Conexión a MySQL exitosa');
});

module.exports = conexion;