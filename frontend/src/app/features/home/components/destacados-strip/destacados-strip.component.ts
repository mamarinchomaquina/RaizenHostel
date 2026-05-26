import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'rz-destacados-strip',
  standalone: true,
  imports: [NgFor, IconComponent, RevealDirective],
  templateUrl: './destacados-strip.component.html',
  styleUrl: './destacados-strip.component.scss',
})
export class DestacadosStripComponent {
  items = [
    { icono: 'bed',           valor: '5',   label: 'Habitaciones privadas' },
    { icono: 'layout-grid',   valor: '10',  label: 'Camas en dormitorio' },
    { icono: 'coffee',        valor: '6',   label: 'Servicios incluidos' },
    { icono: 'map-pin',       valor: '∞',   label: 'Planes por Risaralda' },
  ];
}
