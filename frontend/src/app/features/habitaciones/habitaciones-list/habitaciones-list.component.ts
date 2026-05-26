import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MetaService } from '../../../core/services/meta.service';
import { TipoCard } from '../../../core/models/habitacion.model';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { RzTranslatePipe } from '../../../shared/pipes/rz-translate.pipe';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

const TIPOS_ESTATICOS: TipoCard[] = [
  {
    id: 1, slug: 'cama-camarote', nombre: 'Cama en Camarote',
    descripcion: 'Camarote con dosel en dormitorio compartido. Incluye locker individual, luz de lectura y ambiente acogedor.',
    capacidad: 1, precio: 59000, popular: false, categoria: 'compartido',
    total_unidades: 2, unidades_disponibles: 2,
    imagenes: [
      { id: 1, url: 'images/habitaciones/hab_1_1776122782.jpg', alt_text: 'Cama en Camarote', orden: 1 },
      { id: 2, url: 'images/habitaciones/hab_1_1776218320.jpg', alt_text: 'Cama en Camarote', orden: 2 },
      { id: 3, url: 'images/habitaciones/hab_1_1776219024.jpg', alt_text: 'Cama en Camarote', orden: 3 },
    ],
  },
  {
    id: 2, slug: 'cama-sencilla', nombre: 'Cama Sencilla',
    descripcion: 'Cama individual en habitación compartida. Espacio personal, tranquilo y seguro para el viajero independiente.',
    capacidad: 1, precio: 89000, popular: false, categoria: 'compartido',
    total_unidades: 8, unidades_disponibles: 8,
    imagenes: [
      { id: 4, url: 'images/habitaciones/hab_3_1776969438.jpg', alt_text: 'Cama Sencilla', orden: 1 },
      { id: 5, url: 'images/habitaciones/hab_4_1778609128.jpg', alt_text: 'Cama Sencilla', orden: 2 },
      { id: 6, url: 'images/habitaciones/hab_6_1778609262.jpg', alt_text: 'Cama Sencilla', orden: 3 },
    ],
  },
  {
    id: 3, slug: 'privada-sencilla', nombre: 'Hab. Sencilla',
    descripcion: 'Habitación privada para una persona. Llave propia, ambiente tranquilo y atención personalizada.',
    capacidad: 1, precio: 100000, popular: false, categoria: 'privada',
    total_unidades: 1, unidades_disponibles: 1,
    imagenes: [
      { id: 7, url: 'images/habitaciones/hab_11_1778609430.jpg', alt_text: 'Habitación Privada Sencilla', orden: 1 },
    ],
  },
  {
    id: 4, slug: 'privada-doble', nombre: 'Hab. Doble',
    descripcion: 'La opción más elegida. Habitación privada para dos personas con cama doble, ropa de cama premium y máxima privacidad.',
    capacidad: 2, precio: 164000, popular: true, categoria: 'privada',
    total_unidades: 1, unidades_disponibles: 1,
    imagenes: [
      { id: 8, url: 'images/habitaciones/hab_12_1778609817.jpg', alt_text: 'Habitación Privada Doble', orden: 1 },
    ],
  },
  {
    id: 5, slug: 'privada-triple', nombre: 'Hab. Triple',
    descripcion: 'Habitación privada para tres personas. Ideal para grupos pequeños o familias. Tres camas y espacio amplio.',
    capacidad: 3, precio: 192000, popular: false, categoria: 'privada',
    total_unidades: 1, unidades_disponibles: 1,
    imagenes: [
      { id: 9, url: 'images/habitaciones/hab_13_1778609591.jpg', alt_text: 'Habitación Privada Triple', orden: 1 },
    ],
  },
  {
    id: 6, slug: 'privada-cuadruple', nombre: 'Hab. Cuádruple',
    descripcion: 'Habitación privada para cuatro personas. La más espaciosa del hostel, perfecta para grupos o familias.',
    capacidad: 4, precio: 261000, popular: false, categoria: 'privada',
    total_unidades: 1, unidades_disponibles: 1,
    imagenes: [
      { id: 10, url: 'images/habitaciones/hab_14_1778609674.jpg', alt_text: 'Habitación Privada Cuádruple', orden: 1 },
    ],
  },
];

@Component({
  selector: 'rz-habitaciones-list',
  standalone: true,
  imports: [RouterLink, RevealDirective, IconComponent, RzTranslatePipe, CopCurrencyPipe],
  templateUrl: './habitaciones-list.component.html',
  styleUrl: './habitaciones-list.component.scss',
})
export class HabitacionesListComponent implements OnInit {
  private meta = inject(MetaService);

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
    this.tipos.set(TIPOS_ESTATICOS);
    this.loading.set(false);
  }
}
