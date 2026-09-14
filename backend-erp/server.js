// Servidor del backend: conecta el frontend de Angular con la base de datos MySQL.
// Aquí se registran todas las rutas del API (una por cada tabla del negocio).
const express = require('express');
const cors = require('cors'); // permite que Angular (otro puerto) pueda hacer peticiones a este servidor
const productoRoutes = require('./routes/producto.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const puestoRoutes = require('./routes/puesto.routes');
const trabajadorRoutes = require('./routes/trabajador.routes');
const horarioRoutes = require('./routes/horario.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');
const permisoRoutes = require('./routes/permiso.routes');
const movimientoInventarioRoutes = require('./routes/movimiento_inventario.routes');
const proveedorRoutes = require('./routes/proveedor.routes');
const productoProveedorRoutes = require('./routes/producto_proveedor.routes');
const compraRoutes = require('./routes/compra.routes');
const clienteRoutes = require('./routes/cliente.routes');
const ventaRoutes = require('./routes/venta.routes');
const ticketRoutes = require('./routes/ticket.routes');
const pagoRoutes = require('./routes/pago.routes');
const facturaRoutes = require('./routes/factura.routes');
const movimientoFinancieroRoutes = require('./routes/movimiento_financiero.routes');

const app = express();

app.use(cors());
app.use(express.json()); // permite leer el body de las peticiones en formato JSON

// Cada línea conecta una URL (ej. /api/venta) con su archivo de rutas.
app.use('/api/producto', productoRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/puesto', puestoRoutes);
app.use('/api/trabajador', trabajadorRoutes);
app.use('/api/horario', horarioRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/permiso', permisoRoutes);
app.use('/api/movimiento_inventario', movimientoInventarioRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/producto_proveedor', productoProveedorRoutes);
app.use('/api/compra', compraRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/venta', ventaRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/factura', facturaRoutes);
app.use('/api/movimiento_financiero', movimientoFinancieroRoutes);

app.listen(3100, () => {
  console.log('Servidor ejecutándose en http://localhost:3100');
});
