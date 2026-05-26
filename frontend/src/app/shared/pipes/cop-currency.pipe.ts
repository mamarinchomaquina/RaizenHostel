import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'copCurrency', standalone: true })
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, suffix = '/ noche'): string {
    if (value === null || value === undefined) return '';
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return suffix ? `${formatted} ${suffix}` : formatted;
  }
}
