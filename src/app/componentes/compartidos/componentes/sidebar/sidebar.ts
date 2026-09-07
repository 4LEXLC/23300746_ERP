import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: 'inicio' | 'ventas' | 'inventario' | 'facturacion' | 'compras' | 'contabilidad' | 'rh';
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  items: ItemMenu[] = [
    { ruta: '/dashboard', etiqueta: 'Inicio', icono: 'inicio' },
    { ruta: '/punto-venta', etiqueta: 'Punto de Venta', icono: 'ventas' },
    { ruta: '/inventario', etiqueta: 'Inventario', icono: 'inventario' },
    { ruta: '/ventas-facturacion', etiqueta: 'Ventas y Facturación', icono: 'facturacion' },
    { ruta: '/compras-proveedores', etiqueta: 'Compras y Proveedores', icono: 'compras' },
    { ruta: '/contabilidad', etiqueta: 'Contabilidad y Finanzas', icono: 'contabilidad' },
    { ruta: '/recursos-humanos', etiqueta: 'Recursos Humanos', icono: 'rh' },
  ];
}
