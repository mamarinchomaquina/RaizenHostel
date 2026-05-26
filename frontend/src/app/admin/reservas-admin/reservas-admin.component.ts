import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe, NgClass, NgStyle } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReservasService } from '../../core/services/reservas.service';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { Reserva, EstadoReserva } from '../../core/models/reserva.model';
import { Habitacion } from '../../core/models/habitacion.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { FechaCoP } from '../../shared/pipes/fecha-co.pipe';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';


@Component({
  selector: 'rz-reservas-admin',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    IconComponent,
    BadgeComponent,
    CopCurrencyPipe,
    FechaCoP,
    DatePipe,
    NgClass,
    NgStyle,
    FullCalendarModule
  ],
  templateUrl: './reservas-admin.component.html',
  styleUrl: './reservas-admin.component.scss',
})
export class ReservasAdminComponent implements OnInit {
  private resSvc = inject(ReservasService);
  private habSvc = inject(HabitacionesService);
  private fb = inject(FormBuilder);

  viewMode = signal<'list' | 'timeline' | 'calendar'>('timeline'); // Supported three views: list, timeline, calendar
  reservas = signal<Reserva[]>([]);
  unidades = signal<Habitacion[]>([]);
  loading = signal(true);
  selected = signal<Reserva | null>(null);


  // Modal state
  showModal = signal(false);
  guardando = signal(false);

  filtros = this.fb.group({ estado: [''], fecha: [''] });

  walkinForm = this.fb.group({
    nombre: [''],
    documento: [''],
    email: [''],
    telefono: [''],
    unidad_id: [''],
    checkin: [''],
    checkout: [''],
    estado: ['confirmada']
  });

  ESTADOS: EstadoReserva[] = ['pendiente', 'pago_pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'];

  // Timeline Config
  timelineDates = signal<Date[]>([]);

  // FullCalendar Options Config
  getEventColor(estado: string): string {
    const map: Record<string, string> = {
      'confirmada': '#10b981', // green / exito
      'en_curso': '#f59e0b', // orange / dorado
      'completada': '#78716c', // neutral / arena
      'pendiente': '#3b82f6', // blue / info
      'pago_pendiente': '#3b82f6', // blue / info
      'cancelada': '#ef4444' // red / error
    };
    return map[estado] ?? '#3b82f6';
  }

