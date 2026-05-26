import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';
import { LanguageService } from '../../../core/services/language.service';
import { RzTranslatePipe } from '../../pipes/rz-translate.pipe';

@Component({
  selector: 'rz-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, IconComponent, RzTranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  auth = inject(AuthService);
  langService = inject(LanguageService);
  menuOpen = signal(false);
  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  get firstName(): string { return this.auth.currentUser()?.nombre?.split(' ').at(0) ?? ''; }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}
