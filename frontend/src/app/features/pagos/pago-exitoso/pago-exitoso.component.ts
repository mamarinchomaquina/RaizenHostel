import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'rz-pago-exitoso',
  standalone: true,
  imports: [RouterLink, NgIf, IconComponent],
  template: `
    <div class="result-page">
      <div class="result-card result-card--exito">
        <div class="result-icon result-icon--exito">
          <rz-icon name="check-circle" [size]="64" [strokeWidth]="1" />
        </div>
        <h1>¡Reserva confirmada!</h1>
        <p>Tu pago fue procesado con éxito. Recibirás un correo de confirmación con los detalles de tu estadía.</p>
        <p class="result-codigo" *ngIf="codigo">Código: <strong>{{ codigo }}</strong></p>
        <p class="result-txid" *ngIf="txId">ID Transacción: <small>{{ txId }}</small></p>
        <div class="result-actions">
          <a class="btn btn--primary" routerLink="/">Volver al inicio</a>
          <a class="btn btn--outline" routerLink="/mis-reservas">Ver mis reservas</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-page { min-height: 80vh; display:flex; align-items:center; justify-content:center; padding: var(--sp-3xl); background: var(--crema-puro); }
    .result-card { background:var(--blanco-calido); border:var(--linea); border-radius:var(--radius-xl); padding:var(--sp-4xl); text-align:center; max-width:520px; width:100%; box-shadow:var(--shadow-md); }
    .result-icon { margin:0 auto var(--sp-2xl); width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .result-icon--exito { background:rgba(58,107,56,.1); color:var(--color-exito); }
    h1 { font-family:var(--font-display); font-size:var(--fs-2xl); font-weight:var(--fw-light); color:var(--raiz); margin-bottom:var(--sp-lg); }
    p { font-size:var(--fs-sm); color:var(--raiz-claro); line-height:1.7; margin-bottom:var(--sp-md); }
    .result-codigo strong { color:var(--raiz); font-family:var(--font-deco); letter-spacing:.1em; }
    .result-txid small { font-size:0.75rem; color:#aaa; }
    .result-actions { display:flex; gap:var(--sp-md); justify-content:center; flex-wrap:wrap; margin-top:var(--sp-2xl); }
  `]
})
export class PagoExitosoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http  = inject(HttpClient);

  codigo = this.route.snapshot.queryParamMap.get('codigo');
  // Wompi agrega ?id=<transaction_id> al redirect URL
  txId   = this.route.snapshot.queryParamMap.get('id');

  ngOnInit(): void {
    // Si Wompi devolvió el ID de transacción, notificar al backend para confirmar
    if (this.txId) {
      this.http.post(`${environment.apiUrl}/pagos/confirmar-wompi`, { transaction_id: this.txId })
        .subscribe({ error: (e) => console.warn('Confirmación automática fallida:', e) });
    }
  }
}
