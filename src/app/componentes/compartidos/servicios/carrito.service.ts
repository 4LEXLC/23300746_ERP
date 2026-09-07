import { Injectable } from '@angular/core';
import { Producto } from '../../punto-venta/componentes/producto-card/producto-card';
import { ItemCarrito } from '../../punto-venta/componentes/carrito-item/carrito-item';
import { InventarioService } from './inventario.service';
import { VentasService } from './ventas.service';
import { ContabilidadService } from './contabilidad.service';

export interface MetodoPago { id: 'efectivo' | 'tarjeta'; etiqueta: string; }
const IVA = 0.16;

@Injectable({ providedIn: 'root' })
export class CarritoService {
  constructor(
    private inventarioService: InventarioService,
    private ventasService: VentasService,
    private contabilidadService: ContabilidadService,
  ) {}

  items: ItemCarrito[] = [];
  solicitaFactura = false;
  metodoPago: MetodoPago['id'] = 'tarjeta';
  ventaConfirmada = false;

  ultimoFolio = '';

  get cantidadTotal(): number {
    return this.items.reduce((suma, i) => suma + i.cantidad, 0);
  }

  get subtotal(): number {
    return this.items.reduce((suma, i) => suma + i.producto.precio * i.cantidad, 0);
  }

  get iva(): number {
    return this.subtotal * IVA;
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  cantidadDe(producto: Producto): number {
    return this.items.find((i) => i.producto.nombre === producto.nombre)?.cantidad ?? 0;
  }

  agregar(producto: Producto): void {
    const existe = this.items.some((i) => i.producto.nombre === producto.nombre);
    this.items = existe
      ? this.items.map((i) => (i.producto.nombre === producto.nombre ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...this.items, { producto, cantidad: 1 }];
  }

  incrementar(item: ItemCarrito): void {
    this.items = this.items.map((i) =>
      i.producto.nombre === item.producto.nombre ? { ...i, cantidad: i.cantidad + 1 } : i,
    );
  }

  decrementar(item: ItemCarrito): void {
    const nuevaCantidad = item.cantidad - 1;
    this.items =
      nuevaCantidad <= 0
        ? this.items.filter((i) => i.producto.nombre !== item.producto.nombre)
        : this.items.map((i) => (i.producto.nombre === item.producto.nombre ? { ...i, cantidad: nuevaCantidad } : i));
  }

  /** Confirmar venta: verifica existencia, la reserva (descuenta) y calcula subtotal/impuestos/total. */
  confirmarVenta(): boolean {
    if (!this.items.length) return false;

    // Ya estaba confirmada (p. ej. doble clic o el usuario volvió sin cambiar el pedido): no reservar dos veces.
    if (this.ventaConfirmada) return true;

    const stockInsuficiente = this.items.some(
      (item) => !this.inventarioService.verificarExistencia(item.producto.nombre, item.cantidad),
    );
    if (stockInsuficiente) return false;

    for (const item of this.items) {
      this.inventarioService.registrarVenta(item.producto.nombre, item.cantidad);
    }

    this.ventaConfirmada = true;
    return true;
  }

  /** Cancela una confirmación previa (p. ej. el usuario vuelve a editar el pedido) y libera la reserva de existencia. */
  cancelarConfirmacion(): void {
    if (!this.ventaConfirmada) return;
    for (const item of this.items) {
      this.inventarioService.liberarReserva(item.producto.nombre, item.cantidad);
    }
    this.ventaConfirmada = false;
  }

  /** Procesar pago: interactúa con la pasarela de pago y registra la venta ya confirmada. */
  procesarPago(): boolean {
    if (!this.ventaConfirmada) return false;

    const metodoEtiqueta = this.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta';
    const venta = this.ventasService.registrarVenta(this.cantidadTotal, this.total, metodoEtiqueta, this.solicitaFactura);
    this.contabilidadService.registrarIngreso(`Venta ${venta.folio}`, this.total);

    this.ultimoFolio = venta.folio;
    return true;
  }

  vaciar(): void {
    this.items = [];
    this.solicitaFactura = false;
    this.metodoPago = 'tarjeta';
    this.ventaConfirmada = false;
    this.ultimoFolio = '';
  }
}
