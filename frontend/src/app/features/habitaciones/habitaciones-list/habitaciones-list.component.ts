import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitacionesService } from '../../../core/services/habitaciones.service';
import { MetaService } from '../../../core/services/meta.service';
import { TipoCard } from '../../../core/models/habitacion.model';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { RzTranslatePipe } from '../../../shared/pipes/rz-translate.pipe';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'rz-habitaciones-list',
  standalone: true,
  imports: [RouterLink, RevealDirective, IconComponent, RzTranslatePipe, CopCurrencyPipe],
  templateUrl: './habitaciones-list.component.html',
  styleUrl: './habitaciones-list.component.scss',
})
export class HabitacionesListComponent implements OnInit {
  private habService = inject(HabitacionesService);
  private meta       = inject(MetaService);

  tipos   = signal<TipoCard[]>([]);
  loading = signal(true);
  error   = signal('');

  selectedTipo  = signal<TipoCard | null>(null);
  carouselIndex = signal(0);

  openGaleria(tipo: TipoCard): void {
    if (!tipo.imagenes?.length) return;
    this.selectedTipo.set(tipo);
    this.carouselIndex.set(0);
  }

  closeGaleria(): void { this.selectedTipo.set(null); }

  prevImg(): void {
    const n = this.selectedTipo()!.imagenes.length;
    this.carouselIndex.update(i => (i - 1 + n) % n);
  }

  nextImg(): void {
    const n = this.selectedTipo()!.imagenes.length;
    this.carouselIndex.update(i => (i + 1) % n);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.selectedTipo()) return;
    if (e.key === 'Escape')     this.closeGaleria();
    if (e.key === 'ArrowLeft')  this.prevImg();
    if (e.key === 'ArrowRight') this.nextImg();
  }

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Habitaciones y Dormitorios | Raizen Hostel Dosquebradas',
      description: 'Habitaciones privadas desde $100.000 y camas en dormitorio desde $59.000/noche en Dosquebradas, Risaralda. Desayuno incluido. Reserva online.',
      keywords: 'habitaciones hostal Dosquebradas, dormitorio compartido Risaralda, cama hostel Eje Cafetero, precios hostel Colombia',
    });
    this.habService.getTipos().subscribe({
      next: data => { this.tipos.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron cargar las tarifas.'); this.loading.set(false); },
    });
  }
}
