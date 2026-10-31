// Mensaje flotante de confirmación o error para todo el sistema.
import { Injectable, signal } from '@angular/core';

export interface MensajeAviso {
  texto: string;
  tipo: 'exito' | 'error';
}

@Injectable({ providedIn: 'root' })
export class AvisoService {
  aviso = signal<MensajeAviso | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  exito(texto: string): void {
    this.mostrar({ texto, tipo: 'exito' });
  }

  error(texto: string): void {
    this.mostrar({ texto, tipo: 'error' });
  }

  // Muestra el aviso y lo quita solo a los 3.5 segundos.
  private mostrar(aviso: MensajeAviso): void {
    this.aviso.set(aviso);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.aviso.set(null), 3500);
  }
}
