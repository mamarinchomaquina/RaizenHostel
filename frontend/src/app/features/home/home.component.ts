import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { MetaService } from '../../core/services/meta.service';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';
import { ValoresGridComponent } from './components/valores-grid/valores-grid.component';
import { DestacadosStripComponent } from './components/destacados-strip/destacados-strip.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { RouterLink } from '@angular/router';
import { RzTranslatePipe } from '../../shared/pipes/rz-translate.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rz-home',
  standalone: true,
  imports: [HeroCarouselComponent, ValoresGridComponent, DestacadosStripComponent, RevealDirective, RouterLink, RzTranslatePipe, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private meta = inject(MetaService);

  lightboxSrc = signal<string | null>(null);

  openLightbox(src: string): void { this.lightboxSrc.set(src); }
  closeLightbox(): void { this.lightboxSrc.set(null); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeLightbox(); }

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Hostal en Dosquebradas, Risaralda | Raizen Hostel',
      description: 'Hostal familiar y consciente en Dosquebradas, Risaralda. Habitaciones privadas y dormitorios compartidos. Pasadía, descanso y naturaleza en el Eje Cafetero.',
      keywords: 'hostal Dosquebradas, hostal Risaralda, hostel Colombia, alojamiento Dosquebradas, pasadia Risaralda, hostel Eje Cafetero',
    });
  }
}
