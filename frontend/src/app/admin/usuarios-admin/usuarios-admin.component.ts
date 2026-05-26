import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, ClienteAdmin } from '../../core/services/admin.service';
import { Usuario } from '../../core/models/usuario.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AlertaComponent } from '../../shared/components/alerta/alerta.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { FechaCoP } from '../../shared/pipes/fecha-co.pipe';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

type UserTab = 'admins' | 'clientes';

@Component({
  selector: 'rz-usuarios-admin',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, IconComponent, AlertaComponent, BadgeComponent, FechaCoP, CopCurrencyPipe],
  templateUrl: './usuarios-admin.component.html',
  styleUrl: './usuarios-admin.component.scss',
})
export class UsuariosAdminComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private fb       = inject(FormBuilder);

  tab = signal<UserTab>('admins');

  admins    = signal<Usuario[]>([]);
  clientes  = signal<ClienteAdmin[]>([]);
  
  loadingAdmins   = signal(true);
  loadingClientes = signal(true);
  
  showForm  = signal(false);
  saving    = signal(false);
  error     = signal('');
  success   = signal('');

  form = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.loadAdmins();
    this.loadClientes();
  }

  setTab(t: UserTab): void {
    this.tab.set(t);
    this.error.set('');
    this.success.set('');
    this.showForm.set(false);
  }

  private loadAdmins(): void {
    this.adminSvc.getUsuarios().subscribe({
      next: u => { this.admins.set(u); this.loadingAdmins.set(false); },
      error: () => this.loadingAdmins.set(false),
    });
  }

  private loadClientes(): void {
    this.adminSvc.getClientes().subscribe({
      next: c => { this.clientes.set(c); this.loadingClientes.set(false); },
      error: () => this.loadingClientes.set(false),
    });
  }

  crearAdmin(): void {
    if (this.form.invalid) return;
    this.saving.set(true); this.error.set('');
    this.adminSvc.crearUsuario(this.form.value as any).subscribe({
      next: (u) => {
        this.admins.update(us => [u, ...us]);
        this.success.set('Usuario administrador creado exitosamente.');
        this.form.reset(); this.showForm.set(false); this.saving.set(false);
      },
      error: (err) => { this.saving.set(false); this.error.set(err?.error?.mensaje ?? 'Error al crear el usuario.'); },
    });
  }

  toggleActivoAdmin(u: Usuario): void {
    this.adminSvc.toggleUsuarioActivo(u.id, !u.activo).subscribe({
      next: (updated) => this.admins.update(us => us.map(x => x.id === u.id ? updated : x)),
    });
  }

  toggleActivoCliente(c: ClienteAdmin): void {
    this.adminSvc.toggleClienteActivo(c.id, !c.activo).subscribe({
      next: (updated) => this.clientes.update(cs => cs.map(x => x.id === c.id ? { ...x, activo: updated.activo } : x)),
    });
  }
}
