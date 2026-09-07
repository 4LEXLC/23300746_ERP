import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosCliente {
  nombre: string;
  rfc: string;
  codigoPostal: string;
  regimenFiscal: string;
  correo: string;
}

@Component({
  selector: 'app-formulario-cliente',
  imports: [FormsModule],
  templateUrl: './formulario-cliente.html',
  styleUrl: './formulario-cliente.css',
})
export class FormularioCliente {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosCliente>();

  regimenes = ['General de Ley Personas Morales', 'Régimen de Incorporación Fiscal', 'Sueldos y Salarios'];

  datos: DatosCliente = {
    nombre: '',
    rfc: '',
    codigoPostal: '',
    regimenFiscal: '',
    correo: '',
  };

  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
