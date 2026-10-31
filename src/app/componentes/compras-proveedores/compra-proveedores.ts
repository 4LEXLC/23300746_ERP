// Proveedores, órdenes de compra y recepción de productos.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormularioProveedor } from './modales/formulario-proveedor/formulario-proveedor';
import { DetalleOrden } from './modales/detalle-orden/detalle-orden';
import { DatosOrdenCompra, FormularioOrdenCompra } from './modales/formulario-orden-compra/formulario-orden-compra';
import { InventarioService } from '../compartidos/servicios/inventario.service';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';
import { ComprasService, DatosProveedor, OrdenCompra, Proveedor } from '../compartidos/servicios/compras.service';
import { AvisoService } from '../compartidos/servicios/aviso.service';

@Component({
  imports: [DatePipe, FormularioProveedor, FormularioOrdenCompra, DetalleOrden],
  selector: 'app-compra-proveedores',
  styleUrl: './compra-proveedores.css',
  templateUrl: './compra-proveedores.html',
})
export class CompraProveedores {
  constructor(
    private comprasService: ComprasService,
    private inventarioService: InventarioService,
    private contabilidadService: ContabilidadService,
    private aviso: AvisoService,
  ) {
    this.comprasService.cargar();
  }

  // Las listas viven en el servicio.
  get proveedores() {
    return this.comprasService.proveedores;
  }

  get ordenesPendientes(): number {
    return this.ordenes().filter((o) => o.estado === 'pendiente').length;
  }

  get ordenes() {
    return this.comprasService.ordenes;
  }

  mostrarFormularioProveedor = false;
  mostrarFormularioOrden = false;
  ordenDetalle: OrdenCompra | null = null;
  proveedorEnEdicion: Proveedor | null = null;
  datosProveedorEdicion: DatosProveedor | null = null;

  // Solo los proveedores activos salen al hacer una orden.
  get nombresProveedores(): string[] {
    return this.proveedores().filter((p) => p.estado === 'activo').map((p) => p.nombre);
  }

  abrirNuevoProveedor(): void {
    this.proveedorEnEdicion = null;
    this.datosProveedorEdicion = null;
    this.mostrarFormularioProveedor = true;
  }

  editarProveedor(proveedor: Proveedor): void {
    this.proveedorEnEdicion = proveedor;
    this.datosProveedorEdicion = { nombre: proveedor.nombre, telefono: proveedor.telefono, correo: proveedor.correo, notas: proveedor.direccion };
    this.mostrarFormularioProveedor = true;
  }

  guardarProveedor(datos: DatosProveedor): void {
    const peticion = this.proveedorEnEdicion
      ? this.comprasService.editarProveedor(this.proveedorEnEdicion, datos)
      : this.comprasService.agregarProveedor(datos);
    peticion.subscribe({
      next: () => this.aviso.exito('Proveedor guardado.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo guardar el proveedor.'),
    });
    this.mostrarFormularioProveedor = false;
  }

  cambiarEstadoProveedor(proveedor: Proveedor): void {
    this.comprasService.cambiarEstadoProveedor(proveedor).subscribe({
      next: (p) => this.aviso.exito(p.estado === 'activo' ? 'Proveedor activado.' : 'Proveedor desactivado.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo cambiar el estado del proveedor.'),
    });
  }

  agregarOrdenCompra(datos: DatosOrdenCompra): void {
    const proveedor = this.proveedores().find((p) => p.nombre === datos.proveedor);
    if (!proveedor) return;
    this.comprasService.agregarOrden(proveedor.id_proveedor, datos.items).subscribe({
      next: () => this.aviso.exito('Orden de compra registrada.'),
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo registrar la orden.'),
    });
    this.mostrarFormularioOrden = false;
  }

  // Recibe la compra una sola vez y registra inventario y egreso.
  marcarRecibida(orden: OrdenCompra): void {
    if (orden.estado === 'recibida') return;
    this.comprasService.marcarRecibida(orden).subscribe({
      next: () => {
        this.inventarioService.registrarEntradaPorCompra(orden.items, orden.proveedor);
        this.contabilidadService.registrarEgreso(`Compra a ${orden.proveedor} (${orden.folio})`, orden.total, 'Insumos y proveedores', orden.id_compra);
        this.aviso.exito('Compra recibida y sumada al inventario.');
      },
      error: (e) => this.aviso.error(e.error?.mensaje ?? 'No se pudo marcar la compra como recibida.'),
    });
  }
}