  calendarOptions = computed<CalendarOptions>(() => {
    const events = this.reservas().map(r => ({
      id: r.id.toString(),
      title: `${r.usuario?.nombre} (${r.unidad?.nombre_display || 'Habs'})`,
      start: r.checkin,
      end: r.checkout,
      backgroundColor: this.getEventColor(r.estado),
      borderColor: this.getEventColor(r.estado),
      extendedProps: { reserva: r }
    }));

    return {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: events,
      locale: 'es',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek'
      },
      dateClick: (info) => this.handleDateClick(info.dateStr),
      eventClick: (info) => {
        const res = info.event.extendedProps['reserva'];
        if (res) this.selected.set(res);
      }
    };
  });

  handleDateClick(dateStr: string): void {
    // Open Walkin Modal pre-filling the selected checkin date
    const checkin = dateStr;
    // Set checkout to next day
    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 1);
    const checkout = nextDay.toISOString().split('T')[0];

    this.walkinForm.reset({
      estado: 'confirmada',
      checkin: checkin,
      checkout: checkout
    });
    this.showModal.set(true);
  }

  ngOnInit(): void {
    this.cargarUnidades();
    this.initTimelineDates();
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const f = this.filtros.value;
    this.resSvc.getAll({ estado: f.estado || '', fecha: f.fecha || '' }).subscribe({
      next: r => { this.reservas.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cargarUnidades(): void {
    this.habSvc.getAll().subscribe({
      next: u => this.unidades.set(u)
    });
  }

  cambiarEstado(id: number, estado: EstadoReserva): void {
    Swal.fire({
      title: '¿Confirmar cambio?',
      text: `¿Estás seguro de que deseas cambiar el estado de la reserva a "${estado}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c2d12',
      cancelButtonColor: '#78716c',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      background: '#fdfbf7',
    }).then((result) => {
      if (result.isConfirmed) {
        this.resSvc.updateEstado(id, estado).subscribe({
          next: (updated) => {
            this.reservas.update(rs => rs.map(r => r.id === id ? updated : r));
            if (this.selected()?.id === id) this.selected.set(updated);
            Swal.fire({
              title: '¡Estado Actualizado!',
              text: 'El estado de la reserva ha sido modificado con éxito.',
              icon: 'success',
              confirmButtonColor: '#7c2d12',
              background: '#fdfbf7',
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err?.error?.mensaje || 'No se pudo actualizar el estado de la reserva.',
              icon: 'error',
              confirmButtonColor: '#7c2d12',
              background: '#fdfbf7',
            });
          }
        });
      } else {
        this.cargar();
      }
    });
  }

  estadoBadge(estado: string): any {
    const map: Record<string, any> = { confirmada: 'exito', cancelada: 'error', en_curso: 'dorado', completada: 'arena', pendiente: 'info', pago_pendiente: 'info' };
    return map[estado] ?? 'info';
  }

  // --- Walk-in Logic ---
  abrirModalWalkin(): void {
    this.walkinForm.reset({ estado: 'confirmada' });
    this.showModal.set(true);
  }

  guardarWalkin(): void {
    if (this.walkinForm.invalid) return;

    this.guardando.set(true);
    const dto = this.walkinForm.value;

    this.resSvc.crearReservaAdmin(dto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.showModal.set(false);
        Swal.fire({
          title: '¡Walk-In Registrado!',
          text: 'El huésped y su reserva han sido registrados con éxito.',
          icon: 'success',
          confirmButtonColor: '#7c2d12',
          background: '#fdfbf7',
        });
        this.cargar(); // Recargar grid y datos
      },
      error: (err) => {
        this.guardando.set(false);
        Swal.fire({
          title: 'Error',
          text: err?.error?.mensaje || 'Error al crear la reserva.',
          icon: 'error',
          confirmButtonColor: '#7c2d12',
          background: '#fdfbf7',
        });
      }
    });
  }

  // --- Timeline Logic ---
  initTimelineDates(): void {
    const dates: Date[] = [];
    const start = new Date();
    start.setDate(start.getDate() - 3); // Start 3 days ago
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Show 30 days
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    this.timelineDates.set(dates);
  }

  isToday(d: Date): boolean {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }

  getReservationsForUnit(unidadId: number): Reserva[] {
    return this.reservas().filter(r => r.unidad_id === unidadId);
  }

  /**
   * Calculate position and width of a reservation block based on timeline dates.
   * Assumes each day column is 60px wide.
   */
  getTimelineBlockStyle(r: Reserva): any {
    const dates = this.timelineDates();
    if (dates.length === 0) return { display: 'none' };

    const firstDate = dates[0].getTime();
    const lastDate = dates[dates.length - 1].getTime();

    // Parse checkin/out to midnight times
    const checkin = new Date(r.checkin + 'T00:00:00').getTime();
    const checkout = new Date(r.checkout + 'T00:00:00').getTime();

    // If reservation is completely outside our timeline range
    if (checkout <= firstDate || checkin >= lastDate + 86400000) {
      return { display: 'none' };
    }

    const startX = Math.max(checkin, firstDate);
    const endX = Math.min(checkout, lastDate + 86400000); // add 1 day to cover the last day column

    const dayMs = 86400000;
    const offsetDays = (startX - firstDate) / dayMs;
    const durationDays = (endX - startX) / dayMs;

    return {
      left: `${offsetDays * 60}px`,
      width: `calc(${durationDays * 60}px - 4px)` // -4px for margin/gap
    };
  }

  getTimelineBlockClass(estado: string): string {
    const map: Record<string, string> = {
      'confirmada': 'block--success',
      'en_curso': 'block--warning',
      'completada': 'block--neutral',
      'pendiente': 'block--info',
      'pago_pendiente': 'block--info',
      'cancelada': 'block--danger'
    };
    return map[estado] ?? 'block--info';
  }
}
