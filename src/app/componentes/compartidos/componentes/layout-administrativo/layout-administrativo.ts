// Estructura compartida de las pantallas administrativas.
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  imports: [RouterOutlet, Sidebar, Topbar],
  selector: 'app-layout-administrativo',
  styleUrl: './layout-administrativo.css',
  templateUrl: './layout-administrativo.html',
})
export class LayoutAdministrativo {}
