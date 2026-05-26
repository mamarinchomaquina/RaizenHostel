import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'rz-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="result-page">
      <div class="result-card">
        <div class="not-found-num">404</div>
        <h1>Página no encontrada</h1>
        <p>El contenido que buscas no existe o fue movido. Regresa al inicio y explora el hostal.</p>
        <a class="btn btn--primary" routerLink="/">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .result-page { min-height:80vh; display:flex; align-items:center; justify-content:center; padding:var(--sp-3xl); background:var(--crema-puro); }
    .result-card { text-align:center; max-width:480px; }
    .not-found-num { font-family:var(--font-display); font-size:clamp(6rem,15vw,10rem); font-weight:var(--fw-light); color:var(--arena); line-height:1; margin-bottom:var(--sp-md); }
    h1 { font-family:var(--font-display); font-size:var(--fs-2xl); font-weight:var(--fw-light); color:var(--raiz); margin-bottom:var(--sp-lg); }
    p { font-size:var(--fs-sm); color:var(--raiz-claro); margin-bottom:var(--sp-2xl); }
  `]
})
export class NotFoundComponent {}
