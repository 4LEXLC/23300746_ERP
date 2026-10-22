// Genera el XML de una factura y lo guarda como archivo para revisarlo.
require('dotenv').config();
const fs = require('fs');
const conexion = require('../config/db');
const { generarXmlFactura } = require('../app/services/xml-factura.service');

generarXmlFactura(process.argv[2])
  .then((resultado) => {
    fs.writeFileSync(resultado.nombreArchivo, resultado.xml);
    console.log(`Se generó ${resultado.nombreArchivo}`);
  })
  .catch((error) => console.error('Error:', error.message))
  .finally(() => conexion.end());
  