import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { PagosService } from '../../../core/services/pagos.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { MetaService } from '../../../core/services/meta.service';
import { Reserva } from '../../../core/models/reserva.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { AlertaComponent } from '../../../shared/components/alerta/alerta.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { FechaCoP } from '../../../shared/pipes/fecha-co.pipe';

@Component({
  selector: 'rz-checkout',
  standalone: true,
  imports: [NgIf, IconComponent, RevealDirective, AlertaComponent, CopCurrencyPipe, FechaCoP],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private pagosSvc = inject(PagosService);
  private resSvc   = inject(ReservasService);
  private meta     = inject(MetaService);

  reserva    = signal<Reserva | null>(null);
  loading    = signal(true);
  procesando = signal(false);
  error      = signal('');

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Pago Seguro | Raizen Hostel',
      description: 'Completa tu reserva de forma segura con Wompi.',
    });

    const id = Number(this.route.snapshot.queryParamMap.get('reservaId'));
    if (!id) { this.router.navigate(['/reservas']); return; }

    this.resSvc.getById(id).subscribe({
      next:  (r) => { this.reserva.set(r); this.loading.set(false); },
      error: ()  => { this.error.set('No se encontró la reserva.'); this.loading.set(false); },
    });
  }

  pagar(): void {
    const reserva = this.reserva();
    if (!reserva) return;

    this.procesando.set(true);
    this.error.set('');

    this.pagosSvc.iniciarPago({ reserva_id: reserva.id, metodo: 'tarjeta' }).subscribe({
      next:  (data: any) => this.submitWompiForm(data),
      error: (err) => {
        this.procesando.set(false);
        this.error.set(err?.error?.mensaje ?? 'Error al preparar el pago. Intenta de nuevo.');
      },
    });
  }

  /**
   * Web Checkout de Wompi: se construye un formulario dinámico en el DOM
   * y se hace submit vía GET hacia checkout.wompi.co/p/
   * Es el método más confiable y no depende del Widget JS.
   */
  private submitWompiForm(config: any): void {
    const WOMPI_URL = 'https://checkout.wompi.co/p/';

    // Wompi's WAF blocks redirect-url on localhost (HTTP).
    // Only send it when deployed to a real domain with HTTPS.
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const redirectUrl = isLocal
      ? null
      : `${window.location.origin}/pago/exitoso?codigo=${config.reference}`;

    const params: Record<string, string> = {
      'public-key':          config.public_key,
      'currency':            config.currency,
      'amount-in-cents':     String(config.amount_in_cents),
      'reference':           config.reference,
      'signature:integrity': config.signature,
    };

    // Solo agregar redirect-url si no estamos en localhost
    if (redirectUrl) {
      params['redirect-url'] = redirectUrl;
    }

    // Crear formulario oculto y hacer submit
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = WOMPI_URL;

    Object.entries(params).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }
}
