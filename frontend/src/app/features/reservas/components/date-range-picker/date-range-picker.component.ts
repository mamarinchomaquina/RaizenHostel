import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, OnInit, signal, computed, inject
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { HabitacionesService, ReservaFecha } from '../../../../core/services/habitaciones.service';

export interface DateRange {
  checkin: Date | null;
  checkout: Date | null;
}

interface CalendarCell {
  date: Date;
  day: number;
  disabled: boolean;
  occupied: boolean;
  inRange: boolean;
  isCheckin: boolean;
  isCheckout: boolean;
  isToday: boolean;
  price: number | null;
  isGoodPrice: boolean;
}

@Component({
  selector: 'rz-date-range-picker',
  standalone: true,
  imports: [NgFor, NgIf, IconComponent, CopCurrencyPipe],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
})
export class DateRangePickerComponent implements OnInit, OnChanges {
  @Input() precioNoche: number | null = null;
  @Input() unidadId: number | null = null;
  @Output() rangeChange = new EventEmitter<DateRange>();

  private habSvc = inject(HabitacionesService);

  MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  /* --- State --- */
  leftMonth  = signal(new Date().getMonth());
  leftYear   = signal(new Date().getFullYear());
  checkin    = signal<Date | null>(null);
  checkout   = signal<Date | null>(null);
  hoverDate  = signal<Date | null>(null);

  /* Right panel = left + 1 month */
  rightMonth = computed(() => (this.leftMonth() + 1) % 12);
  rightYear  = computed(() =>
    this.leftMonth() === 11 ? this.leftYear() + 1 : this.leftYear()
  );

  leftLabel  = computed(() => `${this.MESES[this.leftMonth()]} ${this.leftYear()}`);
  rightLabel = computed(() => `${this.MESES[this.rightMonth()]} ${this.rightYear()}`);

  leftCells:  (CalendarCell | null)[] = [];
  rightCells: (CalendarCell | null)[] = [];

  /** Set of occupied date keys (YYYY-MM-DD) from real reservations */
  private occupiedDates = new Set<string>();

  /** Stored reservation ranges from API */
  private reservaRanges: ReservaFecha[] = [];

  /* Good-price threshold: 85% of base price */
  private get goodPriceThreshold(): number {
    return (this.precioNoche ?? 0) * 0.85;
  }

