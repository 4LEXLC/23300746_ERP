// Rutas HTTP (GET/POST/PUT/DELETE) para factura.
const express = require('express');
const { requiereRol } = require('../middleware/auth.middleware');
const { generarXmlFactura } = require('../app/services/xml-factura.service');
const { enviarFactura } = require('../app/services/correo.service');

const {
  obtenerFacturas,
  obtenerFacturaPorId,
  crearFactura,
  actualizarFactura,
  cancelarFactura,
  pagoAprobado,
  tieneFacturaVigente,
  ESTADOS_FACTURA,
} = require('../app/services/factura.service');

const router = express.Router();

// Genera el XML y lo manda por correo. Si falla ya se guardo.
async function mandarFacturaPorCorreo(id_factura) {
  try {
    const factura = await generarXmlFactura(id_factura);
    const destino = factura.correo || process.env.CORREO_PRUEBAS;

    if (!destino) {
      console.log(`La factura ${factura.folio} no tiene correo; no se envió.`);
      return;
    }

    await enviarFactura({ para: destino, ...factura });
    console.log(`Factura ${factura.folio} enviada a ${destino}`);
  } catch (error) {
    console.error('No se pudo enviar la factura por correo:', error.message);
  }
}

router.get('/', requiereRol('admin'), async (req, res) => {
  try {
    res.json(await obtenerFacturas());
  } catch (error) {
    console.error('Error al consultar factura:', error);
    res.status(500).json({ mensaje: 'No se pudieron obtener los registros de factura.' });
  }
});

router.get('/:id', requiereRol('admin'), async (req, res) => {
  try {
    const registro = await obtenerFacturaPorId(req.params.id);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registro);
  } catch (error) {
    console.error('Error al consultar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo obtener el registro.' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!(await pagoAprobado(req.body.id_venta))) {
      return res.status(400).json({ mensaje: 'Solo se puede facturar una venta con pago aprobado.' });
    }
    if (await tieneFacturaVigente(req.body.id_venta)) {
      return res.status(400).json({ mensaje: 'Esta venta ya tiene una factura vigente.' });
    }
    const nuevoRegistro = await crearFactura(req.body);
    res.status(201).json(nuevoRegistro);
    mandarFacturaPorCorreo(nuevoRegistro.id_factura);
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo crear el registro.' });
  }
});

// Cancela sin borrar.
router.patch('/:id/cancelar', requiereRol('admin'), async (req, res) => {
  try {
    const factura = await cancelarFactura(req.params.id);
    if (!factura) return res.status(404).json({ mensaje: 'Factura no encontrada.' });
    res.json(factura);
  } catch (error) {
    console.error('Error al cancelar la factura:', error);
    res.status(500).json({ mensaje: 'No se pudo cancelar la factura.' });
  }
});

// El estado solo puede tener valores permitidos.
router.put('/:id', requiereRol('admin'), async (req, res) => {
  if (!ESTADOS_FACTURA.includes(req.body.estado)) {
    return res.status(400).json({ mensaje: 'Estado de factura no permitido.' });
  }
  try {
    const registroActualizado = await actualizarFactura(req.params.id, req.body);
    if (!registroActualizado) return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    res.json(registroActualizado);
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ mensaje: 'No se pudo actualizar el registro.' });
  }
});

module.exports = router;
