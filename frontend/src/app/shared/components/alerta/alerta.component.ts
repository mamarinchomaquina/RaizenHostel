import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'rz-alerta',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div *ngIf="mensaje" class="alert" [ngClass]="'alert--' + tipo" role="alert">
      {{ mensaje }}
    </div>
  `
})
export class AlertaComponent {
  @Input() mensaje = '';
  @Input() tipo: 'exito' | 'error' | 'info' = 'info';
}
