import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReservasService } from '../../core/services/reservas.service';
import { Reserva } from '../../core/models/reserva.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { FechaCoP } from '../../shared/pipes/fecha-co.pipe';

@Component({
  selector: 'rz-huespedes',
  standalone: true,
  imports: [NgFor, NgIf, IconComponent, CopCurrencyPipe, FechaCoP],
  templateUrl: './huespedes.component.html',
  styleUrl: './huespedes.component.scss',
})
export class HuespedesComponent implements OnInit {
  private resSvc = inject(ReservasService);
  huespedes = signal<Reserva[]>([]);
  loading   = signal(true);

  ngOnInit(): void {
    this.resSvc.getHuespedesActuales().subscribe({
      next: h => { this.huespedes.set(h); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