  ngOnInit(): void {
    this.buildBothMonths();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unidadId'] && this.unidadId) {
      this.fetchReservasUnidad(this.unidadId);
    } else if (changes['precioNoche']) {
      this.buildBothMonths();
    }
  }

  /** Fetch real occupied dates from the API */
  private fetchReservasUnidad(unidadId: number): void {
    console.log('Fetching reservations for unit:', unidadId);
    this.habSvc.getReservasUnidad(unidadId).subscribe({
      next: (ranges) => {
        console.log('Received ranges:', ranges);
        this.reservaRanges = ranges;
        this.rebuildOccupiedDates();
        this.buildBothMonths();
      },
      error: (err) => {
        console.error('Error fetching reservations:', err);
        // If API fails, clear occupancy and rebuild
        this.reservaRanges = [];
        this.occupiedDates.clear();
        this.buildBothMonths();
      },
    });
  }

  /** Convert reservation ranges into a set of individual date keys */
  private rebuildOccupiedDates(): void {
    this.occupiedDates.clear();
    for (const range of this.reservaRanges) {
      const start = new Date(range.checkin + 'T00:00:00');
      const end   = new Date(range.checkout + 'T00:00:00');
      const cursor = new Date(start);
      while (cursor < end) {
        this.occupiedDates.add(this.dateKey(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
  }

  /* --- Navigation --- */
  prevMonth(): void {
    const today = new Date();
    if (this.leftYear() === today.getFullYear() && this.leftMonth() === today.getMonth()) return;
    let m = this.leftMonth() - 1;
    let y = this.leftYear();
    if (m < 0) { m = 11; y--; }
    this.leftMonth.set(m);
    this.leftYear.set(y);
    this.buildBothMonths();
  }

  nextMonth(): void {
    let m = this.leftMonth() + 1;
    let y = this.leftYear();
    if (m > 11) { m = 0; y++; }
    this.leftMonth.set(m);
    this.leftYear.set(y);
    this.buildBothMonths();
  }

  get canGoPrev(): boolean {
    const today = new Date();
    return !(this.leftYear() === today.getFullYear() && this.leftMonth() === today.getMonth());
  }

  /* --- Build calendars --- */
  private buildBothMonths(): void {
    this.leftCells  = this.buildMonth(this.leftYear(), this.leftMonth());
    this.rightCells = this.buildMonth(this.rightYear(), this.rightMonth());
  }

  private buildMonth(year: number, month: number): (CalendarCell | null)[] {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ci = this.checkin();
    const co = this.checkout();
    const hd = this.hoverDate();

    const cells: (CalendarCell | null)[] = [];

    // Empty cells for offset
    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const key = this.dateKey(date);
      const isPast = date < today;
      const isOccupied = this.occupiedDates.has(key);
      const dayPrice = this.getDayPrice(date);
      const isGood = dayPrice !== null && dayPrice < this.goodPriceThreshold && !isPast && !isOccupied;

      // Logic for hover range pre-visualisation
      const inHover = !!(ci && !co && hd && ((date > ci && date <= hd) || (date < ci && date >= hd)));

      cells.push({
        date,
        day: d,
        disabled: isPast,
        occupied: isOccupied && !isPast,
        isCheckin: !!ci && date.getTime() === ci.getTime(),
        isCheckout: !!co && date.getTime() === co.getTime(),
        inRange: !!(ci && co && date > ci && date < co) || inHover,
        isToday: date.getTime() === today.getTime(),
        price: !isPast ? dayPrice : null,
        isGoodPrice: isGood,
      });
    }
    return cells;
  }

  /* --- Day price (Currently flat as requested) --- */
  private getDayPrice(date: Date): number | null {
    if (!this.precioNoche) return null;
    return this.precioNoche; // Fixed price logic
  }

  private dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /* --- Mouse Interaction (Hover Preview) --- */
  handleMouseEnter(cell: CalendarCell): void {
    if (this.checkin() && !this.checkout() && !cell.disabled && !cell.occupied) {
      this.hoverDate.set(cell.date);
      this.buildBothMonths();
    }
  }

  handleMouseLeave(): void {
    if (this.hoverDate()) {
      this.hoverDate.set(null);
      this.buildBothMonths();
    }
  }

  /* --- Click handler --- */
  handleClick(cell: CalendarCell | null): void {
    if (!cell || cell.disabled || cell.occupied) return;
    if (!this.precioNoche) return;

    const ci = this.checkin();
    const co = this.checkout();

    if (ci && co) {
      // Reset — start new range
      this.checkin.set(cell.date);
      this.checkout.set(null);
    } else if (!ci) {
      this.checkin.set(cell.date);
    } else {
      if (cell.date > ci) {
        // Check if there are occupied dates between checkin and this date
        if (this.hasOccupiedBetween(ci, cell.date)) {
          // Can't select range that spans occupied dates — restart at the clicked date
          this.checkin.set(cell.date);
          this.checkout.set(null);
          console.log('Range blocked: spans over occupied dates. Resetting check-in to clicked date.');
        } else {
          this.checkout.set(cell.date);
        }
      } else if (cell.date.getTime() === ci.getTime()) {
        // Clicking checkin again resets it
        this.checkin.set(null);
      } else {
        // Clicking before checkin — update checkin
        if (this.hasOccupiedBetween(cell.date, ci)) {
          this.checkin.set(cell.date);
          this.checkout.set(null);
        } else {
          this.checkout.set(ci);
          this.checkin.set(cell.date);
        }
      }
    }

    this.hoverDate.set(null);
    this.buildBothMonths();
    this.rangeChange.emit({ checkin: this.checkin(), checkout: this.checkout() });
  }

  /** Check if there are any occupied dates between two dates */
  private hasOccupiedBetween(start: Date, end: Date): boolean {
    const s = new Date(start);
    const e = new Date(end);
    
    // Normalize to midnight
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    const cursor = new Date(s);
    // Start checking from the first night (check-in day)
    // In hotel logic, check-in day IS occupied, check-out day is NOT.
    // However, the check-in day itself is already checked in handleClick.
    // So we check from cursor+1 up to end-1.
    cursor.setDate(cursor.getDate() + 1);
    
    while (cursor < e) {
      if (this.occupiedDates.has(this.dateKey(cursor))) {
        console.warn('Found occupied date in range:', this.dateKey(cursor));
        return true;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  }

  clearDates(): void {
    this.checkin.set(null);
    this.checkout.set(null);
    this.buildBothMonths();
    this.rangeChange.emit({ checkin: null, checkout: null });
  }

  formatDate(d: Date | null): string {
    if (!d) return '--';
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get noches(): number {
    const ci = this.checkin(), co = this.checkout();
    if (!ci || !co) return 0;
    return Math.ceil(Math.abs(co.getTime() - ci.getTime()) / 86400000);
  }

  get total(): number {
    return this.noches * (this.precioNoche ?? 0);
  }

  trackByFn(index: number, cell: CalendarCell | null): string {
    if (!cell) return 'empty-' + index;
    return cell.date.getTime().toString();
  }

  formatPrice(price: number): string {
    if (price >= 1000) {
      return Math.round(price / 1000) + 'k';
    }
    return price.toString();
  }
}
