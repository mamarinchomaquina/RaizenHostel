import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { MetaService } from '../../core/services/meta.service';
import { Reserva, EstadoReserva } from '../../core/models/reserva.model';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'rz-mis-reservas',
  standalone: true,
  imports: [
    NgFor, NgIf, NgClass, RouterLink,
    CopCurrencyPipe, IconComponent, RevealDirective,
  ],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss',
})
export class MisReservasComponent implements OnInit {
  private resSvc  = inject(ReservasService);
  private authSvc = inject(AuthService);
  private meta    = inject(MetaService);

  reservas  = signal<Reserva[]>([]);
  loading   = signal(true);
  error     = signal('');

  filtroActual = signal<'todas' | 'activas' | 'pasadas'>('todas');

  get userName(): string {
    return this.authSvc.currentUser()?.nombre?.split(' ').at(0) ?? 'Huésped';
  }

  get reservasFiltradas(): Reserva[] {
    const all = this.reservas();
    switch (this.filtroActual()) {
      case 'activas':
        return all.filter(r =>
          ['pendiente', 'pago_pendiente', 'confirmada', 'en_curso'].includes(r.estado)
        );
      case 'pasadas':
        return all.filter(r =>
          ['completada', 'cancelada'].includes(r.estado)
        );
      default:
        return all;
    }
  }

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Mis Reservas | Hostal Raizen Dosquebradas',
      description: 'Consulta el estado de tus reservas en Raizen Hostel.',
    });

    this.loadReservas();
  }

  setFiltro(f: 'todas' | 'activas' | 'pasadas'): void {
    this.filtroActual.set(f);
  }

  private loadReservas(): void {
    this.loading.set(true);
    this.resSvc.getMisReservas().subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus reservas.');
        this.loading.set(false);
      },
    });
  }

  getEstadoLabel(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      pendiente:      'Pendiente',
      pago_pendiente: 'Pago Pendiente',
      confirmada:     'Confirmada',
      en_curso:       'En Curso',
      completada:     'Completada',
      cancelada:      'Cancelada',
    };
    return map[estado] || estado;
  }

  getEstadoColor(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      pendiente:      'warning',
      pago_pendiente: 'warning',
      confirmada:     'success',
      en_curso:       'info',
      completada:     'neutral',
      cancelada:      'error',
    };
    return map[estado] || 'neutral';
  }

  getEstadoIcon(estado: EstadoReserva): string {
    const map: Record<EstadoReserva, string> = {
      pendiente:      'clock',
      pago_pendiente: 'credit-card',
      confirmada:     'check-circle',
      en_curso:       'home',
      completada:     'check',
      cancelada:      'x-circle',
    };
    return map[estado] || 'info';
  }

  formatDateEs(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getNoches(r: Reserva): number {
    if (r.noches) return r.noches;
    const ci = new Date(r.checkin);
    const co = new Date(r.checkout);
    return Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / 86400000));
  }
}
