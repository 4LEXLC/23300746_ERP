// Movimientos contables y cálculos del resumen financiero.
import { Injectable } from '@angular/core';

export type CategoriaEgreso = 'Insumos y proveedores' | 'Nómina' | 'Servicios y renta';

export interface MovimientoContable {
  fecha: string;
  concepto: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  categoria?: CategoriaEgreso;
}

const COLORES_CATEGORIA: Record<CategoriaEgreso, string> = {
  'Insumos y proveedores': '#2a78d6',
  Nómina: '#eb6834',
  'Servicios y renta': '#1baf7a',
};

@Injectable({ providedIn: 'root' })
export class ContabilidadService {
  movimientos: MovimientoContable[] = [
    { fecha: '2026-09-01', concepto: 'Servicios y renta del local', tipo: 'egreso', monto: 3783, categoria: 'Servicios y renta' },
    { fecha: '2026-09-01', concepto: 'Nómina quincenal', tipo: 'egreso', monto: 9312, categoria: 'Nómina' },
    { fecha: '2026-09-03', concepto: 'Venta del día', tipo: 'ingreso', monto: 2980 },
    { fecha: '2026-09-04', concepto: 'Pago a Café Origen S.A. de C.V.', tipo: 'egreso', monto: 4250, categoria: 'Insumos y proveedores' },
    { fecha: '2026-09-05', concepto: 'Venta del día', tipo: 'ingreso', monto: 3450 },
  ];

  // Agrega un ingreso con la fecha actual.
  registrarIngreso(concepto: string, monto: number): void {
    this.movimientos = [{ fecha: this.hoy(), concepto, tipo: 'ingreso', monto }, ...this.movimientos];
  }

  // Agrega un egreso con su categoría.
  registrarEgreso(concepto: string, monto: number, categoria: CategoriaEgreso): void {
    this.movimientos = [{ fecha: this.hoy(), concepto, tipo: 'egreso', monto, categoria }, ...this.movimientos];
  }

  // Obtiene la fecha UTC en formato año-mes-día.
  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
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
