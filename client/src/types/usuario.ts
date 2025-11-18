export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: {
    id: number;
    nombre: string;
  };
  createdAt: string;
}

export interface CrearUsuarioRequest {
  username: string;
  password: string;
  nombre: string;
  email: string;
  rolId: number;
}

export interface ActualizarUsuarioRequest {
  nombre?: string;
  email?: string;
  rolId?: number;
  password?: string; // Solo si se quiere cambiar
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}