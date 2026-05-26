import { Injectable, signal, computed } from '@angular/core';
import { es } from '../i18n/es';
import { en } from '../i18n/en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLang = signal<'es' | 'en'>(
    (localStorage.getItem('appLang') as 'es' | 'en') || 'es'
  );

  private translations = computed(() =>
    this.currentLang() === 'en' ? en : es
  );

  setLang(lang: 'es' | 'en'): void {
    this.currentLang.set(lang);
    localStorage.setItem('appLang', lang);
  }

  toggleLanguage(): void {
    this.setLang(this.currentLang() === 'es' ? 'en' : 'es');
  }

  /** Resolve a dot-path key like 'NAVBAR.HOME' */
  t(key: string): string {
    const parts = key.split('.');
    let val: any = this.translations();
    for (const part of parts) {
      val = val?.[part];
      if (val === undefined) return key;
    }
    return typeof val === 'string' ? val : key;
  }
}
