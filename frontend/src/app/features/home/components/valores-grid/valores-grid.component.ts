import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'rz-valores-grid',
  standalone: true,
  imports: [NgFor, IconComponent, RevealDirective],
  templateUrl: './valores-grid.component.html',
  styleUrl: './valores-grid.component.scss',
})
export class ValoresGridComponent {
  valores = [
    { icono: 'moon',      titulo: 'Descanso Respetado',     desc: 'Espacios diseñados para el silencio y el sueño profundo. Tus horas de descanso son sagradas.' },
    { icono: 'users',     titulo: 'Conexión Genuina',        desc: 'Espacios comunes que invitan a conocer viajeros de todo el mundo sin forzar la interacción.' },
    { icono: 'leaf',      titulo: 'Calma Consciente',        desc: 'Cada rincón está pensado para que puedas respirar, pausar y reconectar contigo mismo.' },
    { icono: 'heart',     titulo: 'Hospitalidad Real',       desc: 'No somos una cadena. Somos personas cuidando personas, con calidez y atención genuina.' },
  ];
}
