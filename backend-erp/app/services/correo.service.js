// Correos que manda el ERP: confirmación de pago y factura
const { enviarCorreo } = require('../../config/correo');

// Convierte a pesos
function formatoPesos(monto) {
  return Number(monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

// Correo que confirma que el pago con PayPal se completó.
async function enviarConfirmacionPago({ para, nombre, monto, captureId, orderId }) {
  const html = `
    <h2>¡Gracias por tu compra, ${nombre}!</h2>
    <p>Tu pago con PayPal se realizó correctamente.</p>
    <table cellpadding="6">
      <tr><td><b>Monto pagado:</b></td><td>${formatoPesos(monto)}</td></tr>
      <tr><td><b>Fecha:</b></td><td>${new Date().toLocaleString('es-MX')}</td></tr>
      <tr><td><b>Orden de PayPal:</b></td><td>${orderId}</td></tr>
      <tr><td><b>ID de transacción:</b></td><td>${captureId}</td></tr>
    </table>
    <p>Si necesitas factura, solicítala en caja con tu ticket.</p>
    <p>— Cafetería ERP</p>
  `;

  return enviarCorreo({
    para,
    asunto: 'Confirmación de pago - Cafetería ERP',
    html,
  });
} // ← esta llave es la que te faltaba

// Correo con la factura: lleva el XML como archivo adjunto.
async function enviarFactura({ para, nombre, folio, total, xml, nombreArchivo }) {
  const html = `
    <h2>Factura ${folio}</h2>
    <p>Hola ${nombre}, gracias por tu compra.</p>
    <p>Te enviamos adjunto el archivo XML de tu factura.</p>
    <table cellpadding="6">
      <tr><td><b>Folio:</b></td><td>${folio}</td></tr>
      <tr><td><b>Total:</b></td><td>${formatoPesos(total)}</td></tr>
      <tr><td><b>Fecha:</b></td><td>${new Date().toLocaleString('es-MX')}</td></tr>
    </table>
    <p>— Cafetería ERP</p>
  `;

  return enviarCorreo({
    para,
    asunto: `Factura ${folio} - Cafetería ERP`,
    html,
    adjuntos: [
      {
        filename: nombreArchivo,
        content: xml,
        contentType: 'application/xml',
      },
    ],
  });
}

module.exports = { enviarConfirmacionPago, enviarFactura };