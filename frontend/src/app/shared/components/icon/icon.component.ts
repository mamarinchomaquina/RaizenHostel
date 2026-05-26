import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'rz-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `<lucide-icon [name]="name" [size]="size" [strokeWidth]="strokeWidth" />`
})
export class IconComponent {
  @Input() name!: string;
  @Input() size  = 20;
  @Input() strokeWidth = 1.5;
}
