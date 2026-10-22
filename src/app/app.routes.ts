import { Routes } from '@angular/router';
import { authGuard } from './componentes/compartidos/guards/auth.guard';
import { rolGuard } from './componentes/compartidos/guards/rol.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then((m) => m.Login),
    title: 'Iniciar sesión — Cafetería ERP',
  },
  {
    path: 'terminos',
    loadComponent: () =>
    import('./componentes/compartidos/componentes/legal/terminos/terminos').then((m) => m.Terminos),
    title: 'Términos y condiciones — Cafetería ERP',
  },
  {
    path: 'aviso-privacidad',
    loadComponent: () =>
      import('./componentes/compartidos/componentes/legal/aviso-privacidad/aviso-privacidad').then((m) => m.AvisoPrivacidad),
    title: 'Aviso de privacidad — Cafetería ERP',
  },
  {
    path: 'punto-venta',
    loadComponent: () =>
      import('./componentes/punto-venta/punto-venta').then((m) => m.PuntoVenta),
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'cajero'] },
    title: 'Punto de Venta — Cafetería ERP',
  },
  {
    path: 'pago',
    loadComponent: () => import('./componentes/punto-venta/pago/pago').then((m) => m.Pago),
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'cajero'] },
    title: 'Procesar Pago — Cafetería ERP',
  },
  {
    path: 'ticket',
    loadComponent: () => import('./componentes/punto-venta/ticket/ticket').then((m) => m.Ticket),
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin', 'cajero'] },
    title: 'Ticket de Venta — Cafetería ERP',
  },
  {
    path: '',
    loadComponent: () =>
      import('./componentes/compartidos/componentes/layout-administrativo/layout-administrativo').then(
        (m) => m.LayoutAdministrativo,
      ),
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin']},
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./componentes/inicio/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard — Cafetería ERP',
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./componentes/inventario/inventario').then((m) => m.Inventario),
        title: 'Inventario — Cafetería ERP',
      },
      {
        path: 'ventas-facturacion',
        loadComponent: () =>
          import('./componentes/ventas-facturacion/ventas-facturacion').then(
            (m) => m.VentasFacturacion,
          ),
        title: 'Ventas y Facturación — Cafetería ERP',
      },
      {
        path: 'compras-proveedores',
        loadComponent: () =>
          import('./componentes/compras-proveedores/compra-proveedores').then(
            (m) => m.CompraProveedores,
          ),
        title: 'Compras y Proveedores — Cafetería ERP',
      },
      {
        path: 'contabilidad',
        loadComponent: () =>
          import('./componentes/contabilidad/contabilidad').then((m) => m.Contabilidad),
        title: 'Contabilidad y Finanzas — Cafetería ERP',
      },
      {
        path: 'recursos-humanos',
        loadComponent: () => import('./componentes/recursos-humanos/rh').then((m) => m.RH),
        title: 'Recursos Humanos — Cafetería ERP',
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
