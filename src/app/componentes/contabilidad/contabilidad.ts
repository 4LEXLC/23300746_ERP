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

  get kpis() {
    return this.contabilidadService.kpis;
  }

  get egresos() {
    return this.contabilidadService.egresosPorCategoria;
  }

  get movimientos() {
    return this.contabilidadService.movimientos;
  }

  get resumenMensual() {
    return this.contabilidadService.resumenMensual;
  }

  get maxMensual(): number {
    const valores = this.resumenMensual.flatMap((m) => [m.ingresos, m.egresos]);
    return Math.max(1, ...valores);
  }

  get donutGradient(): string {
    return this.contabilidadService.donutGradient;
  }

  get egresosTotal(): number {
    return this.contabilidadService.egresosTotal;
  }

  generarReporte(): void {
    window.print();
  }

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
