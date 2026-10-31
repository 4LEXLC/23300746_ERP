// Genera el XML de una factura con la estructura CFDI 4.0 del SAT.
const conexion = require ('../../config/db')

// Datos de la cafetería.
const EMISOR = {
  rfc: 'EKU9003173C9', // EKU9003173C9 es un RFC de pruebas que publica el SAT.
  nombre: 'CAFETERIA ERP',
  regimen: '601',
  codigoPostal: '44100',
};

const REGIMENES = {
  'General de Ley Personas Morales': '601',
  'Sueldos y Salarios': '605',
  'Régimen de Incorporación Fiscal': '621',
};

// G03 solo vale para estos regímenes; para los demás (como 605 o 616) se usa S01.
const REGIMENES_G03 = ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'];

const FORMAS_PAGO = {
  Efectivo: '01',
  Tarjeta: '31', // La tarjeta siempre pasa por PayPal (intermediario de pagos).
  PayPal: '31',
};

// Evita que caracteres rompan el XML.
function escaparXml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function dinero(numero) {
  return Number(numero).toFixed(2);
}

function fechaSat(fecha) {
  const d = new Date(fecha);
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
}

// JOIN en una sola consulta (factura, su venta, el cliente y el pago).
async function obtenerDatosFactura(id_factura) {
  const [filas] = await conexion.promise().query(
    `SELECT f.folio, f.fecha_emision,
            v.productos,
            c.nombre, c.rfc, c.correo, c.codigo_postal, c.regimen_fiscal,
            p.metodo_pago
     FROM factura f
     JOIN venta v ON v.id_venta = f.id_venta
     JOIN cliente c ON c.id_cliente = f.id_cliente
     LEFT JOIN pago p ON p.id_venta = f.id_venta
     WHERE f.id_factura = ?`,
    [id_factura]
  );
  if (!filas.length) throw new Error('La factura no existe.');
  return filas[0];
}

async function generarXmlFactura(id_factura) {
  const datos = await obtenerDatosFactura(id_factura);
  const productos = typeof datos.productos === 'string' ? JSON.parse(datos.productos) : datos.productos;

  // Un concepto por cada producto + IVA.
  let subtotal = 0;
  let totalIva = 0;
  const conceptos = productos.map((p) => {
    const importe = p.precioUnitario * p.cantidad;
    const iva = Math.round(importe * 16) / 100; 
    subtotal += importe;
    totalIva += iva;
    return `
    <cfdi:Concepto 
        ClaveProdServ="90101500" 
        Cantidad="${p.cantidad}" 
        ClaveUnidad="H87" Unidad="Pieza" 
        Descripcion="${escaparXml(p.nombre)}" 
        ValorUnitario="${dinero(p.precioUnitario)}" 
        Importe="${dinero(importe)}" 
    ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${dinero(importe)}" 
            Impuesto="002" 
            TipoFactor="Tasa" 
            TasaOCuota="0.160000" 
            Importe="${dinero(iva)}"/>
            </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>`;
  }).join('');

  const total = subtotal + totalIva;

  // Si el cliente no dio RFC, se usa el RFC genérico.
  const rfcReceptor = datos.rfc || 'XAXX010101000';
  const regimenReceptor = REGIMENES[datos.regimen_fiscal] || '616';
  const formaPago = FORMAS_PAGO[datos.metodo_pago] || '99';
  const usoCfdi = REGIMENES_G03.includes(regimenReceptor) ? 'G03' : 'S01';
  // La serie es el prefijo del folio y el folio es solo el número (FAC-0003 -> A: FAC, 0003).
  const [serie, numeroFolio] = String(datos.folio).split('-');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfd40.xsd"
        Version="4.0"
        Serie="${escaparXml(serie)}"
        Folio="${escaparXml(numeroFolio ?? datos.folio)}"
        Fecha="${fechaSat(datos.fecha_emision)}"
        FormaPago="${formaPago}"
        MetodoPago="PUE"
        SubTotal="${dinero(subtotal)}"
        Moneda="MXN"
        Total="${dinero(total)}"
        TipoDeComprobante="I"
        Exportacion="01"
        LugarExpedicion="${EMISOR.codigoPostal}">
    <cfdi:Emisor
        Rfc="${EMISOR.rfc}"
        Nombre="${EMISOR.nombre}"
        RegimenFiscal="${EMISOR.regimen}"/>
    <cfdi:Receptor
        Rfc="${escaparXml(rfcReceptor)}"
        Nombre="${escaparXml(datos.nombre)}"
        DomicilioFiscalReceptor="${escaparXml(datos.codigo_postal || EMISOR.codigoPostal)}"
        RegimenFiscalReceptor="${regimenReceptor}"
        UsoCFDI="${usoCfdi}"/>
    <cfdi:Conceptos>${conceptos}
    </cfdi:Conceptos>
    <cfdi:Impuestos TotalImpuestosTrasladados="${dinero(totalIva)}">
        <cfdi:Traslados>
        <cfdi:Traslado
            Base="${dinero(subtotal)}"
            Impuesto="002"
            TipoFactor="Tasa"
            TasaOCuota="0.160000"
            Importe="${dinero(totalIva)}"/>
        </cfdi:Traslados>
    </cfdi:Impuestos>
    </cfdi:Comprobante>`;

  return {
    xml,
    nombreArchivo: `${datos.folio}.xml`,
    correo: datos.correo,
    nombre: datos.nombre,
    folio: datos.folio,
    total,
  };
}

module.exports = { generarXmlFactura };