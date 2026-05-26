import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertaComponent } from '../../../shared/components/alerta/alerta.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'rz-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertaComponent, IconComponent, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  loading = signal(false);
  error   = signal('');
  showPwd = signal(false);

  // Captcha State
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
        this.error.set('No se pudo cargar el captcha de seguridad.');
        this.captchaLoading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.mensaje ?? 'Credenciales o captcha incorrectos.');
        this.cargarCaptcha(); // Refresh captcha on failure
      },
    });
  }
}

