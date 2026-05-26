import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoSesion, PagoEstado, IniciarPagoDTO } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pagos`;

  iniciarPago(dto: IniciarPagoDTO): Observable<PagoSesion> {
    return this.http.post<PagoSesion>(`${this.base}/iniciar`, dto);
  }

  verificarEstado(pagoId: number): Observable<PagoEstado> {
    return this.http.get<PagoEstado>(`${this.base}/${pagoId}/estado`);
  }
}
