export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    usuario: {
      id: number;
      username: string;
      nombre: string;
      rol: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthUser {
  userId: number;
  username: string;
  rolId: number;
  rolNombre: string;
}