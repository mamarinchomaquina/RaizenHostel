export interface TipoHabitacion {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  capacidad: number;
  precio_base: number;
  popular?: boolean;
}

export interface TipoCard {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  capacidad: number;
  precio: number;
  popular: boolean;
  categoria: 'compartido' | 'privada';
  total_unidades: number;
  unidades_disponibles: number;
  imagenes: HabitacionImagen[];
}

export interface HabitacionImagen {
  id: number;
  url: string;
  alt_text: string;
  orden: number;
}

export interface Habitacion {
  id: number;
  tipo_id: number;
  tipo?: TipoHabitacion;
  numero: string;
  nombre_display: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
  orden: number;
  imagenes?: HabitacionImagen[];
}

export interface DisponibilidadResponse {
  disponible: boolean;
  mensaje?: string;
}
