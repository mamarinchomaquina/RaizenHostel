import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, MensajeContacto, MensajeStats } from '../../core/services/admin.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AlertaComponent } from '../../shared/components/alerta/alerta.component';
import { FechaCoP } from '../../shared/pipes/fecha-co.pipe';

@Component({
  selector: 'rz-mensajes-admin',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, IconComponent, BadgeComponent, AlertaComponent, FechaCoP, DatePipe, UpperCasePipe],
  templateUrl: './mensajes-admin.component.html',
  styleUrl: './mensajes-admin.component.scss'
})
export class MensajesAdminComponent implements OnInit {
  private adminSvc = inject(AdminService);

  mensajes = signal<MensajeContacto[]>([]);
  stats    = signal<MensajeStats | null>(null);
  
  loading       = signal(true);
  mensajeActivo = signal<MensajeContacto | null>(null);
  
  respuesta  = signal('');
  respondiendo = signal(false);
  error      = signal('');
  success    = signal('');

  filtroEstado = signal<string>('');

  ngOnInit(): void {
    this.cargarStats();
    this.cargarMensajes();
  }

  cargarStats(): void {
    this.adminSvc.getMensajeStats().subscribe({
      next: s => this.stats.set(s)
    });
  }

  cargarMensajes(): void {
    this.loading.set(true);
    this.adminSvc.getMensajes(this.filtroEstado()).subscribe({
      next: ms => {
        this.mensajes.set(ms);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filtrarPor(estado: string): void {
    this.filtroEstado.set(estado);
    this.mensajeActivo.set(null);
    this.cargarMensajes();
  }

  abrirMensaje(id: number): void {
    this.error.set('');
    this.success.set('');
    this.respuesta.set('');
    
    this.adminSvc.getMensajeById(id).subscribe({
      next: (m) => {
        this.mensajeActivo.set(m);
        // Update local list state if it was 'nuevo' it is now 'leido'
        this.mensajes.update(list => list.map(item => item.id === id ? { ...item, estado: m.estado } : item));
        this.cargarStats();
      }
    });
  }

  volver(): void {
    this.mensajeActivo.set(null);
    this.error.set('');
    this.success.set('');
  }

  responder(): void {
    const act = this.mensajeActivo();
    const resp = this.respuesta().trim();
    if (!act || !resp) return;

    this.respondiendo.set(true);
    this.error.set('');

    this.adminSvc.responderMensaje(act.id, resp).subscribe({
      next: (res) => {
        if (res.email_sent) {
          this.success.set('Mensaje respondido y email enviado al cliente exitosamente.');
        } else {
          this.success.set('Mensaje respondido y guardado, pero NO se pudo enviar el correo de notificación (revisa la contraseña de mail.php).');
        }
        
        // Update local message view
        this.mensajeActivo.set({ ...act, estado: 'respondido', respuesta: resp, respondido_at: new Date().toISOString() });
        this.respuesta.set('');
        this.respondiendo.set(false);
        
        // Update list and stats
        this.mensajes.update(list => list.map(item => item.id === act.id ? { ...item, estado: 'respondido' } : item));
        this.cargarStats();
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'Error al enviar la respuesta.');
        this.respondiendo.set(false);
      }
    });
  }

  eliminar(id: number, evt: Event): void {
    evt.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) return;

    this.adminSvc.eliminarMensaje(id).subscribe({
      next: () => {
        this.mensajes.update(m => m.filter(x => x.id !== id));
        if (this.mensajeActivo()?.id === id) this.volver();
        this.cargarStats();
      }
    });
  }
}
