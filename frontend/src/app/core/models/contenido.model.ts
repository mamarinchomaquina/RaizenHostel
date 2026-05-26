export interface ContenidoHero {
  titulo: string;
  subtitulo: string;
  cta_texto: string;
  cta_link: string;
  slides: { url: string; alt: string }[];
}

export interface ContenidoNosotros {
  titulo: string;
  parrafo1: string;
  parrafo2: string;
}

export interface ContenidoValor {
  titulo: string;
  descripcion: string;
  icono: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  icono_lucide: string;
  orden: number;
  activo: boolean;
}

export interface GaleriaImagen {
  id: number;
  url: string;
  alt_text: string;
  categoria: string;
  span_wide: boolean;
  span_tall: boolean;
  orden: number;
  activo: boolean;
}
