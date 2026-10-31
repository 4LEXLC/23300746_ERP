// Ventas, pagos, facturas y clientes contra el backend.
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { API_URL } from './api.config';

export interface DatosCliente {
  nombre: string;
  rfc: string;
  codigoPostal: string;
  regimenFiscal: string;
  correo: string;
}

export interface ItemVenta {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PagoBackend {
  id_pago: number;
  id_venta: number;
  metodo_pago: string;
  referencia_transaccion: string | null;
  monto: string | number;
  estado: string;
  fecha: string;
}

export interface Venta {
  id_venta: number;
  folio: string;
  fecha: Date;
  cajero: string;
  items: ItemVenta[];
  productos: number;
  subtotal: number;
  iva: number;
  total: number;
  metodoPago: string;
  pago?: PagoBackend;
  factura: 'emitida' | 'cancelada' | 'sin-facturar';
  folioFactura?: string;
  id_factura?: number;
  fechaFactura?: string;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  rfc: string;
  correo: string | null;
  codigo_postal: string;
  regimen_fiscal: string;
}

interface VentaBackend {
  id_venta: number;
  id_trabajador: number | null;
  cajero: string | null;
  fecha: string;
  productos: ItemVenta[] | string;
  subtotal: string | number;
  iva: string | number;
  total: string | number;
  estado: string;
}

interface FacturaBackend {
  id_factura: number;
  id_venta: number;
  id_cliente: number;
  folio: string;
  fecha_emision: string;
  estado: 'vigente' | 'cancelada';
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly urlVenta = `${API_URL}/venta`;
  private readonly urlPago = `${API_URL}/pago`;
  private readonly urlFactura = `${API_URL}/factura`;
  private readonly urlCliente = `${API_URL}/cliente`;

  ventas = signal<Venta[]>([]);
  clientes = signal<Cliente[]>([]);

  constructor(private http: HttpClient) {}

  // Solo las pantallas del administrador piden el historial; el cajero no lo consulta al entrar.
  cargar(): void {
    forkJoin({
      ventas: this.http.get<VentaBackend[]>(this.urlVenta),
      pagos: this.http.get<PagoBackend[]>(this.urlPago),
      facturas: this.http.get<FacturaBackend[]>(this.urlFactura),
    }).subscribe(({ ventas, pagos, facturas }) => {
      // Una venta pendiente (sin pago guardado) no cuenta como venta.
      this.ventas.set(ventas.filter((v) => v.estado === 'completada').map((v) => this.aFrontend(v, pagos, facturas)));
    });
  }

  private aFrontend(v: VentaBackend, pagos: PagoBackend[], facturas: FacturaBackend[]): Venta {
    const items: ItemVenta[] = (typeof v.productos === 'string' ? JSON.parse(v.productos) : v.productos) ?? [];
    const pago = pagos.find((p) => p.id_venta === v.id_venta);
    // Si hay una factura vigente se usa esa; si no, la última cancelada.
    const facturasVenta = facturas.filter((f) => f.id_venta === v.id_venta);
    const factura = facturasVenta.find((f) => f.estado === 'vigente') ?? facturasVenta[facturasVenta.length - 1];
    return {
      id_venta: v.id_venta,
      folio: `V-${v.id_venta}`,
      fecha: new Date(v.fecha),
      cajero: v.cajero ?? '—',
      items,
      productos: items.length,
      subtotal: Number(v.subtotal),
      iva: Number(v.iva),
      total: Number(v.total),
      metodoPago: pago?.metodo_pago ?? '—',
      pago,
      factura: !factura ? 'sin-facturar' : factura.estado === 'cancelada' ? 'cancelada' : 'emitida',
      folioFactura: factura?.folio,
      id_factura: factura?.id_factura,
      fechaFactura: factura?.fecha_emision,
    };
  }

  get totalVentas(): number {
    return this.ventas().length;
  }

  get totalFacturadas(): number {
    return this.ventas().filter((v) => v.factura === 'emitida').length;
  }

  // Crea la venta y su pago. El cajero lo pone el servidor con el token.
  registrarVenta(items: ItemVenta[], subtotal: number, iva: number, total: number, metodoPago: string, referencia: string | null = null): Observable<Venta> {
    return this.http.post<VentaBackend>(this.urlVenta, { productos: items, subtotal, iva, total }).pipe(
      switchMap((venta) =>
        this.http
          .post<PagoBackend>(this.urlPago, { id_venta: venta.id_venta, metodo_pago: metodoPago, referencia_transaccion: referencia, monto: total })
          .pipe(map((pago) => this.aFrontend(venta, [pago], []))),
      ),
      tap((venta) => this.ventas.update((lista) => [venta, ...lista])),
    );
  }

  // Guarda el comprobante de la venta en la tabla ticket.
  crearTicket(idVenta: number, folio: string): Observable<unknown> {
    return this.http.post(`${API_URL}/ticket`, { id_venta: idVenta, folio });
  }

  // El servidor reutiliza al cliente si el RFC ya existe y genera el folio.
  generarFactura(venta: Venta, datosCliente: DatosCliente): Observable<Venta> {
    return this.http.post<Cliente>(this.urlCliente, this.clienteABackend(datosCliente)).pipe(
      switchMap((cliente) => this.http.post<FacturaBackend>(this.urlFactura, { id_venta: venta.id_venta, id_cliente: cliente.id_cliente })),
      map((factura): Venta => ({ ...venta, factura: 'emitida', folioFactura: factura.folio, id_factura: factura.id_factura, fechaFactura: factura.fecha_emision })),
      tap((facturada) => this.reemplazar(facturada)),
    );
  }

  // La factura se queda guardada como cancelada.
  cancelarFactura(venta: Venta): Observable<Venta> {
    return this.http.patch<FacturaBackend>(`${this.urlFactura}/${venta.id_factura}/cancelar`, {}).pipe(
      map((): Venta => ({ ...venta, factura: 'cancelada' })),
      tap((cancelada) => this.reemplazar(cancelada)),
    );
  }

  // Consulta y edición de clientes.
  cargarClientes(): void {
    this.http.get<Cliente[]>(this.urlCliente).subscribe((datos) => this.clientes.set(datos));
  }

  actualizarCliente(id: number, datos: DatosCliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.urlCliente}/${id}`, this.clienteABackend(datos)).pipe(
      tap((editado) => this.clientes.update((lista) => lista.map((c) => (c.id_cliente === id ? editado : c)))),
    );
  }

  private clienteABackend(d: DatosCliente) {
    return {
      nombre: d.nombre.trim(),
      razon_social: null,
      rfc: d.rfc.trim().toUpperCase(),
      correo: d.correo || null,
      codigo_postal: d.codigoPostal,
      regimen_fiscal: d.regimenFiscal,
    };
  }

  private reemplazar(venta: Venta): void {
    this.ventas.update((lista) => lista.map((v) => (v.id_venta === venta.id_venta ? venta : v)));
  }
}
