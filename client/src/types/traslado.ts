export interface Traslado {
  id: number;
  tipo: string;
  folioConocimiento: string;
  observaciones?: string;
  fechaMovimiento: string;
  equipo: {
    id: number;
    codigoSICOIN: string;
    descripcion: string;
    marca?: string;
    modelo?: string;
  };
  areaOrigen: {
    id: number;
    nombre: string;
    jefe?: string;
  };
  areaDestino: {
    id: number;
    nombre: string;
    jefe?: string;
  };
  usuario: {
    id: number;
    nombre: string;
  };
  createdAt: string;
}

export interface CrearTrasladoRequest {
  equipoId: number;
  areaDestinoId: number;
  observaciones?: string;
}

export interface ListarTrasladosQuery {
  page?: number;
  limit?: number;
  equipoId?: number;
  areaOrigenId?: number;
  areaDestinoId?: number;
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