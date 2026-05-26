import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

export interface DashboardKpis {
  ocupacion_porcentaje: number;
  checkins_hoy: number;
  checkouts_hoy: number;
  ingresos_hoy: number;
  reservas_pendientes: number;
  total_unidades: number;
  unidades_ocupadas: number;
}

export interface ReporteOcupacion {
  fecha: string;
  porcentaje: number;
  ocupadas: number;
  total: number;
}

export interface ReporteIngresos {
  periodo: string;
  total: number;
  reservas: number;
}

export interface ClienteAdmin {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  documento?: string;
  activo: boolean;
  created_at: string;
  total_reservas: number;
  total_gastado: number;
  ultima_reserva?: string;
}

export interface ReporteClientes {
  total_clientes: number;
  nuevos_este_mes: number;
  con_reservas: number;
  top_clientes: { id: number; nombre: string; email: string; total_reservas: number; total_gastado: number }[];
  registros_mes: { mes: string; total: number }[];
}

export interface ReporteReservasSummary {
  por_estado: { estado: string; total: number }[];
  por_mes: { mes: string; total: number; ingresos: number }[];
  top_habitaciones: { numero: string; nombre_display: string; total_reservas: number }[];
  promedio_noches: number;
  activas: number;
}

export interface MensajeContacto {
  id: number;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  estado: 'nuevo' | 'leido' | 'respondido';
  respuesta?: string;
  respondido_por?: number;
  respondido_at?: string;
  created_at: string;
}

export interface MensajeStats {
  total: number;
  nuevos: number;
  leidos: number;
  respondidos: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  // ── Dashboard ──
  getKpis(): Observable<DashboardKpis> {
    return this.http.get<DashboardKpis>(`${this.base}/dashboard/kpis`);
  }

  // ── Reportes ──
  getReporteOcupacion(dias = 30): Observable<ReporteOcupacion[]> {
    return this.http.get<ReporteOcupacion[]>(`${this.base}/reportes/ocupacion`, {
      params: new HttpParams().set('dias', dias)
    });
  }

  getReporteIngresos(periodo: 'semana' | 'mes' = 'mes'): Observable<ReporteIngresos[]> {
    return this.http.get<ReporteIngresos[]>(`${this.base}/reportes/ingresos`, {
      params: new HttpParams().set('periodo', periodo)
    });
  }

  getReporteClientes(): Observable<ReporteClientes> {
    return this.http.get<ReporteClientes>(`${this.base}/reportes/clientes`);
  }

  getReporteReservas(): Observable<ReporteReservasSummary> {
    return this.http.get<ReporteReservasSummary>(`${this.base}/reportes/reservas`);
  }

  // ── Usuarios admin ──
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/usuarios`);
  }

  crearUsuario(data: { nombre: string; email: string; password: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/usuarios`, data);
  }

  toggleUsuarioActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.base}/usuarios/${id}/estado`, { activo });
  }

  // ── Clientes ──
  getClientes(): Observable<ClienteAdmin[]> {
    return this.http.get<ClienteAdmin[]>(`${this.base}/clientes`);
  }

  toggleClienteActivo(id: number, activo: boolean): Observable<ClienteAdmin> {
    return this.http.patch<ClienteAdmin>(`${this.base}/clientes/${id}/estado`, { activo });
  }

  // ── Mensajes de contacto ──
  getMensajes(estado?: string): Observable<MensajeContacto[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<MensajeContacto[]>(`${this.base}/mensajes`, { params });
  }

  getMensajeById(id: number): Observable<MensajeContacto> {
    return this.http.get<MensajeContacto>(`${this.base}/mensajes/${id}`);
  }

  getMensajeStats(): Observable<MensajeStats> {
    return this.http.get<MensajeStats>(`${this.base}/mensajes/stats`);
  }

  responderMensaje(id: number, respuesta: string): Observable<any> {
    return this.http.post(`${this.base}/mensajes/${id}/responder`, { respuesta });
  }

  eliminarMensaje(id: number): Observable<any> {
    return this.http.delete(`${this.base}/mensajes/${id}`);
  }
}
