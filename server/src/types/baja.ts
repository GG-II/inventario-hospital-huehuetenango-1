export interface CrearBajaRequest {
  equipoId: number;
  motivo: 'IRREPARABLE' | 'OBSOLETO' | 'PERDIDA_TOTAL' | 'ROBO';
  observaciones: string;
}

export interface ProcesarBajaRequest {
  aprobado: boolean;
  motivoRechazo?: string;
}

export interface BajaResponse {
  id: number;
  equipo: {
    id: number;
    codigoSICOIN: string;
    descripcion: string;
  };
  motivo: string;
  observaciones: string;
  estado: string;
  fotosUrls?: string;
  creadoPor: {
    id: number;
    nombre: string;
  };
  aprobadoPor?: {
    id: number;
    nombre: string;
  };
  motivoRechazo?: string;
  fechaCreacion: string;
  fechaAprobacion?: string;
}

export interface ListarBajasQuery {
  page?: number;
  limit?: number;
  equipoId?: number;
  estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'TODOS';
  motivo?: 'IRREPARABLE' | 'OBSOLETO' | 'PERDIDA_TOTAL' | 'ROBO' | 'TODOS';
}