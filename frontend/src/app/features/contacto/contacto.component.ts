import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MetaService } from '../../core/services/meta.service';
import { AlertaComponent } from '../../shared/components/alerta/alerta.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'rz-contacto',
  standalone: true,
  imports: [ReactiveFormsModule, AlertaComponent, IconComponent, RevealDirective],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss',
})
export class ContactoComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);
  private meta = inject(MetaService);

  loading = signal(false);
  error   = signal('');
  success = signal('');

  form = this.fb.group({
    nombre:  ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    asunto:  ['', Validators.required],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Contacto | Hostal en Dosquebradas, Risaralda | Raizen Hostel',
      description: 'Contáctanos para más información sobre el Raizen Hostel en Dosquebradas, Risaralda. WhatsApp, email o formulario.',
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set(''); this.success.set('');
    this.http.post(`${environment.apiUrl}/contacto`, this.form.value).subscribe({
      next: () => {
        this.success.set('¡Mensaje enviado! Te responderemos pronto.');
        this.form.reset(); this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al enviar el mensaje. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
