import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosProveedor {
  nombre: string;
  telefono: string;
  correo: string;
  notas: string;
}

@Component({
  selector: 'app-formulario-proveedor',
  imports: [FormsModule],
  templateUrl: './formulario-proveedor.html',
  styleUrl: './formulario-proveedor.css',
})
export class FormularioProveedor {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosProveedor>();

  datos: DatosProveedor = {
    nombre: '',
    telefono: '',
    correo: '',
    notas: '',
  };

  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
