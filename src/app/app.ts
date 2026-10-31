import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aviso } from './componentes/compartidos/componentes/aviso/aviso';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Aviso],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
