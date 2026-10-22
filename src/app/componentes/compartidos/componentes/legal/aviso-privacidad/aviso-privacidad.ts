import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-aviso-privacidad',
  imports: [],
  templateUrl: './aviso-privacidad.html',
  styleUrl: './aviso-privacidad.css',
})
export class AvisoPrivacidad {
  constructor(private location: Location) {}

  actualizacion = '18 de octubre de 2026';

  // Regresa a la página anterior.
  volver(): void {
    this.location.back();
  }
}