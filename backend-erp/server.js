require('dotenv').config();

// Servidor del backend: conecta el frontend de Angular con la base de datos MySQL.
// Aquí se registran todas las rutas del API (una por cada tabla del negocio).
const express = require('express');
const cors = require('cors'); // permite que Angular (otro puerto) pueda hacer peticiones a este servidor
const { verificarToken } = require('./middleware/auth.middleware');
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
const paypalRoutes = require('./routes/paypal.routes');

const app = express();

app.use(cors());
app.use(express.json()); // permite leer el body de las peticiones en formato JSON

// Usuario no lleva verificarToken aquí: el login es público y lo demás se protege dentro de usuario.routes.js
app.use('/api/usuario', usuarioRoutes);

// Todas estas rutas piden token válido.
app.use('/api/producto', verificarToken, productoRoutes);
app.use('/api/puesto', verificarToken, puestoRoutes);
app.use('/api/trabajador', verificarToken, trabajadorRoutes);
app.use('/api/horario', verificarToken, horarioRoutes);
app.use('/api/asistencia', verificarToken, asistenciaRoutes);
app.use('/api/permiso', verificarToken, permisoRoutes);
app.use('/api/movimiento_inventario', verificarToken, movimientoInventarioRoutes);
app.use('/api/proveedor', verificarToken, proveedorRoutes);
app.use('/api/producto_proveedor', verificarToken, productoProveedorRoutes);
app.use('/api/compra', verificarToken, compraRoutes);
app.use('/api/cliente', verificarToken, clienteRoutes);
app.use('/api/venta', verificarToken, ventaRoutes);
app.use('/api/ticket', verificarToken, ticketRoutes);
app.use('/api/pago', verificarToken, pagoRoutes);
app.use('/api/factura', verificarToken, facturaRoutes);
app.use('/api/movimiento_financiero', verificarToken, movimientoFinancieroRoutes);
app.use('/api/paypal', verificarToken, paypalRoutes);

app.listen(3100, () => {
  console.log('Servidor ejecutándose en http://localhost:3100');
});