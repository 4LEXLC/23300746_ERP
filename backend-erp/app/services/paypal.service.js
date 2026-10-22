// Conexión con la API de PayPal (sandbox o producción según PAYPAL_API en el .env).
const conexion = require('../../config/db');

const PAYPAL_API = process.env.PAYPAL_API;
const MONEDA = process.env.PAYPAL_MONEDA || 'MXN';
const IVA = 0.16;
const { enviarConfirmacionPago }= require ('./correo.service')

// Credenciales en Base64 para la autenticación básica de PayPal.
function credenciales() {
  return Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
}

// Pide a PayPal un token de acceso con el Client ID y el Secret (solo para uso del servidor).
async function obtenerToken() {
  const respuesta = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credenciales()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    console.error('Error de autenticación con PayPal:', datos);
    throw new Error('Error de autenticación con PayPal');
  }
  return datos.access_token;
}

// Token seguro para el navegador: el SDK v6 lo necesita para crear la instancia.
async function obtenerClientToken() {
  const respuesta = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credenciales()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&response_type=client_token&intent=sdk_init',
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    console.error('Error al pedir el client token:', datos);
    throw new Error('No se pudo obtener el client token de PayPal');
  }
  return datos.access_token;
}

// Envía una petición a PayPal ya con el token y regresa la respuesta en JSON.
async function paypalRequest(ruta, metodo, body) {
  const token = await obtenerToken();

  const respuesta = await fetch(`${PAYPAL_API}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    console.error('Error de PayPal:', datos);
    throw new Error('Operación de PayPal rechazada');
  }
  return datos;
}

// Calcula el total con los precios de la BD (nunca con los que manda el navegador).
async function calcularTotal(productos) {
  if (!Array.isArray(productos) || !productos.length) {
    throw new Error('El carrito está vacío.');
  }

  let subtotal = 0;
  for (const item of productos) {
    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('Cantidad inválida.');
    }
    const [filas] = await conexion.promise().query(
      'SELECT precio_venta FROM producto WHERE id_producto = ? AND activo = 1',
      [item.id]
    );
    if (!filas.length) {
      throw new Error(`El producto ${item.id} no existe o está inactivo.`);
    }
    subtotal += Number(filas[0].precio_venta) * cantidad;
  }

  return Math.round(subtotal * (1 + IVA) * 100) / 100;
}

// Crea la orden en PayPal con el total calculado en el servidor.
async function crearOrden(productos) {
  const total = await calcularTotal(productos);
  const orden = await paypalRequest('/v2/checkout/orders', 'POST', {
    intent: 'CAPTURE',
    purchase_units: [{ amount: { currency_code: MONEDA, value: total.toFixed(2) } }],
  });
  return { id: orden.id, total: total.toFixed(2) };
}

// Captura el pago y confirma que quedó completado.
async function capturarOrden(orderId) {
  const captura = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, 'POST', {});
  const pago = captura.purchase_units?.[0]?.payments?.captures?.[0];

  if (captura.status !== 'COMPLETED' || !pago || pago.status !== 'COMPLETED') {
    throw new Error('El pago no fue completado.');
  }
  // Manda el correo de confirmación. Si falla, el pago sigue siendo válido.
  const destino = process.env.CORREO_PRUEBAS || captura.payer?.email_address;
  if (destino) {
    try {
      await enviarConfirmacionPago({
        para: destino,
        nombre: captura.payer?.name?.given_name ?? 'cliente',
        monto: pago.amount?.value,
        captureId: pago.id,
        orderId: captura.id,
      });
    } catch (error) {
      console.error('No se pudo enviar el correo de confirmación:', error.message);
    }
  }
  return {
    mensaje: 'Pago completado',
    orderId: captura.id,
    captureId: pago.id,
    estado: pago.status,
    monto: pago.amount?.value,
  };
}

module.exports = {
  obtenerClientToken,
  paypalRequest,
  crearOrden,
  capturarOrden,
};
