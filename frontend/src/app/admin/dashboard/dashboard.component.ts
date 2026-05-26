import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardKpis } from '../../core/services/admin.service';
import { ReservasService } from '../../core/services/reservas.service';
import { Reserva } from '../../core/models/reserva.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { FechaCoP } from '../../shared/pipes/fecha-co.pipe';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'rz-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, IconComponent, CopCurrencyPipe, FechaCoP, BadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private resSvc   = inject(ReservasService);

  kpis            = signal<DashboardKpis | null>(null);
  reservasRecientes = signal<Reserva[]>([]);
  loading         = signal(true);

  ngOnInit(): void {
    this.adminSvc.getKpis().subscribe({ next: k => { this.kpis.set(k); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.resSvc.getAll({ limit: '8', orden: 'desc' }).subscribe({ next: r => this.reservasRecientes.set(r), error: () => {} });
  }

  estadoBadge(estado: string): 'exito' | 'error' | 'info' | 'dorado' | 'arena' {
    const map: Record<string, any> = { confirmada: 'exito', cancelada: 'error', en_curso: 'dorado', completada: 'arena', pendiente: 'info', pago_pendiente: 'info' };
    return map[estado] ?? 'info';
  }
}
