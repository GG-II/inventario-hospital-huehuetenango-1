export interface CrearEquipoRequest {
  codigoSICOIN: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  precioUnitario: number; // En centavos (ej: 150000 = Q1,500.00)
  estadoId: number;
  areaId: number;
  subgrupoId: number;
  proveedorId?: number;
  numeroFactura?: string;
  fechaIngreso: string; // ISO string
  observaciones?: string;
  garantiaHasta?: string;
  vidaUtilAnios?: number;
}

export interface ActualizarEquipoRequest {
  descripcion?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  estadoId?: number;
  areaId?: number;
  observaciones?: string;
  garantiaHasta?: string;
  vidaUtilAnios?: number;
}

export interface EquipoResponse {
  id: number;
  codigoSICOIN: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  precioUnitario: number;
  estado: {
    id: number;
    nombre: string;
    color: string;
  };
  area: {
    id: number;
    nombre: string;
    jefe?: string;
  };
  subgrupo: {
    id: number;
    codigo: string;
    nombre: string;
  };
  proveedor?: {
    id: number;
    nombreComercial: string;
  };
  numeroFactura?: string;
  fechaIngreso: string;
  observaciones?: string;
  fotoUrl?: string;
  garantiaHasta?: string;
  vidaUtilAnios?: number;
  creadoPor: {
    id: number;
    nombre: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ListarEquiposQuery {
  page?: number;
  limit?: number;
  busqueda?: string;
  areaId?: number;
  estadoId?: number;
  subgrupoId?: number;
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