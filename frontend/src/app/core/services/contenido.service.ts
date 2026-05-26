import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicio, GaleriaImagen } from '../models/contenido.model';

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/contenido`;

  private formatImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    try {
      const urlObj = new URL(environment.apiUrl);
      return `${urlObj.origin}${url}`;
    } catch {
      return url;
    }
  }

  getSeccion<T>(seccion: string): Observable<T> {
    return this.http.get<T>(`${this.base}/${seccion}`);
  }

  updateSeccion<T>(seccion: string, datos: T): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}/admin/contenido/${seccion}`, datos);
  }

  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${environment.apiUrl}/servicios`);
  }

  getGaleria(): Observable<GaleriaImagen[]> {
    return this.http.get<GaleriaImagen[]>(`${environment.apiUrl}/galeria`).pipe(
      map(imgs => imgs.map(img => ({
        ...img,
        url: this.formatImageUrl(img.url)
      })))
    );
  }


  uploadGaleriaImagen(file: File, datos: Partial<GaleriaImagen>): Observable<GaleriaImagen> {
    const form = new FormData();
    form.append('imagen', file);
    Object.entries(datos).forEach(([k, v]) => form.append(k, String(v)));
    return this.http.post<GaleriaImagen>(`${environment.apiUrl}/admin/galeria`, form);
  }

  deleteGaleriaImagen(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/galeria/${id}`);
  }
}
