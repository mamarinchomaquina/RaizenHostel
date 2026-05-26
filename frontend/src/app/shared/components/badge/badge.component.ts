import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'rz-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="'badge--' + variant"><ng-content /></span>`
})
export class BadgeComponent {
  @Input() variant: 'exito' | 'error' | 'info' | 'dorado' | 'arena' = 'info';
}
