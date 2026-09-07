import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DatosProducto {
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  existencia: number;
  minimo: number;
  estado: 'activo' | 'inactivo';
}

@Component({
  selector: 'app-formulario-producto',
  imports: [FormsModule],
  templateUrl: './formulario-producto.html',
  styleUrl: './formulario-producto.css',
})
export class FormularioProducto {
  @Input() set productoEditar(producto: DatosProducto | null) {
    if (producto) {
      this.datos = { ...producto };
      this.editando = true;
    }
  }
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<DatosProducto>();

  categorias = ['Bebidas calientes', 'Bebidas frías', 'Repostería', 'Alimentos'];
  editando = false;

  datos: DatosProducto = {
    nombre: '',
    categoria: this.categorias[0],
    precio: 0,
    descripcion: '',
    existencia: 0,
    minimo: 0,
    estado: 'activo',
  };

  onGuardar(): void {
    this.guardar.emit(this.datos);
  }
}
