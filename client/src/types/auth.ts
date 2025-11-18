export interface User {
  id: number;
  username: string;
  nombre: string;
  rol: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    usuario: User;
  };
  error?: {
    code: string;
    message: string;
  };
}