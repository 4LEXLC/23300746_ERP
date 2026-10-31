const express = require('express');
const { requiereRol } = require('../middleware/auth.middleware');
const { calcularTotal } = require('../app/services/paypal.service');
const {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
  trabajadorDelUsuario,
} = require('../app/services/venta.service');

const router = express.Router();

// GET  /api/venta      -> lista todas las ventas
// GET  /api/venta/:id  -> una venta en específico
// POST /api/venta      -> crea una venta nueva (la usa el punto de venta al cobrar)
// PUT  /api/venta/:id  -> edita una venta
// DELETE /api/venta/:id -> elimina una venta
router.get('/', requiereRol('admin'), async (req, res) => {
  try {
    res.json(await obtenerVentas());
  } catch (error) {
    console.error('Error al consultar venta:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de venta.' });
  }
});

router.get('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registro = await obtenerVentaPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productos, subtotal, iva, total } = req.body;

    // Al menos un producto.
    if (!Array.isArray(productos) || !productos.length) {
      return res.status(400).json({ mensaje: 'La venta debe tener al menos un producto.' });
    }
    // Ningún importe negativo.
    if ([subtotal, iva, total].some((valor) => !(Number(valor) >= 0))) {
      return res.status(400).json({ mensaje: 'Los importes no pueden ser negativos.' });
    }
    // El total se recalcula con los precios de la base, no con los del navegador.
    let totalReal;
    try {
      totalReal = await calcularTotal(productos.map((p) => ({ id: p.id_producto, cantidad: p.cantidad })));
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
    if (Math.abs(totalReal - Number(total)) > 0.01) {
      return res.status(400).json({ mensaje: 'El total no coincide con los productos.' });
    }
    // El cajero sale del token.
    const idTrabajador = await trabajadorDelUsuario(req.usuario.id_usuario);
    if (!idTrabajador) {
      return res.status(400).json({ mensaje: 'Tu usuario no está ligado a ningún trabajador.' });
    }

    const nuevoRegistro = await crearVenta({ ...req.body, id_trabajador: idTrabajador });
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registroActualizado = await actualizarVenta(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', requiereRol('admin'), async (req, res) => {
  try {
    await eliminarVenta(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
