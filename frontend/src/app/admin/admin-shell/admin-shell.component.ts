import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rz-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NgFor, IconComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  auth        = inject(AuthService);
  sidebarOpen = signal(true);

  navItems = [
    { path: '/raizen-admin/dashboard',    label: 'Dashboard',      icon: 'layout-dashboard' },
    { path: '/raizen-admin/reservas',     label: 'Reservas',       icon: 'calendar' },
    { path: '/raizen-admin/huespedes',    label: 'Huéspedes',      icon: 'users' },
    { path: '/raizen-admin/habitaciones', label: 'Habitaciones',   icon: 'bed' },
    { path: '/raizen-admin/contenido',    label: 'Contenido',      icon: 'file-text' },
    { path: '/raizen-admin/mensajes',     label: 'Mensajes',       icon: 'mail' },
    { path: '/raizen-admin/reportes',     label: 'Reportes',       icon: 'bar-chart-2' },
    { path: '/raizen-admin/usuarios',     label: 'Usuarios (Admins/Clientes)', icon: 'shield' },
  ];

  get firstName(): string { return this.auth.currentUser()?.nombre?.split(' ').at(0) ?? ''; }

  logout(): void { this.auth.adminLogout(); }
}
