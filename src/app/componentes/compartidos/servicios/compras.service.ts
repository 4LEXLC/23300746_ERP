// Proveedores y órdenes de compra contra el backend.
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_URL } from './api.config';

export interface DatosProveedor {
  nombre: string;
  telefono: string;
  correo: string;
  notas: string;
}

export interface LineaOrdenCompra {
  id_producto?: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
}

export interface OrdenCompra {
  id_compra: number;
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

interface PrecioProveedor {
  id_producto: number;
  id_proveedor: number;
  precio_compra: string | number;
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly urlProveedor = `${API_URL}/proveedor`;
  private readonly urlCompra = `${API_URL}/compra`;
  private readonly urlPrecios = `${API_URL}/producto_proveedor`;

  proveedores = signal<Proveedor[]>([]);
  ordenes = signal<OrdenCompra[]>([]);
  precios = signal<PrecioProveedor[]>([]);

  constructor(private http: HttpClient) {}

  // Primero los proveedores, porque las órdenes muestran su nombre.
  cargar(): void {
    this.http.get<ProveedorBackend[]>(this.urlProveedor).subscribe((datos) => {
      this.proveedores.set(datos.map((p) => this.proveedorAFrontend(p)));
      this.http.get<CompraBackend[]>(this.urlCompra).subscribe((compras) => {
        this.ordenes.set(compras.map((c) => this.ordenAFrontend(c)));
      });
    });
    this.cargarPrecios();
  }

  private cargarPrecios(): void {
    this.http.get<PrecioProveedor[]>(this.urlPrecios).subscribe((datos) => this.precios.set(datos));
  }

  private proveedorAFrontend(p: ProveedorBackend): Proveedor {
    return {
      id_proveedor: p.id_proveedor,
      nombre: p.nombre,
      telefono: p.telefono ?? '',
      correo: p.correo ?? '',
      direccion: p.direccion ?? '',
      estado: p.estado === 'inactivo' ? 'inactivo' : 'activo',
    };
  }

  private ordenAFrontend(c: CompraBackend): OrdenCompra {
    const items = typeof c.productos === 'string' ? JSON.parse(c.productos) : c.productos;
    return {
      id_compra: c.id_compra,
      folio: `OC-${String(c.id_compra).padStart(4, '0')}`,
      fecha: new Date(c.fecha),
      proveedor: this.proveedores().find((p) => p.id_proveedor === c.id_proveedor)?.nombre ?? '—',
      items: items ?? [],
      total: Number(c.total),
      estado: c.estado,
    };
  }

  private proveedorABackend(datos: DatosProveedor, estado: Proveedor['estado']) {
    return {
      nombre: datos.nombre.trim(),
      telefono: datos.telefono || null,
      correo: datos.correo || null,
      direccion: datos.notas || null,
      estado,
    };
  }

  private reemplazarProveedor(editado: Proveedor): void {
    this.proveedores.update((lista) => lista.map((p) => (p.id_proveedor === editado.id_proveedor ? editado : p)));
  }

  agregarProveedor(datos: DatosProveedor): Observable<Proveedor> {
    return this.http.post<ProveedorBackend>(this.urlProveedor, this.proveedorABackend(datos, 'activo')).pipe(
      map((p) => this.proveedorAFrontend(p)),
      tap((nuevo) => this.proveedores.update((lista) => [...lista, nuevo])),
    );
  }

  // Editar.
  editarProveedor(proveedor: Proveedor, datos: DatosProveedor): Observable<Proveedor> {
    return this.http
      .put<ProveedorBackend>(`${this.urlProveedor}/${proveedor.id_proveedor}`, this.proveedorABackend(datos, proveedor.estado))
      .pipe(map((p) => this.proveedorAFrontend(p)), tap((editado) => this.reemplazarProveedor(editado)));
  }

  // Desactivar sin borrar, para que sus compras viejas sigan ligadas.
  cambiarEstadoProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const datos: DatosProveedor = { nombre: proveedor.nombre, telefono: proveedor.telefono, correo: proveedor.correo, notas: proveedor.direccion };
    const estado = proveedor.estado === 'activo' ? 'inactivo' : 'activo';
    return this.http
      .put<ProveedorBackend>(`${this.urlProveedor}/${proveedor.id_proveedor}`, this.proveedorABackend(datos, estado))
      .pipe(map((p) => this.proveedorAFrontend(p)), tap((editado) => this.reemplazarProveedor(editado)));
  }

  agregarOrden(idProveedor: number, items: LineaOrdenCompra[]): Observable<OrdenCompra> {
    const total = items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);
    return this.http.post<CompraBackend>(this.urlCompra, { id_proveedor: idProveedor, productos: items, total, estado: 'pendiente' }).pipe(
      map((c) => this.ordenAFrontend(c)),
      tap((orden) => {
        this.ordenes.update((lista) => [orden, ...lista]);
        this.cargarPrecios();
      }),
    );
  }

  marcarRecibida(orden: OrdenCompra): Observable<unknown> {
    const idProveedor = this.proveedores().find((p) => p.nombre === orden.proveedor)?.id_proveedor;
    return this.http
      .put(`${this.urlCompra}/${orden.id_compra}`, { id_proveedor: idProveedor, productos: orden.items, total: orden.total, estado: 'recibida' })
      .pipe(tap(() => this.ordenes.update((lista) => lista.map((o) => (o.id_compra === orden.id_compra ? { ...o, estado: 'recibida' as const } : o)))));
  }

  // Último precio de compra de ese producto con ese proveedor.
  precioDe(nombreProveedor: string, idProducto: number | undefined): number | null {
    const proveedor = this.proveedores().find((p) => p.nombre === nombreProveedor);
    const registro = this.precios().find((r) => r.id_producto === idProducto && r.id_proveedor === proveedor?.id_proveedor);
    return registro ? Number(registro.precio_compra) : null;
  }
}
