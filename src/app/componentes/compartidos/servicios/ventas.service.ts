// Ventas reales contra las tablas venta, pago, factura y cliente.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { API_URL } from './api.config';
import { DatosCliente } from '../modales/formulario-cliente/formulario-cliente';

export interface Venta {
  id_venta: number;
  folio: string;
  fecha: Date;
  productos: number;
  subtotal: number;
  iva: number;
  total: number;
  metodoPago: string;
  factura: 'emitida' | 'sin-facturar';
  folioFactura?: string;
  id_factura?: number;
}

interface ItemVenta {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface VentaBackend {
  id_venta: number;
  id_trabajador: number | null;
  fecha: string;
  productos: ItemVenta[] | string;
  subtotal: string | number;
  iva: string | number;
  total: string | number;
  estado: string;
}

interface PagoBackend {
  id_pago: number;
  id_venta: number;
  metodo_pago: string;
}

interface FacturaBackend {
  id_factura: number;
  id_venta: number;
  id_cliente: number;
  folio: string;
  estado: string;
}

interface ClienteBackend {
  id_cliente: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly urlVenta = `${API_URL}/venta`;
  private readonly urlPago = `${API_URL}/pago`;
  private readonly urlFactura = `${API_URL}/factura`;
  private readonly urlCliente = `${API_URL}/cliente`;

  ventas: Venta[] = [];

  constructor(private http: HttpClient) {
    this.cargarVentas();
  }

  private cargarVentas(): void {
    forkJoin({
      ventas: this.http.get<VentaBackend[]>(this.urlVenta),
      pagos: this.http.get<PagoBackend[]>(this.urlPago),
      facturas: this.http.get<FacturaBackend[]>(this.urlFactura),
    }).subscribe(({ ventas, pagos, facturas }) => {
      this.ventas = ventas.map((v) => this.aFrontend(v, pagos, facturas));
    });
  }

  private aFrontend(v: VentaBackend, pagos: PagoBackend[], facturas: FacturaBackend[]): Venta {
    const items = typeof v.productos === 'string' ? JSON.parse(v.productos) : v.productos;
    const pago = pagos.find((p) => p.id_venta === v.id_venta);
    const factura = facturas.find((f) => f.id_venta === v.id_venta);
    return {
      id_venta: v.id_venta,
      folio: `V-${v.id_venta}`,
      fecha: new Date(v.fecha),
      productos: (items ?? []).length,
      subtotal: Number(v.subtotal),
      iva: Number(v.iva),
      total: Number(v.total),
      metodoPago: pago?.metodo_pago ?? '—',
      factura: factura ? 'emitida' : 'sin-facturar',
      folioFactura: factura?.folio,
      id_factura: factura?.id_factura,
    };
  }

  // Obtiene la cantidad de ventas registradas.
  get totalVentas(): number {
    return this.ventas.length;
  }

  // Cuenta las ventas con factura emitida.
  get totalFacturadas(): number {
    return this.ventas.filter((v) => v.factura === 'emitida').length;
  }

  // Crea la venta, registra su pago y actualiza el historial local.
  registrarVenta(items: ItemVenta[], subtotal: number, iva: number, total: number, metodoPago: string): Observable<Venta> {
    return this.http
      .post<VentaBackend>(this.urlVenta, { id_trabajador: null, productos: items, subtotal, iva, total, estado: 'completada' })
      .pipe(
        switchMap((venta) =>
          this.http
            .post<PagoBackend>(this.urlPago, { id_venta: venta.id_venta, metodo_pago: metodoPago, referencia_transaccion: null, monto: total, estado: 'completado' })
            .pipe(map((pago) => this.aFrontend(venta, [pago], []))),
        ),
        tap((venta) => {
          this.ventas = [venta, ...this.ventas];
        }),
      );
  }

  // Crea el cliente y su factura ligada a la venta.
  generarFactura(venta: Venta, datosCliente: DatosCliente): Observable<Venta> {
    return this.http
      .post<ClienteBackend>(this.urlCliente, {
        nombre: datosCliente.nombre,
        razon_social: null,
        rfc: datosCliente.rfc || null,
        correo: datosCliente.correo || null,
        codigo_postal: datosCliente.codigoPostal || null,
        regimen_fiscal: datosCliente.regimenFiscal || null,
      })
      .pipe(
        switchMap((cliente) => {
          const folio = `FAC-${String(this.totalFacturadas + 1).padStart(4, '0')}`;
          return this.http.post<FacturaBackend>(this.urlFactura, {
            id_venta: venta.id_venta,
            id_cliente: cliente.id_cliente,
            folio,
            estado: 'vigente',
          });
        }),
        tap((factura) => {
          this.ventas = this.ventas.map((v) =>
            v.id_venta === venta.id_venta ? { ...v, factura: 'emitida', folioFactura: factura.folio, id_factura: factura.id_factura } : v,
          );
        }),
        map((factura) => ({ ...venta, factura: 'emitida' as const, folioFactura: factura.folio, id_factura: factura.id_factura })),
      );
  }

  // Elimina la factura de la venta.
  cancelarFactura(venta: Venta): void {
    if (!venta.id_factura) return;
    this.http.delete(`${this.urlFactura}/${venta.id_factura}`).subscribe(() => {
      this.ventas = this.ventas.map((v) =>
        v.id_venta === venta.id_venta ? { ...v, factura: 'sin-facturar', folioFactura: undefined, id_factura: undefined } : v,
      );
    });
  }
}
