// Movimientos contables reales (tabla movimiento_financiero) y cálculos del resumen financiero.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';

export type CategoriaEgreso = 'Insumos y proveedores' | 'Nómina' | 'Servicios y renta';

export interface MovimientoContable {
  id_movimiento_financiero?: number;
  fecha: string;
  concepto: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  categoria?: CategoriaEgreso;
  id_venta?: number;
  id_compra?: number;
}

const COLORES_CATEGORIA: Record<CategoriaEgreso, string> = {
  'Insumos y proveedores': '#2a78d6',
  Nómina: '#eb6834',
  'Servicios y renta': '#1baf7a',
};

// La tabla movimiento_financiero no tiene columna "categoria", así que se codifica
// dentro de "concepto" como "[Categoría] texto" y se separa al leerla.
function codificarConcepto(concepto: string, categoria?: CategoriaEgreso): string {
  return categoria ? `[${categoria}] ${concepto}` : concepto;
}

function decodificarConcepto(concepto: string): { concepto: string; categoria?: CategoriaEgreso } {
  const coincidencia = concepto.match(/^\[(.+?)\]\s*(.*)$/);
  if (!coincidencia) return { concepto };
  const categoria = coincidencia[1] as CategoriaEgreso;
  if (!(categoria in COLORES_CATEGORIA)) return { concepto };
  return { concepto: coincidencia[2], categoria };
}

interface MovimientoBackend {
  id_movimiento_financiero: number;
  id_venta: number | null;
  id_compra: number | null;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  monto: string | number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ContabilidadService {
  private readonly apiUrl = `${API_URL}/movimiento_financiero`;

  movimientos: MovimientoContable[] = [];

  constructor(private http: HttpClient) {
    this.cargarMovimientos();
  }

  private cargarMovimientos(): void {
    this.http.get<MovimientoBackend[]>(this.apiUrl).subscribe((datos) => {
      this.movimientos = datos.map((m) => this.aFrontend(m));
    });
  }

  private aFrontend(m: MovimientoBackend): MovimientoContable {
    const { concepto, categoria } = decodificarConcepto(m.concepto);
    return {
      id_movimiento_financiero: m.id_movimiento_financiero,
      fecha: (m.fecha ?? '').toString().slice(0, 10),
      concepto,
      tipo: m.tipo,
      monto: Number(m.monto),
      categoria,
      id_venta: m.id_venta ?? undefined,
      id_compra: m.id_compra ?? undefined,
    };
  }

  // Agrega un ingreso con la fecha actual.
  registrarIngreso(concepto: string, monto: number, id_venta?: number): void {
    this.http
      .post<MovimientoBackend>(this.apiUrl, { tipo: 'ingreso', concepto, monto, id_venta })
      .subscribe((creado) => {
        this.movimientos = [this.aFrontend(creado), ...this.movimientos];
      });
  }

  // Agrega un egreso con su categoría.
  registrarEgreso(concepto: string, monto: number, categoria: CategoriaEgreso, id_compra?: number): void {
    this.http
      .post<MovimientoBackend>(this.apiUrl, {
        tipo: 'egreso',
        concepto: codificarConcepto(concepto, categoria),
        monto,
        id_compra,
      })
      .subscribe((creado) => {
        this.movimientos = [this.aFrontend(creado), ...this.movimientos];
      });
  }

  // Suma los movimientos de ingreso.
  get ingresos(): number {
    return this.movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  }

  // Obtiene el total de egresos.
  get egresosTotal(): number {
    return this.movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
  }

  // Resta los egresos a los ingresos.
  get utilidad(): number {
    return this.ingresos - this.egresosTotal;
  }

  // Separa el IVA incluido en los ingresos.
  get ivaRecaudado(): number {
    return this.ingresos - this.ingresos / 1.16;
  }

  // Obtiene los indicadores financieros.
  get kpis(): { etiqueta: string; valor: number }[] {
    return [
      { etiqueta: 'Ingresos', valor: this.ingresos },
      { etiqueta: 'Egresos', valor: this.egresosTotal },
      { etiqueta: 'Utilidad', valor: this.utilidad },
      { etiqueta: 'IVA recaudado', valor: this.ivaRecaudado },
    ];
  }

  // Agrupa los gastos y calcula su porcentaje.
  get egresosPorCategoria(): { nombre: string; color: string; porcentaje: number; monto: number }[] {
    const categorias: CategoriaEgreso[] = ['Insumos y proveedores', 'Nómina', 'Servicios y renta'];
    const total = this.egresosTotal || 1;
    return categorias.map((nombre) => {
      const monto = this.movimientos
        .filter((m) => m.tipo === 'egreso' && m.categoria === nombre)
        .reduce((s, m) => s + m.monto, 0);
      return { nombre, color: COLORES_CATEGORIA[nombre], porcentaje: Math.round((monto / total) * 100), monto };
    });
  }

  /** Ingresos y egresos reales de los últimos 6 meses (incluyendo el actual), a partir de los movimientos registrados. */
  get resumenMensual(): { mes: string; ingresos: number; egresos: number }[] {
    const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const resultado: { mes: string; ingresos: number; egresos: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth();
      const delMes = this.movimientos.filter((m) => {
        const d = new Date(m.fecha);
        return d.getFullYear() === anio && d.getMonth() === mes;
      });
      resultado.push({
        mes: nombresMes[mes],
        ingresos: delMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0),
        egresos: delMes.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0),
      });
    }
    return resultado;
  }

  /** conic-gradient real a partir del porcentaje de cada categoría de egreso. */
  get donutGradient(): string {
    const categorias = this.egresosPorCategoria.filter((c) => c.porcentaje > 0);
    if (!categorias.length) return 'var(--surface-alt)';

    let acumulado = 0;
    const segmentos = categorias.map((c) => {
      const inicio = acumulado;
      acumulado += c.porcentaje;
      return `${c.color} ${inicio}% ${acumulado}%`;
    });
    return `conic-gradient(${segmentos.join(', ')})`;
  }
}
