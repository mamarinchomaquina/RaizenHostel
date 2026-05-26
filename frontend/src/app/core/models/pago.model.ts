export type MetodoPago = 'tarjeta' | 'pse' | 'nequi';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'anulado';

export interface PagoSesion {
  pago_id: number;
  proveedor_id: string;
  redirect_url?: string | null;
  sandbox?: boolean;
}

export interface PagoEstado {
  id: number;
  estado: EstadoPago;
  metodo: MetodoPago;
  monto: number;
}

export interface IniciarPagoDTO {
  reserva_id: number;
  metodo: MetodoPago;
  telefono?: string;
  banco?: string;
}
