export interface Baja {
  id: number;
  motivo: 'IRREPARABLE' | 'OBSOLETO' | 'PERDIDA_TOTAL' | 'ROBO';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observaciones?: string;
  motivoRechazo?: string;
  fechaCreacion: string;
  fechaAprobacion?: string;
  equipo: {
    id: number;
    codigoSICOIN: string;
    descripcion: string;
    marca?: string;
    modelo?: string;
    area: {
      nombre: string;
    };
  };
  creadoPor: {
    id: number;
    nombre: string;
  };
  aprobadoPor?: {
    id: number;
    nombre: string;
  };
}

export interface CrearBajaRequest {
  equipoId: number;
  motivo: 'IRREPARABLE' | 'OBSOLETO' | 'PERDIDA_TOTAL' | 'ROBO';
  observaciones: string;
}

export interface ProcesarBajaRequest {
  aprobado: boolean;
  motivoRechazo?: string;
}

export interface ListarBajasQuery {
  page?: number;
  limit?: number;
  equipoId?: number;
  estado?: string;
  motivo?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}