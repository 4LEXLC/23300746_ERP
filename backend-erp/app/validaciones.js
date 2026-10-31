// Validaciones del servidor: cada función regresa el mensaje de error, o null si todo está bien.
const RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CP = /^\d{5}$/;
const USUARIO = /^[A-Za-z0-9._]{4,30}$/;
const CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const vacio = (valor) => valor === undefined || valor === null || String(valor).trim() === '';
const telefonoValido = (tel) => String(tel).replace(/\D/g, '').length === 10;
const enteroNoNegativo = (valor) => Number.isInteger(Number(valor)) && Number(valor) >= 0;

function validarProducto(d) {
  const nombre = String(d.nombre ?? '').trim();
  if (nombre.length < 2 || nombre.length > 100) return 'El nombre debe tener entre 2 y 100 caracteres.';
  if (vacio(d.categoria)) return 'La categoría es obligatoria.';
  if (!(Number(d.precio_venta) > 0)) return 'El precio debe ser mayor que cero.';
  if (!enteroNoNegativo(d.stock)) return 'La existencia debe ser un entero mayor o igual a cero.';
  if (!enteroNoNegativo(d.stock_minimo)) return 'La existencia mínima debe ser un entero mayor o igual a cero.';
  return null;
}

function validarCliente(d) {
  if (vacio(d.nombre)) return 'El nombre o razón social es obligatorio.';
  if (vacio(d.rfc)) return 'El RFC es obligatorio.';
  if (!RFC.test(String(d.rfc).trim().toUpperCase())) return 'El RFC no tiene un formato válido.';
  if (!CP.test(String(d.codigo_postal ?? ''))) return 'El código postal debe tener 5 dígitos.';
  if (vacio(d.regimen_fiscal)) return 'El régimen fiscal es obligatorio.';
  if (!vacio(d.correo) && !CORREO.test(d.correo)) return 'El correo no tiene un formato válido.';
  return null;
}

function validarProveedor(d) {
  if (vacio(d.nombre)) return 'El nombre del proveedor es obligatorio.';
  if (!telefonoValido(d.telefono ?? '')) return 'El teléfono debe tener 10 dígitos.';
  if (!vacio(d.correo) && !CORREO.test(d.correo)) return 'El correo no tiene un formato válido.';
  return null;
}

function validarCompra(d) {
  if (!d.id_proveedor) return 'La orden debe tener un proveedor.';
  if (!Array.isArray(d.productos) || !d.productos.length) return 'La orden debe tener al menos un producto.';
  if (d.productos.some((p) => !(Number(p.cantidad) > 0))) return 'Las cantidades deben ser mayores que cero.';
  if (d.productos.some((p) => !(Number(p.precioUnitario) > 0))) return 'El precio de compra debe ser mayor que cero.';
  return null;
}

// La fecha solo se pide al crear, porque al editar no se cambia.
function validarTrabajador(d, esNuevo) {
  if (vacio(d.nombre)) return 'El nombre del trabajador es obligatorio.';
  if (!vacio(d.telefono) && !telefonoValido(d.telefono)) return 'El teléfono debe tener 10 dígitos.';
  if (!vacio(d.correo) && !CORREO.test(d.correo)) return 'El correo no tiene un formato válido.';
  if (vacio(d.puesto) && !d.id_puesto) return 'El puesto es obligatorio.';
  if (!(Number(d.salario) >= 0)) return 'El salario debe ser igual o mayor que cero.';
  if (esNuevo && (vacio(d.fecha_contratacion) || isNaN(Date.parse(d.fecha_contratacion)))) {
    return 'La fecha de contratación no es válida.';
  }
  if (d.hora_entrada && d.hora_salida && d.hora_salida <= d.hora_entrada) {
    return 'La hora de salida debe ser posterior a la de entrada.';
  }
  return null;
}

// Al editar, la contraseña es opcional.
function validarUsuario(d, esNuevo) {
  const nombre = String(d.nombre_usuario ?? '');
  if (vacio(nombre)) return 'El nombre de usuario es obligatorio.';
  if (nombre !== nombre.trim()) return 'El nombre de usuario no puede empezar ni terminar con espacios.';
  if (!USUARIO.test(nombre)) return 'El usuario debe tener de 4 a 30 caracteres: letras, números, punto o guion bajo.';
  if (!['admin', 'cajero'].includes(d.rol)) return 'El rol no es válido.';
  if (esNuevo && vacio(d.contrasena)) return 'La contraseña es obligatoria.';
  if (!vacio(d.contrasena) && !CONTRASENA.test(d.contrasena)) {
    return 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
  }
  return null;
}

module.exports = { validarProducto, validarCliente, validarProveedor, validarCompra, validarTrabajador, validarUsuario };
