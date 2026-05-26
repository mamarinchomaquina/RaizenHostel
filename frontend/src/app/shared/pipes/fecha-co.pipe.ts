import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fechaCo', standalone: true })
export class FechaCoP implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '--';
    let d: Date;
    if (typeof value === 'string') {
      const isDateOnly = value.length === 10; // YYYY-MM-DD
      d = isDateOnly ? new Date(value + 'T00:00:00') : new Date(value.replace(' ', 'T'));
    } else {
      d = value;
    }
    
    // Check if valid date
    if (isNaN(d.getTime())) return 'Fecha inválida';

    return d.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
