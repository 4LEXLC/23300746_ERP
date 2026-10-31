// Calendario semanal: qué días y en qué horario trabaja cada quien.
import { Component, Input } from '@angular/core';
import { Trabajador } from '../../rh.models';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

@Component({
  selector: 'app-calendario-trabajo',
  imports: [],
  templateUrl: './calendario-trabajo.html',
  styleUrl: './calendario-trabajo.css',
})
export class CalendarioTrabajo {
  @Input() trabajadores: Trabajador[] = [];
  dias = DIAS;

  get activos(): Trabajador[] {
    return this.trabajadores.filter((t) => t.estado === 'activo');
  }

  // "Lun–Vie" se parte en "Lun" y "Vie", y se revisa si el día cae en ese rango.
  trabaja(t: Trabajador, indiceDia: number): boolean {
    const [inicio, fin] = (t.dias ?? '').split(/[^A-Za-zÁÉÍÓÚáéíóú]+/);
    const desde = DIAS.indexOf(inicio);
    const hasta = DIAS.indexOf(fin ?? inicio);
    return desde !== -1 && hasta !== -1 && indiceDia >= desde && indiceDia <= hasta;
  }
}
