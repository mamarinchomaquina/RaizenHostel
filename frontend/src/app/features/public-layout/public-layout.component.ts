import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'rz-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <rz-navbar />
    <main id="main-content">
      <router-outlet />
    </main>
    <rz-footer />

    <!-- Botón de WhatsApp Flotante -->
    <a href="https://wa.me/573226477512" class="whatsapp-float" target="_blank" rel="noopener" aria-label="WhatsApp">
      <svg viewBox="0 0 32 32">
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.733 5.476 2.016 7.787l-2.016 7.213 7.424-1.952c2.257 1.229 4.847 1.952 7.576 1.952 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.333c-2.457 0-4.757-0.655-6.745-1.792l-0.483-0.277-4.416 1.161 1.196-4.281-0.304-0.484c-1.285-2.045-2.015-4.469-2.015-7.060 0-7.351 5.981-13.333 13.333-13.333s13.333 5.981 13.333 13.333c0 7.351-5.981 13.333-13.333 13.333zM22.951 19.349c-0.381-0.191-2.256-1.113-2.604-1.239s-0.603-0.191-0.857 0.191c-0.254 0.381-0.984 1.239-1.206 1.492s-0.444 0.286-0.825 0.095c-0.381-0.191-1.609-0.593-3.064-1.891-1.132-1.009-1.897-2.255-2.119-2.636s-0.023-0.587 0.168-0.777c0.172-0.171 0.381-0.444 0.571-0.667s0.254-0.381 0.381-0.635c0.127-0.254 0.063-0.476-0.032-0.667s-0.857-2.063-1.175-2.825c-0.309-0.743-0.622-0.643-0.857-0.655s-0.476-0.016-0.73-0.016c-0.254 0-0.667 0.095-1.016 0.476s-1.333 1.302-1.333 3.175c0 1.873 1.365 3.683 1.556 3.937s2.686 4.101 6.507 5.748c0.909 0.392 1.618 0.626 2.171 0.801 0.913 0.291 1.744 0.25 2.4 0.152 0.732-0.109 2.256-0.921 2.574-1.81s0.317-1.651 0.222-1.81c-0.095-0.159-0.349-0.254-0.73-0.444z\" />
      </svg>
    </a>
  `,
  styles: [`
    #main-content {
      padding-top: var(--navbar-height);
      min-height: 100vh;
      background: var(--crema-puro);
    }
  `]
})
export class PublicLayoutComponent { }
