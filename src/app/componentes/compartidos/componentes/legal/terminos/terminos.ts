import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos',
  imports: [RouterLink],
  templateUrl: './terminos.html',
  styleUrl: './terminos.css',
})
export class Terminos {
  constructor(private location: Location) {}

  actualizacion = '21 de octubre de 2026';

  // Regresa a la página anterior (login o pago).
  volver(): void {
    this.location.back();
  }
}