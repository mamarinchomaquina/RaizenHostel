import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContenidoService } from '../../../../core/services/contenido.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RzTranslatePipe } from '../../../../shared/pipes/rz-translate.pipe';

@Component({
  selector: 'rz-hero-carousel',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, RouterLink, IconComponent, RzTranslatePipe],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.scss',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private contenidoService = inject(ContenidoService);
  private timer?: ReturnType<typeof setInterval>;

  currentIndex = signal(0);
  slides: { url: string; alt: string }[] = [];
  heroData = {
    titulo: 'Tu hogar en Dosquebradas',
    subtitulo: 'Hostal familiar y consciente en el corazón de Dosquebradas, Risaralda',
    cta_texto: 'Reservar ahora',
    cta_link: '/reservas',
  };

  ngOnInit(): void {
    this.contenidoService.getSeccion<any>('hero').subscribe({
      next: (data) => {
        if (data) {
          this.heroData = { ...this.heroData, ...data };
          this.slides = data.slides || [];
        }
      },
      error: () => {}
    });
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  startAutoPlay(): void {
    this.timer = setInterval(() => {
      if (this.slides.length > 1) {
        this.currentIndex.update(i => (i + 1) % this.slides.length);
      }
    }, 5000);
  }

  goTo(index: number): void { this.currentIndex.set(index); }
  prev(): void { this.currentIndex.update(i => (i - 1 + this.slides.length) % this.slides.length); }
  next(): void { this.currentIndex.update(i => (i + 1) % this.slides.length); }
}
