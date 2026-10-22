// Tipos de los datos que viajan entre el frontend y el backend en el pago con PayPal.

// Producto del carrito que se manda al backend para crear la orden.
export interface ProductoCarrito {
  id: number;
  cantidad: number;
}

// Orden creada en PayPal.
export interface OrdenPaypal {
  id: string;
  total: string;
}

// Respuesta del backend después de capturar el pago.
export interface ResultadoPago {
  mensaje: string;
  orderId: string;
  captureId: string;
  estado: string;
}
