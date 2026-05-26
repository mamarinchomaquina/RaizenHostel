export type EstadoReserva =
  | 'pendiente'
  | 'pago_pendiente'
  | 'confirmada'
  | 'en_curso'
  | 'completada'
  | 'cancelada';

export interface Reserva {
  id: number;
  codigo: string;
  usuario_id: number;
  unidad_id: number;
  unidad?: {
    numero: string;
    nombre_display: string;
  };
  usuario?: {
    nombre: string;
    email: string;
    telefono?: string;
    documento?: string;
  };
  checkin: string;
  checkout: string;
  noches: number;
  num_personas: number;
  precio_noche: number;
  total: number;
  estado: EstadoReserva;
  notas?: string;
  created_at: string;
}

export interface CrearReservaDTO {
  unidad_id: number;
  checkin: string;
  checkout: string;
  num_personas: number;
  notas?: string;
}
