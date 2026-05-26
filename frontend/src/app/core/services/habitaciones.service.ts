import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Habitacion, TipoCard, DisponibilidadResponse } from '../models/habitacion.model';

export interface ReservaFecha {
  checkin: string;
  checkout: string;
}

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/habitaciones`;

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

  getAll(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.base).pipe(
      map(habs => habs.map(h => ({
        ...h,
        imagenes: h.imagenes ? h.imagenes.map(img => ({
          ...img,
          url: this.formatImageUrl(img.url)
        })) : []
      })))
    );
  }

  /** GET /api/habitaciones/tipos — para la página pública de habitaciones */
  getTipos(): Observable<TipoCard[]> {
    return this.http.get<TipoCard[]>(`${this.base}/tipos`).pipe(
      map(tipos => tipos.map(t => ({
        ...t,
        imagenes: t.imagenes ? t.imagenes.map(img => ({
          ...img,
          url: this.formatImageUrl(img.url)
        })) : []
      })))
    );
  }


  /** Admin: listar tipos con precio_base editable */
  getAdminTipos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/tipos-habitacion`);
  }

  /** Admin: actualizar tipo (precio, nombre, descripcion) */
  updateTipo(id: number, data: { nombre?: string; descripcion?: string; precio_base?: number; popular?: boolean }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/tipos-habitacion/${id}`, data);
  }

  getById(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.base}/${id}`).pipe(
      map(h => ({
        ...h,
        imagenes: h.imagenes ? h.imagenes.map(img => ({
          ...img,
          url: this.formatImageUrl(img.url)
        })) : []
      }))
    );
  }

  checkDisponibilidad(id: number, checkin: string, checkout: string): Observable<DisponibilidadResponse> {
    const params = new HttpParams().set('checkin', checkin).set('checkout', checkout);
    return this.http.get<DisponibilidadResponse>(`${this.base}/${id}/disponibilidad`, { params });
  }

  /** Fetches all active reservation date ranges for a given room */
  getReservasUnidad(id: number): Observable<ReservaFecha[]> {
    return this.http.get<ReservaFecha[]>(`${this.base}/${id}/reservas`);
  }

  update(id: number, data: Partial<Habitacion>): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${environment.apiUrl}/admin/habitaciones/${id}`, data);
  }

  uploadImagen(id: number, file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('imagen', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/admin/habitaciones/${id}/imagenes`, form);
  }

  deleteImagen(habitacionId: number, imagenId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/habitaciones/${habitacionId}/imagenes/${imagenId}`);
  }
}
