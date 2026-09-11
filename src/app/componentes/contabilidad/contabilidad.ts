// Resumen de ingresos, egresos y reportes.
import { Component } from '@angular/core';
import { ContabilidadService } from '../compartidos/servicios/contabilidad.service';

@Component({
  imports: [],
  selector: 'app-contabilidad',
  styleUrl: './contabilidad.css',
  templateUrl: './contabilidad.html',
})
export class Contabilidad {
  constructor(public contabilidadService: ContabilidadService) {}

  periodos = ['Hoy', 'Semana', 'Mes', 'Personalizado'];
  periodoActivo = 'Mes';

  // Obtiene los indicadores financieros.
  get kpis() {
    return this.contabilidadService.kpis;
  }

  // Obtiene los gastos agrupados por categoría.
  get egresos() {
    return this.contabilidadService.egresosPorCategoria;
  }

  // Obtiene el historial de movimientos.
  get movimientos() {
    return this.contabilidadService.movimientos;
  }

  get resumenMensual() {
    return this.contabilidadService.resumenMensual;
  }

  // Calcula la referencia máxima para las barras del gráfico.
  get maxMensual(): number {
    const valores = this.resumenMensual.flatMap((m) => [m.ingresos, m.egresos]);
    return Math.max(1, ...valores);
  }

  get donutGradient(): string {
    return this.contabilidadService.donutGradient;
  }

  // Obtiene el total de egresos.
  get egresosTotal(): number {
    return this.contabilidadService.egresosTotal;
  }

  // Abre la impresión del reporte.
  generarReporte(): void {
    window.print();
  }

  // Descarga los movimientos como CSV para abrirlos en Excel.
  exportarExcel(): void {
    const encabezados = ['Fecha', 'Concepto', 'Tipo', 'Monto'];
    const filas = this.movimientos.map((m) => [m.fecha, m.concepto, m.tipo, m.monto.toFixed(2)]);
    const csv = [encabezados, ...filas].map((fila) => fila.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `movimientos-contables-${this.periodoActivo.toLowerCase()}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
