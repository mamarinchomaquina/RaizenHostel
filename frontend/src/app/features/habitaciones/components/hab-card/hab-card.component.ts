import { Component, Input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { Habitacion } from '../../../../core/models/habitacion.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'rz-hab-card',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, BadgeComponent, IconComponent, CopCurrencyPipe],
  templateUrl: './hab-card.component.html',
  styleUrl: './hab-card.component.scss',
})
export class HabCardComponent {
  @Input({ required: true }) hab!: Habitacion;

  currentImageIndex = signal(0);
  lightboxOpen = signal(false);

  imagenes = computed(() => {
    return this.hab.imagenes && this.hab.imagenes.length > 0 
      ? this.hab.imagenes 
      : [];
  });

  get imagenPrincipal(): string | null {
    if (this.imagenes().length === 0) return null;
    return this.imagenes()[this.currentImageIndex()].url;
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.imagenes().length <= 1) return;
    this.currentImageIndex.update(i => (i + 1) % this.imagenes().length);
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.imagenes().length <= 1) return;
    this.currentImageIndex.update(i => i === 0 ? this.imagenes().length - 1 : i - 1);
  }

  openLightbox(): void {
    if (this.imagenes().length > 0) {
      this.lightboxOpen.set(true);
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = '';
  }
}
