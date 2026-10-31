// Rutas HTTP (GET/POST/PUT/DELETE) para pago.
const express = require('express');
const { requiereRol } = require('../middleware/auth.middleware');
const {
  obtenerPagos,
  obtenerPagoPorId,
  crearPago,
  actualizarPago,
  eliminarPago,
  totalDeVenta,
  referenciaUsada,
  ventaTienePago,
  completarVenta,
} = require('../app/services/pago.service');
const { verificarCaptura } = require('../app/services/paypal.service');

const router = express.Router();

router.get('/', requiereRol('admin'), async (req, res) => {
  try {
    res.json(await obtenerPagos());
  } catch (error) {
    console.error('Error al consultar pago:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de pago.' });
  }
});

router.get('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registro = await obtenerPagoPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

// El servidor decide el estado del pago; el navegador no lo manda.
router.post('/', async (req, res) => {
  try {
    const { id_venta, metodo_pago, referencia_transaccion, monto } = req.body;

    const totalVenta = await totalDeVenta(id_venta);
    if (totalVenta === null) return res.status(400).json({ mensaje: 'La venta no existe.' });
    if (!['Efectivo', 'Tarjeta'].includes(metodo_pago)) {
      return res.status(400).json({ mensaje: 'El método de pago es obligatorio y debe ser Efectivo o Tarjeta.' });
    }
    if (Math.abs(totalVenta - Number(monto)) > 0.01) {
      return res.status(400).json({ mensaje: 'El monto del pago no coincide con el total de la venta.' });
    }
    // No se procesa dos veces la misma venta ni la misma transacción.
    if (await ventaTienePago(id_venta)) {
      return res.status(409).json({ mensaje: 'Esta venta ya tiene un pago registrado.' });
    }

    let referencia = null;
    if (metodo_pago === 'Tarjeta') {
      if (!referencia_transaccion) {
        return res.status(400).json({ mensaje: 'El pago con tarjeta necesita la referencia de la transacción.' });
      }
      if (await referenciaUsada(referencia_transaccion)) {
        return res.status(409).json({ mensaje: 'Esa transacción ya fue registrada.' });
      }
      // Se confirma con PayPal, y un fallo de comunicación se avisa aparte.
      let aprobado;
      try {
        aprobado = await verificarCaptura(referencia_transaccion, totalVenta);
      } catch (error) {
        console.error('No se pudo verificar el pago con PayPal:', error.message);
        return res.status(502).json({ mensaje: 'No se pudo verificar el pago con PayPal. Intenta de nuevo.' });
      }
      // Un pago que PayPal no aprueba no se registra como pagado.
      if (!aprobado) return res.status(400).json({ mensaje: 'PayPal no confirmó el pago.' });
      referencia = referencia_transaccion;
    }

    const nuevoRegistro = await crearPago({ id_venta, metodo_pago, referencia_transaccion: referencia, monto: totalVenta, estado: 'completado' });
    await completarVenta(id_venta);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

router.put('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registroActualizado = await actualizarPago(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

router.delete('/:id', requiereRol('admin'), async (req, res) => {
  try {
    await eliminarPago(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo eliminar el registro.' });
  }
});

module.exports = router;
