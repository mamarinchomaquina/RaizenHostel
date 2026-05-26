import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertaComponent } from '../../../shared/components/alerta/alerta.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

function passwordMatch(ctrl: AbstractControl) {
  const pw = ctrl.get('password')?.value;
  const pw2 = ctrl.get('password2')?.value;
  return pw === pw2 ? null : { mismatch: true };
}

@Component({
  selector: 'rz-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertaComponent, IconComponent, NgIf],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistroComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal('');
  showPwd = signal(false);

  // Captcha State
  captchaChallenge = signal('');
  captchaKey       = signal('');
  captchaLoading   = signal(false);

  form = this.fb.group({
    nombre:         ['', [Validators.required, Validators.minLength(2)]],
    email:          ['', [Validators.required, Validators.email]],
    telefono:       [''],
    password:       ['', [Validators.required, Validators.minLength(6)]],
    password2:      ['', Validators.required],
    captcha_answer: ['', Validators.required],
    captcha_key:    ['', Validators.required]
  }, { validators: passwordMatch });

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
    const { password2, ...dto } = this.form.value as any;
    this.auth.registro(dto).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/']); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.mensaje ?? 'Error al crear la cuenta.');
        this.cargarCaptcha(); // Refresh captcha on failure
      },
    });
  }
}

