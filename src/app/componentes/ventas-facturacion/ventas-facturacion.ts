// Historial de ventas, facturas y clientes.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormularioCliente } from '../compartidos/modales/formulario-cliente/formulario-cliente';
import { Cliente, DatosCliente, PagoBackend, Venta, VentasService } from '../compartidos/servicios/ventas.service';
import { AvisoService } from '../compartidos/servicios/aviso.service';
import { DetalleVenta } from './modales/detalle-venta/detalle-venta';

@Component({
  imports: [DatePipe, FormsModule, FormularioCliente, DetalleVenta],
  selector: 'app-ventas-facturacion',
  styleUrl: './ventas-facturacion.css',
  templateUrl: './ventas-facturacion.html',
})
export class VentasFacturacion {
  constructor(
    public ventasService: VentasService,
    private aviso: AvisoService,
  ) {
    this.ventasService.cargar();
  }

  pestanaActiva: 'ventas' | 'facturas' | 'pagos' | 'clientes' = 'ventas';
  diasPeriodo = 7;
  periodos = [
    { dias: 1, etiqueta: 'Hoy' },
    { dias: 7, etiqueta: 'Últimos 7 días' },
    { dias: 30, etiqueta: 'Últimos 30 días' },
    { dias: 0, etiqueta: 'Todas' },
  ];
  hoy = new Date();

  get ventas(): Venta[] {
    return this.ventasService.ventas();
  }

  // Ventas dentro del periodo elegido (0 = todas).
  get ventasPeriodo(): Venta[] {
    if (!this.diasPeriodo) return this.ventas;
    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() - (this.diasPeriodo - 1));
    return this.ventas.filter((v) => v.fecha >= limite);
  }

  // En la pestaña Facturas salen las vigentes y las canceladas.
  get ventasMostradas(): Venta[] {
    return this.pestanaActiva === 'facturas'
      ? this.ventasPeriodo.filter((v) => v.factura !== 'sin-facturar')
      : this.ventasPeriodo;
  }

  // Lista de pagos del periodo, del más reciente al más antiguo.
  get pagosPeriodo(): PagoBackend[] {
    return this.ventasPeriodo
      .map((v) => v.pago)
      .filter((p): p is PagoBackend => !!p)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  folioDeVenta(idVenta: number): string {
    return `V-${idVenta}`;
  }

  get totalVentas(): number {
    return this.ventasPeriodo.length;
  }

  get totalFacturadas(): number {
    return this.ventasPeriodo.filter((v) => v.factura === 'emitida').length;
  }

  mostrarFormularioCliente = false;
  ventaEnFactura: Venta | null = null;
  ventaDetalle: Venta | null = null;
  ultimaFactura = '';
  subtotalFacturado = 0;
  ivaFacturado = 0;
  totalFacturado = 0;

  facturar(venta: Venta): void {
    this.ventaEnFactura = venta;
    this.mostrarFormularioCliente = true;
  }

  generarFactura(datos: DatosCliente): void {
    const venta = this.ventaEnFactura;
    if (!venta) return;
    this.ventasService.generarFactura(venta, datos).subscribe({
      next: (facturada) => {
        this.ultimaFactura = facturada.folioFactura ?? '';
        this.subtotalFacturado = venta.subtotal;
        this.ivaFacturado = venta.iva;
        this.totalFacturado = venta.total;
        this.aviso.exito(`Factura ${this.ultimaFactura} generada y enviada por correo.`);
      },
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo generar la factura.'),
    });
    this.ventaEnFactura = null;
    this.mostrarFormularioCliente = false;
  }

  // Cancela sin borrar.
  cancelarFactura(venta: Venta): void {
    this.ventasService.cancelarFactura(venta).subscribe({
      next: () => this.aviso.exito(`Factura ${venta.folioFactura} cancelada.`),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo cancelar la factura.'),
    });
  }

  // ---- clientes ----
  clienteEnEdicion: Cliente | null = null;
  datosClienteEdicion: DatosCliente | null = null;

  verClientes(): void {
    this.pestanaActiva = 'clientes';
    this.ventasService.cargarClientes();
  }

  editarCliente(cliente: Cliente): void {
    this.clienteEnEdicion = cliente;
    this.datosClienteEdicion = {
      nombre: cliente.nombre,
      rfc: cliente.rfc,
      codigoPostal: cliente.codigo_postal,
      regimenFiscal: cliente.regimen_fiscal,
      correo: cliente.correo ?? '',
    };
  }

  cerrarEdicionCliente(): void {
    this.clienteEnEdicion = null;
    this.datosClienteEdicion = null;
  }

  guardarCliente(datos: DatosCliente): void {
    const cliente = this.clienteEnEdicion;
    if (!cliente) return;
    this.ventasService.actualizarCliente(cliente.id_cliente, datos).subscribe({
      next: () => this.aviso.exito('Cliente actualizado.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo actualizar el cliente.'),
    });
    this.cerrarEdicionCliente();
  }
}
