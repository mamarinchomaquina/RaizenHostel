import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AdminService, ReporteOcupacion, ReporteIngresos, ReporteClientes, ReporteReservasSummary } from '../../core/services/admin.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type ReportTab = 'ocupacion' | 'ingresos' | 'reservas' | 'clientes';

@Component({
  selector: 'rz-reportes',
  standalone: true,
  imports: [NgFor, NgIf, IconComponent, CopCurrencyPipe],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit, AfterViewInit, OnDestroy {
  private adminSvc = inject(AdminService);

  @ViewChild('ocupacionCanvas') ocupacionCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('ingresosCanvas')  ingresosCanvas?: ElementRef<HTMLCanvasElement>;

  tab = signal<ReportTab>('ocupacion');
  
  ocupacion = signal<ReporteOcupacion[]>([]);
  ingresos  = signal<ReporteIngresos[]>([]);
  clientes  = signal<ReporteClientes | null>(null);
  reservas  = signal<ReporteReservasSummary | null>(null);

  periodoIngresos = signal<'semana' | 'mes'>('mes');
  
  loadingOcupacion = signal(true);
  loadingIngresos  = signal(true);
  loadingClientes  = signal(true);
  loadingReservas  = signal(true);

  private chartOcupacion?: Chart;
  private chartIngresos?: Chart;

  ngOnInit(): void {
    this.loadOcupacion();
    this.loadIngresos();
    this.loadClientes();
    this.loadReservas();
  }

  ngAfterViewInit(): void {
    if (this.tab() === 'ocupacion') {
      setTimeout(() => this.renderOcupacionChart(this.ocupacion()), 100);
    }
  }

  ngOnDestroy(): void {
    this.chartOcupacion?.destroy();
    this.chartIngresos?.destroy();
  }

  setTab(t: ReportTab): void {
    this.tab.set(t);
    // Destroy and re-render charts based on the active tab because canvas might be recreated by ngIf
    setTimeout(() => {
      this.chartOcupacion?.destroy();
      this.chartIngresos?.destroy();
      
      if (t === 'ocupacion') this.renderOcupacionChart(this.ocupacion());
      if (t === 'ingresos') this.renderIngresosChart(this.ingresos());
    }, 100);
  }

  // ── Loaders ──
  private loadOcupacion(): void {
    this.adminSvc.getReporteOcupacion(30).subscribe({
      next: data => {
        this.ocupacion.set(data);
        this.loadingOcupacion.set(false);
        if (this.tab() === 'ocupacion') setTimeout(() => this.renderOcupacionChart(data), 100);
      },
      error: () => this.loadingOcupacion.set(false),
    });
  }

  private loadIngresos(): void {
    this.adminSvc.getReporteIngresos(this.periodoIngresos()).subscribe({
      next: data => {
        this.ingresos.set(data);
        this.loadingIngresos.set(false);
        if (this.tab() === 'ingresos') setTimeout(() => this.renderIngresosChart(data), 100);
      },
      error: () => this.loadingIngresos.set(false),
    });
  }

  private loadClientes(): void {
    this.adminSvc.getReporteClientes().subscribe({
      next: data => {
        this.clientes.set(data);
        this.loadingClientes.set(false);
      },
      error: () => this.loadingClientes.set(false)
    });
  }

  private loadReservas(): void {
    this.adminSvc.getReporteReservas().subscribe({
      next: data => {
        this.reservas.set(data);
        this.loadingReservas.set(false);
      },
      error: () => this.loadingReservas.set(false)
    });
  }

  cambiarPeriodoIngresos(p: 'semana' | 'mes'): void {
    this.periodoIngresos.set(p);
    this.loadingIngresos.set(true);
    this.adminSvc.getReporteIngresos(p).subscribe({
      next: data => {
        this.ingresos.set(data);
        this.loadingIngresos.set(false);
        this.chartIngresos?.destroy();
        setTimeout(() => this.renderIngresosChart(data), 100);
      },
      error: () => this.loadingIngresos.set(false),
    });
  }

  // ── Render Charts ──
  private renderOcupacionChart(data: ReporteOcupacion[]): void {
    if (!this.ocupacionCanvas?.nativeElement) return;
    this.chartOcupacion?.destroy();
    const ctx = this.ocupacionCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    this.chartOcupacion = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.fecha),
        datasets: [{
          label: '% Ocupación',
          data: data.map(d => d.porcentaje),
          backgroundColor: 'rgba(92,61,30,0.7)',
          borderColor: 'rgba(92,61,30,1)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
          x: { ticks: { maxRotation: 45 } }
        }
      }
    });
  }

  private renderIngresosChart(data: ReporteIngresos[]): void {
    if (!this.ingresosCanvas?.nativeElement) return;
    this.chartIngresos?.destroy();
    const ctx = this.ingresosCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    this.chartIngresos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.periodo),
        datasets: [{
          label: 'Ingresos (COP)',
          data: data.map(d => d.total),
          backgroundColor: 'rgba(200,149,42,0.7)',
          borderColor: 'rgba(200,149,42,1)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: v => '$' + Number(v).toLocaleString('es-CO')
            }
          }
        }
      }
    });
  }

  // ── Computed / Getters ──
  get promedioOcupacion(): number {
    const d = this.ocupacion();
    if (!d.length) return 0;
    return Math.round(d.reduce((a, b) => a + b.porcentaje, 0) / d.length);
  }

  get totalIngresos(): number {
    return this.ingresos().reduce((a, b) => a + b.total, 0);
  }

  get totalReservasIngresos(): number {
    return this.ingresos().reduce((a, b) => a + b.reservas, 0);
  }
}
