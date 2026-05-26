import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { RzTranslatePipe } from '../../pipes/rz-translate.pipe';

@Component({
  selector: 'rz-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, RzTranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  year = new Date().getFullYear();
}
