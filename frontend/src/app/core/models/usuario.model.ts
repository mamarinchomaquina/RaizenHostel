export type RolUsuario = 'huesped' | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  documento?: string;
  rol: RolUsuario;
  activo: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  usuario: Usuario;
}

export interface LoginDTO {
  email: string;
  password: string;
  captcha_answer?: string;
  captcha_key?: string;
}

export interface RegistroDTO {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  captcha_answer?: string;
  captcha_key?: string;
}

