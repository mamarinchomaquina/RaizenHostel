import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertaComponent } from '../../shared/components/alerta/alerta.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'rz-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, AlertaComponent, IconComponent, NgIf],
  template: `
    <div class="admin-login-page">
      <div class="admin-login-card">
        <div class="admin-login-header">
          <rz-icon name="shield" [size]="36" />
          <h1>Panel Administrativo</h1>
          <p>Raizen Hostel · Acceso restringido</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" formControlName="email" placeholder="admin@raizenhostel.com" autocomplete="username" />
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-icon-wrap">
              <input [type]="showPwd() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
              <button type="button" class="input-toggle" (click)="showPwd.update(v=>!v)">
                <rz-icon [name]="showPwd() ? 'eye-off' : 'eye'" [size]="16" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Verificación de seguridad</label>
            <div class="captcha-container">
              <div class="captcha-challenge-box" [class.captcha-loading]="captchaLoading()">
                <span class="captcha-math">{{ captchaChallenge() }}</span>
                <button type="button" class="btn-refresh" (click)="cargarCaptcha()" title="Recargar Captcha">
                  <rz-icon name="loader" [size]="14" class="spin" *ngIf="captchaLoading()" />
                  <rz-icon name="info" [size]="14" *ngIf="!captchaLoading()" />
                </button>
              </div>
              <div class="input-icon-wrap captcha-input-wrap">
                <input type="text" formControlName="captcha_answer" placeholder="Resultado" autocomplete="off" />
              </div>
            </div>
          </div>
          <rz-alerta [mensaje]="error()" tipo="error" />
          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading() || form.invalid">
            {{ loading() ? 'Verificando...' : 'Ingresar al panel' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page { min-height:100vh; background:var(--carbon); display:flex; align-items:center; justify-content:center; padding:var(--sp-2xl); }
    .admin-login-card { background:var(--blanco-calido); border-radius:var(--radius-xl); padding:var(--sp-3xl); width:100%; max-width:400px; box-shadow:0 24px 80px rgba(0,0,0,.4); }
    .admin-login-header { text-align:center; margin-bottom:var(--sp-2xl); rz-icon { color:var(--raiz); margin-bottom:var(--sp-md); } h1 { font-family:var(--font-display); font-size:var(--fs-2xl); font-weight:var(--fw-light); color:var(--raiz); } p { font-size:var(--fs-sm); color:var(--raiz-claro); margin-top:var(--sp-xs); } }
    form { display:flex; flex-direction:column; gap:var(--sp-lg); }
    .btn--full { width:100%; }
    .input-icon-wrap { position:relative; display:flex; align-items:center; input { width:100%; } .input-toggle { position:absolute; right:.75rem; background:none; border:none; cursor:pointer; color:var(--arena); display:flex; &:hover { color:var(--raiz-claro); } } }
    .captcha-container { display:flex; gap:var(--sp-sm); align-items:center; }
    .captcha-challenge-box { background:var(--arena-clara); border-radius:var(--radius-md); padding:var(--sp-sm) var(--sp-md); display:flex; align-items:center; gap:var(--sp-sm); min-width:100px; justify-content:space-between; border:1px solid var(--arena); }
    .captcha-challenge-box.captcha-loading { opacity:0.5; pointer-events:none; }
    .captcha-math { font-family:var(--font-mono); font-weight:var(--fw-bold); color:var(--carbon); font-size:var(--fs-md); letter-spacing:2px; }
    .btn-refresh { background:none; border:none; cursor:pointer; color:var(--raiz); display:flex; padding:0; transition:color .2s; &:hover { color:var(--hoja); } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .captcha-input-wrap { flex:1; }
  `]
})
export class AdminLoginComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal('');
  showPwd = signal(false);

  captchaChallenge = signal('');
  captchaKey       = signal('');
  captchaLoading   = signal(false);

  form = this.fb.group({
    email:          ['', [Validators.required, Validators.email]],
    password:       ['', Validators.required],
    captcha_answer: ['', Validators.required],
    captcha_key:    ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargarCaptcha();
  }

  cargarCaptcha(): void {
    this.captchaLoading.set(true);
    this.auth.getCaptcha().subscribe({
      next: (res) => {
        this.captchaChallenge.set(res.challenge);
        this.captchaKey.set(res.key);
        this.form.patchValue({ captcha_key: res.key, captcha_answer: '' });
        this.captchaLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el captcha.');
        this.captchaLoading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        if (res.usuario.rol !== 'admin') {
          this.auth.logout();
          this.error.set('No tienes permisos de administrador.');
          this.loading.set(false);
          return;
        }
        this.router.navigate(['/raizen-admin/dashboard']);
      },
      error: (err) => { 
        this.loading.set(false); 
        this.error.set(err?.error?.mensaje ?? 'Credenciales incorrectas.'); 
        this.cargarCaptcha();
      },
    });
  }
}
