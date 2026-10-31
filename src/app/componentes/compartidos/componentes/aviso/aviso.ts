// Muestra el aviso activo en la esquina de la pantalla.
import { Component } from '@angular/core';
import { AvisoService } from '../../servicios/aviso.service';

@Component({
  selector: 'app-aviso',
  imports: [],
  templateUrl: './aviso.html',
  styleUrl: './aviso.css',
})
export class Aviso {
  constructor(public avisoService: AvisoService) {}
}
