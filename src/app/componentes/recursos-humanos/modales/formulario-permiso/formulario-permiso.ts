import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosPermiso {
  trabajador: string;
  tipo: 'Permiso' | 'Vacaciones';
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
}

@Component({
  selector: 'app-formulario-permiso',
  imports: [FormsModule],
  templateUrl: './formulario-permiso.html',
  styleUrl: './formulario-permiso.css',
})
export class FormularioPermiso {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosPermiso>();

  trabajadores: string[] = [];

  @Input() set listaTrabajadores(lista: string[]) {
    this.trabajadores = lista;
    if (!this.datos.trabajador && lista.length) {
      this.datos.trabajador = lista[0];
    }
  }

  datos: DatosPermiso = {
    trabajador: '',
    tipo: 'Vacaciones',
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
  };

  seleccionarTipo(tipo: DatosPermiso['tipo']) {
    this.datos.tipo = tipo;
  }

  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
