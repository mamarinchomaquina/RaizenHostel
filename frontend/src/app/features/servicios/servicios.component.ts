import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { MetaService } from '../../core/services/meta.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface Amenidad {
  nombre: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'rz-servicios',
  standalone: true,
  imports: [NgFor, IconComponent, RevealDirective],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent implements OnInit {
  private meta = inject(MetaService);

  amenidades = signal<Amenidad[]>([
    { nombre: 'WiFi de Alta Velocidad', descripcion: 'Conexión rápida y estable de fibra óptica en todas las áreas del hostel.', icono: 'wifi' },
    { nombre: 'Desayuno Incluido', descripcion: 'Delicioso desayuno casero preparado cada mañana con café fresco de la región.', icono: 'coffee' },
    { nombre: 'Estacionamiento Privado', descripcion: 'Parqueadero gratuito y vigilado las 24 horas para la seguridad de tu vehículo.', icono: 'car' },
    { nombre: 'Servicio de Lavandería', descripcion: 'Lavado y secado rápido de prendas disponible a un costo muy accesible.', icono: 'shirt' },
    { nombre: 'Bar & Cafetería', descripcion: 'Café de origen de Risaralda, bebidas refrescantes, cervezas y snacks todo el día.', icono: 'cup-soda' },
  ]);

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Servicios y Experiencias | Raizen Hostel',
      description: 'Descubre las comodidades de nuestro hostal y las mejores aventuras del Eje Cafetero, como nuestra Cabalgata Inolvidable.',
    });
  }
}
