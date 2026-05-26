import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public layout (navbar + footer)
  {
    path: '',
    loadComponent: () => import('./features/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'habitaciones',
        loadComponent: () => import('./features/habitaciones/habitaciones-list/habitaciones-list.component').then(m => m.HabitacionesListComponent),
      },
      {
        path: 'reservas',
        loadComponent: () => import('./features/reservas/reserva-form/reserva-form.component').then(m => m.ReservaFormComponent),
      },
      {
        path: 'mis-reservas',
        loadComponent: () => import('./features/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'pago',
        loadComponent: () => import('./features/pagos/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'pago/exitoso',
        loadComponent: () => import('./features/pagos/pago-exitoso/pago-exitoso.component').then(m => m.PagoExitosoComponent),
      },
      {
        path: 'pago/fallido',
        loadComponent: () => import('./features/pagos/pago-fallido/pago-fallido.component').then(m => m.PagoFallidoComponent),
      },
      {
        path: 'galeria',
        loadComponent: () => import('./features/galeria/galeria.component').then(m => m.GaleriaComponent),
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/contacto/contacto.component').then(m => m.ContactoComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [GuestGuard],
      },
      {
        path: 'registro',
        loadComponent: () => import('./features/auth/registro/registro.component').then(m => m.RegistroComponent),
        canActivate: [GuestGuard],
      },
    ],
  },

  // Admin login (standalone, no shell)
  {
    path: 'raizen-admin/login',
    loadComponent: () => import('./admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
  },

  // Admin shell (lazy, guarded)
  {
    path: 'raizen-admin',
    loadComponent: () => import('./admin/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'reservas',
        loadComponent: () => import('./admin/reservas-admin/reservas-admin.component').then(m => m.ReservasAdminComponent),
      },
      {
        path: 'huespedes',
        loadComponent: () => import('./admin/huespedes/huespedes.component').then(m => m.HuespedesComponent),
      },
      {
        path: 'habitaciones',
        loadComponent: () => import('./admin/habitaciones-admin/habitaciones-admin.component').then(m => m.HabitacionesAdminComponent),
      },
      {
        path: 'contenido',
        loadComponent: () => import('./admin/contenido-admin/contenido-admin.component').then(m => m.ContenidoAdminComponent),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./admin/reportes/reportes.component').then(m => m.ReportesComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./admin/usuarios-admin/usuarios-admin.component').then(m => m.UsuariosAdminComponent),
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./admin/mensajes/mensajes-admin.component').then(m => m.MensajesAdminComponent),
      },
    ],
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
