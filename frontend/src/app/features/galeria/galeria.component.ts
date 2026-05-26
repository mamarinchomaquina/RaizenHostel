import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MetaService } from '../../core/services/meta.service';
import { GaleriaImagen } from '../../core/models/contenido.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

const FOTOS: string[] = [
  'DSC03373','DSC03375','DSC03395-Pano','DSC03398','DSC03401','DSC03402',
  'DSC03415-Pano','DSC03431','DSC03432','DSC03437','DSC03453','DSC03455',
  'DSC03459','DSC03463','DSC03465','DSC03468','DSC03486-Pano','DSC03491',
  'DSC03493','DSC03494','DSC03506-Pano','DSC03509','DSC03515','DSC03517',
  'DSC03542','DSC03544','DSC03546','DSC03550','DSC03555-Pano','DSC03566',
  'DSC03570','DSC03572','DSC03573-Pano','DSC03585','DSC03593','DSC03595',
  'DSC03596','DSC03599','DSC03601','DSC03606-Pano','DSC03617','DSC03621',
  'DSC03626','DSC03628','DSC03630','DSC03632','DSC03637-Pano','DSC03650',
  'DSC03653','DSC03655','DSC03657','DSC03662','DSC03666','DSC03668',
  'DSC03669','DSC03671','DSC03674','DSC03676','DSC03678','DSC03682',
  'DSC03688','DSC03694','DSC03701','DSC03713','DSC03718','DSC03722',
  'DSC03726','DSC03728','DSC03729','DSC03732','DSC03733','DSC03736',
  'DSC03773-Pano','DSC03776','DSC03781','DSC03784','DSC03787','DSC03789',
  'DSC03791','DSC03793','DSC03794-Pano','DSC03805','DSC03807','DSC03809',
  'DSC03811','DSC03815','DSC03827','DSC03835','DSC03849-Pano','DSC03869',
  'DSC03873','DSC03881','DSC03883-Pano','DSC03900','DSC03908',
];

const IMAGENES_HOSTAL: GaleriaImagen[] = FOTOS.map((name, i) => ({
  id: i + 1,
  url: `images/${name}.jpg`,
  alt_text: 'Raizen Hostel Dosquebradas',
  categoria: 'hostal',
  span_wide: name.includes('Pano'),
  span_tall: false,
  orden: i + 1,
  activo: true,
}));

@Component({
  selector: 'rz-galeria',
  standalone: true,
  imports: [NgFor, NgIf, IconComponent, RevealDirective],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.scss',
})
export class GaleriaComponent implements OnInit {
  private meta = inject(MetaService);

  imagenes    = signal<GaleriaImagen[]>([]);
  loading     = signal(true);
  lightbox    = signal<GaleriaImagen | null>(null);
  lightboxIdx = signal(0);

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Galería de Fotos | Raizen Hostel Dosquebradas',
      description: 'Conoce las instalaciones de Raizen Hostel en Dosquebradas, Risaralda. Habitaciones privadas, dormitorios, áreas comunes y entorno natural.',
    });
    this.imagenes.set(IMAGENES_HOSTAL);
    this.loading.set(false);
  }

  openLightbox(img: GaleriaImagen): void {
    const idx = this.imagenes().indexOf(img);
    this.lightboxIdx.set(idx);
    this.lightbox.set(img);
  }

  closeLightbox(): void { this.lightbox.set(null); }

  prevImage(): void {
    const imgs = this.imagenes();
    const idx = (this.lightboxIdx() - 1 + imgs.length) % imgs.length;
    this.lightboxIdx.set(idx);
    this.lightbox.set(imgs[idx]);
  }

  nextImage(): void {
    const imgs = this.imagenes();
    const idx = (this.lightboxIdx() + 1) % imgs.length;
    this.lightboxIdx.set(idx);
    this.lightbox.set(imgs[idx]);
  }
}
