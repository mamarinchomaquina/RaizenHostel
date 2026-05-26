import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reserva, CrearReservaDTO } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reservas`;

  crear(dto: CrearReservaDTO): Observable<Reserva> {
    return this.http.post<Reserva>(this.base, dto);
  }

  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.base}/mis-reservas`);
  }

  getById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.base}/${id}`);
  }

  // Admin endpoints
  crearReservaAdmin(dto: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/reservas`, dto);
  }

  getAll(filtros?: Record<string, string>): Observable<Reserva[]> {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    }
    return this.http.get<Reserva[]>(`${environment.apiUrl}/admin/reservas`, { params });
  }

  updateEstado(id: number, estado: string): Observable<Reserva> {
    return this.http.patch<Reserva>(`${environment.apiUrl}/admin/reservas/${id}/estado`, { estado });
  }

  getHuespedesActuales(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${environment.apiUrl}/admin/huespedes/actuales`);
  }
}
