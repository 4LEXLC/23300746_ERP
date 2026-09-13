const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ia32183218',
  database: 'cafeteriaerp'
});

conexion.connect((error) => {
  if (error) {
    console.error('Error de la conexion:', error);
    return;
  }
  console.log('Conexión a MySQL exitosa');
});

module.exports = conexion;