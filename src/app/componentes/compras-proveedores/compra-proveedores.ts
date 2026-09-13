// Proveedores, órdenes de compra y recepción de productos contra el backend real.
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DatosProveedor, FormularioProveedor } from './modales/formulario-proveedor/formulario-proveedor';
import { DatosOrdenCompra, FormularioOrdenCompra, LineaOrdenCompra } from './modales/formulario-orden-compra/formulario-orden-compra';
import { InventarioService } from '../compartidos/servicios/inventario.service';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';
import { API_URL } from '../compartidos/servicios/api.config';

interface Proveedor {
  id_proveedor?: number;
  nombre: string;
  telefono: string;
  correo: string;
}

interface OrdenCompra {
  id_compra?: number;
  folio: string;
  fecha: Date;
  proveedor: string;
  items: LineaOrdenCompra[];
  total: number;
  estado: 'recibida' | 'pendiente';
}

interface ProveedorBackend {
  id_proveedor: number;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  estado: string;
}

interface CompraBackend {
  id_compra: number;
  id_proveedor: number;
  fecha: string;
  productos: LineaOrdenCompra[] | string;
  total: string | number;
  estado: 'recibida' | 'pendiente';
}

@Component({
  imports: [DatePipe, FormularioProveedor, FormularioOrdenCompra],
  selector: 'app-compra-proveedores',
  styleUrl: './compra-proveedores.css',
  templateUrl: './compra-proveedores.html',
})
export class CompraProveedores {
  private readonly urlProveedor = `${API_URL}/proveedor`;
  private readonly urlCompra = `${API_URL}/compra`;

  constructor(
    private http: HttpClient,
    private inventarioService: InventarioService,
    private contabilidadService: ContabilidadService,
  ) {
    this.cargarProveedores();
  }

  proveedores: Proveedor[] = [];
  ordenes: OrdenCompra[] = [];

  mostrarFormularioProveedor = false;
  mostrarFormularioOrden = false;

  private cargarProveedores(): void {
    this.http.get<ProveedorBackend[]>(this.urlProveedor).subscribe((datos) => {
      this.proveedores = datos.map((p) => ({ id_proveedor: p.id_proveedor, nombre: p.nombre, telefono: p.telefono ?? '—', correo: p.correo ?? '—' }));
      this.cargarOrdenes();
    });
  }

  private cargarOrdenes(): void {
    this.http.get<CompraBackend[]>(this.urlCompra).subscribe((datos) => {
      this.ordenes = datos.map((c) => this.ordenDesdeBackend(c));
    });
  }

  private ordenDesdeBackend(c: CompraBackend): OrdenCompra {
    const proveedor = this.proveedores.find((p) => p.id_proveedor === c.id_proveedor);
    const items = typeof c.productos === 'string' ? JSON.parse(c.productos) : c.productos;
    return {
      id_compra: c.id_compra,
      folio: `OC-${String(c.id_compra).padStart(4, '0')}`,
      fecha: new Date(c.fecha),
      proveedor: proveedor?.nombre ?? '—',
      items: items ?? [],
      total: Number(c.total),
      estado: c.estado,
    };
  }

  // Obtiene los nombres para el selector de proveedores.
  get nombresProveedores(): string[] {
    return this.proveedores.map((p) => p.nombre);
  }

  // Guarda el proveedor en el backend y cierra el formulario.
  agregarProveedor(datos: DatosProveedor): void {
    this.http
      .post<ProveedorBackend>(this.urlProveedor, {
        nombre: datos.nombre,
        telefono: datos.telefono || null,
        correo: datos.correo || null,
        direccion: null,
        estado: 'activo',
      })
      .subscribe((creado) => {
        this.proveedores = [...this.proveedores, { id_proveedor: creado.id_proveedor, nombre: creado.nombre, telefono: creado.telefono ?? '—', correo: creado.correo ?? '—' }];
      });
    this.mostrarFormularioProveedor = false;
  }

  // Calcula el total y guarda la orden de compra en el backend.
  agregarOrdenCompra(datos: DatosOrdenCompra): void {
    const proveedor = this.proveedores.find((p) => p.nombre === datos.proveedor);
    if (!proveedor?.id_proveedor) return;
    const total = datos.items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);

    this.http
      .post<CompraBackend>(this.urlCompra, {
        id_proveedor: proveedor.id_proveedor,
        productos: datos.items,
        total,
        estado: datos.estado,
      })
      .subscribe((creada) => {
        this.ordenes = [this.ordenDesdeBackend(creada), ...this.ordenes];
      });
    this.mostrarFormularioOrden = false;
  }

  // Recibe la compra una sola vez y registra inventario y egreso.
  marcarRecibida(orden: OrdenCompra): void {
    if (orden.estado === 'recibida' || !orden.id_compra) return;
    orden.estado = 'recibida';
    this.http.put(`${this.urlCompra}/${orden.id_compra}`, {
      id_proveedor: this.proveedores.find((p) => p.nombre === orden.proveedor)?.id_proveedor,
      productos: orden.items,
      total: orden.total,
      estado: 'recibida',
    }).subscribe();
    this.inventarioService.registrarEntradaPorCompra(orden.items, orden.proveedor);
    this.contabilidadService.registrarEgreso(`Compra a ${orden.proveedor} (${orden.folio})`, orden.total, 'Insumos y proveedores', orden.id_compra);
  }
}
