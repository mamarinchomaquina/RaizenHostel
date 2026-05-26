import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { HabitacionesService } from '../../../core/services/habitaciones.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { MetaService } from '../../../core/services/meta.service';
import { AuthService } from '../../../core/services/auth.service';
import { Habitacion } from '../../../core/models/habitacion.model';
import { DateRangePickerComponent, DateRange } from '../components/date-range-picker/date-range-picker.component';
import { AlertaComponent } from '../../../shared/components/alerta/alerta.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'rz-reserva-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, DateRangePickerComponent, AlertaComponent, CopCurrencyPipe, RevealDirective, IconComponent],
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.scss',
})
export class ReservaFormComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private habSvc   = inject(HabitacionesService);
  private resSvc   = inject(ReservasService);
  private authSvc  = inject(AuthService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);
  private meta     = inject(MetaService);

  habitaciones = signal<Habitacion[]>([]);
  loading      = signal(false);
  error        = signal('');

  /** Private rooms (slug starts with 'privada-') */
  habitacionesPrivadas = computed(() =>
    this.habitaciones().filter(h => h.tipo?.slug?.startsWith('privada'))
  );

  /** Shared beds (slug starts with 'cama-') */
  habitacionesCompartidas = computed(() =>
    this.habitaciones().filter(h => h.tipo?.slug?.startsWith('cama'))
  );

  checkin:  Date | null = null;
  checkout: Date | null = null;

  form = this.fb.group({
    unidad_id: [null as number | null, Validators.required],
    notas:     [''],
  });

  get habitacionSeleccionada(): Habitacion | undefined {
    const id = this.form.value.unidad_id;
    return this.habitaciones().find(h => h.id === Number(id));
  }

  get precioNoche(): number | null {
    return this.habitacionSeleccionada?.precio ?? null;
  }

  get noches(): number {
    if (!this.checkin || !this.checkout) return 0;
    return Math.ceil(Math.abs(this.checkout.getTime() - this.checkin.getTime()) / 86400000);
  }

  get total(): number {
    return this.noches * (this.precioNoche ?? 0);
  }

  isPrivada(h: Habitacion): boolean {
    return h.tipo?.slug?.startsWith('privada') ?? false;
  }

  selectUnidad(h: Habitacion): void {
    this.form.patchValue({ unidad_id: h.id });
  }

  ngOnInit(): void {
    this.meta.setPage({
      title: 'Reserva tu Estadía | Hostal Raizen Dosquebradas',
      description: 'Reserva online en Raizen Hostel, Dosquebradas. Elige fechas y paga con tarjeta, PSE o Nequi.',
    });

    if (!this.authSvc.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/reservas' } });
      return;
    }

    this.habSvc.getAll().subscribe({
      next: (data) => {
        this.habitaciones.set(data);
        const unidadParam = this.route.snapshot.queryParamMap.get('unidad');
        if (unidadParam) {
          this.form.patchValue({ unidad_id: Number(unidadParam) });
        }
        // If tipo was passed via query params, pre-select the first available unit of that type
        const tipoParam = this.route.snapshot.queryParamMap.get('tipo');
        if (tipoParam && !unidadParam) {
          const firstAvailable = data.find(h => h.tipo?.slug === tipoParam && h.disponible);
          if (firstAvailable) {
            this.form.patchValue({ unidad_id: firstAvailable.id });
          }
        }
      },
      error: () => this.error.set('No se pudieron cargar los alojamientos.'),
    });
  }

  onRangeChange(range: DateRange): void {
    this.checkin  = range.checkin;
    this.checkout = range.checkout;
  }

  submit(): void {
    if (this.form.invalid || !this.checkin || !this.checkout) {
      this.error.set('Por favor selecciona el alojamiento y las fechas.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const dto = {
      unidad_id:    this.form.value.unidad_id!,
      checkin:      this.checkin.toISOString().split('T')[0],
      checkout:     this.checkout.toISOString().split('T')[0],
      num_personas: 1,
      notas:        this.form.value.notas ?? '',
    };

    this.resSvc.crear(dto).subscribe({
      next: (reserva) => {
        this.loading.set(false);
        Swal.fire({
          title: '¡Reserva Creada!',
          text: 'Tu reserva se ha registrado. Te estamos redirigiendo al portal de pagos para confirmarla.',
          icon: 'success',
          confirmButtonColor: '#7c2d12',
          background: '#fdfbf7',
        }).then(() => {
          this.router.navigate(['/pago'], { queryParams: { reservaId: reserva.id } });
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.mensaje ?? 'Error al crear la reserva. Inténtalo de nuevo.');
      },
    });
  }
}

