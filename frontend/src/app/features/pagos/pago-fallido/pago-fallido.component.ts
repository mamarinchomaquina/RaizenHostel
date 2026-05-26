import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'rz-pago-fallido',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="result-page">
      <div class="result-card">
        <div class="result-icon result-icon--error">
          <rz-icon name="x-circle" [size]="64" [strokeWidth]="1" />
        </div>
        <h1>Pago no completado</h1>
        <p>El pago fue rechazado o cancelado. Tu reserva sigue pendiente — puedes intentarlo de nuevo o contactarnos por WhatsApp.</p>
        <div class="result-actions">
          <a class="btn btn--primary" routerLink="/reservas">Intentar de nuevo</a>
          <a class="btn btn--outline" href="https://wa.me/573226477512" target="_blank" rel="noopener">Contactar por WhatsApp</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-page { min-height:80vh; display:flex; align-items:center; justify-content:center; padding:var(--sp-3xl); background:var(--crema-puro); }
    .result-card { background:var(--blanco-calido); border:var(--linea); border-radius:var(--radius-xl); padding:var(--sp-4xl); text-align:center; max-width:520px; width:100%; box-shadow:var(--shadow-md); }
    .result-icon { margin:0 auto var(--sp-2xl); width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .result-icon--error { background:rgba(139,46,28,.08); color:var(--color-error); }
    h1 { font-family:var(--font-display); font-size:var(--fs-2xl); font-weight:var(--fw-light); color:var(--raiz); margin-bottom:var(--sp-lg); }
    p { font-size:var(--fs-sm); color:var(--raiz-claro); line-height:1.7; margin-bottom:var(--sp-md); }
    .result-actions { display:flex; gap:var(--sp-md); justify-content:center; flex-wrap:wrap; margin-top:var(--sp-2xl); }
  `]
})
export class PagoFallidoComponent {}
