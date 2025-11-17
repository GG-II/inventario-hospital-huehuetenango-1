export interface CrearTrasladoRequest {
  equipoId: number;
  areaDestinoId: number;
  observaciones?: string;
}

export interface TrasladoResponse {
  id: number;
  tipo: string;
  equipo: {
    id: number;
    codigoSICOIN: string;
    descripcion: string;
  };
  areaOrigen: {
    id: number;
    nombre: string;
  };
  areaDestino: {
    id: number;
    nombre: string;
  };
  folioConocimiento: string;
  observaciones?: string;
  usuario: {
    id: number;
    nombre: string;
  };
  fechaMovimiento: string;
}

export interface ListarTrasladosQuery {
  page?: number;
  limit?: number;
  equipoId?: number;
  areaOrigenId?: number;
  areaDestinoId?: number;
}