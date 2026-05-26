import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'rzTranslate',
  standalone: true,
  pure: false, // reactivo: se re-evalúa cuando cambia el idioma
})
export class RzTranslatePipe implements PipeTransform {
  private lang = inject(LanguageService);

  transform(key: string): string {
    return this.lang.t(key);
  }
}
