// Proveedores, órdenes de compra y recepción de productos.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DatosProveedor, FormularioProveedor } from './modales/formulario-proveedor/formulario-proveedor';
import { DatosOrdenCompra, FormularioOrdenCompra, LineaOrdenCompra } from './modales/formulario-orden-compra/formulario-orden-compra';
import { InventarioService } from '../compartidos/servicios/inventario.service';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';

interface Proveedor {
  nombre: string;
  telefono: string;
  correo: string;
}

interface OrdenCompra {
  folio: string;
  fecha: Date;
  proveedor: string;
  items: LineaOrdenCompra[];
  total: number;
  estado: 'recibida' | 'pendiente';
}

@Component({
  imports: [DatePipe, FormularioProveedor, FormularioOrdenCompra],
  selector: 'app-compra-proveedores',
  styleUrl: './compra-proveedores.css',
  templateUrl: './compra-proveedores.html',
})
export class CompraProveedores {
  constructor(private inventarioService: InventarioService, private contabilidadService: ContabilidadService) {}

  proveedores: Proveedor[] = [
    { nombre: 'Café Origen S.A. de C.V.', telefono: '555-201-3344', correo: 'ventas@cafeorigen.mx' },
    { nombre: 'Distribuidora Láctea del Bajío', telefono: '555-118-2290', correo: 'pedidos@lacteosbajio.mx' },
    { nombre: 'Panificadora El Trigal', telefono: '555-330-7712', correo: 'contacto@eltrigal.mx' },
    { nombre: 'Empaques y Desechables MX', telefono: '555-402-9981', correo: 'ventas@empaquesmx.com' },
  ];

  ordenes: OrdenCompra[] = [
    {
      folio: 'OC-0001',
      fecha: new Date('2026-08-28'),
      proveedor: 'Café Origen S.A. de C.V.',
      items: [
        { nombre: 'Café americano', cantidad: 50, precioUnitario: 19.2 },
        { nombre: 'Capuchino', cantidad: 40, precioUnitario: 25.2 },
      ],
      total: 4250,
      estado: 'recibida',
    },
    {
      folio: 'OC-0002',
      fecha: new Date('2026-09-02'),
      proveedor: 'Distribuidora Láctea del Bajío',
      items: [{ nombre: 'Latte', cantidad: 30, precioUnitario: 24 }],
      total: 1860,
      estado: 'pendiente',
    },
  ];

  mostrarFormularioProveedor = false;
  mostrarFormularioOrden = false;

  // Obtiene los nombres para el selector de proveedores.
  get nombresProveedores(): string[] {
    return this.proveedores.map((p) => p.nombre);
  }

  // Guarda el proveedor y cierra el formulario.
  agregarProveedor(datos: DatosProveedor): void {
    this.proveedores.push({
      nombre: datos.nombre,
      telefono: datos.telefono || '—',
      correo: datos.correo || '—',
    });
    this.mostrarFormularioProveedor = false;
  }

  // Calcula el total y guarda la orden de compra.
  agregarOrdenCompra(datos: DatosOrdenCompra): void {
    const consecutivo = (this.ordenes.length + 1).toString().padStart(4, '0');
    const total = datos.items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);
    this.ordenes.push({
      folio: `OC-${consecutivo}`,
      fecha: datos.fecha ? new Date(datos.fecha) : new Date(),
      proveedor: datos.proveedor,
      items: datos.items,
      total,
      estado: datos.estado,
    });
    this.mostrarFormularioOrden = false;
  }

  // Recibe la compra una sola vez y registra inventario y egreso.
  marcarRecibida(orden: OrdenCompra): void {
    if (orden.estado === 'recibida') return;
    orden.estado = 'recibida';
    this.inventarioService.registrarEntradaPorCompra(orden.items, orden.proveedor);
    this.contabilidadService.registrarEgreso(`Compra a ${orden.proveedor} (${orden.folio})`, orden.total, 'Insumos y proveedores');
  }
}
