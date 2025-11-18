export interface Equipo {
  id: number;
  codigoSICOIN: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  precioUnitario: number;
  numeroFactura?: string;
  fechaIngreso: string;
  observaciones?: string;
  fotoUrl?: string;
  garantiaHasta?: string;
  vidaUtilAnios?: number;
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
  creadoPor: {
    id: number;
    nombre: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CrearEquipoRequest {
  codigoSICOIN: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  precioUnitario: number;
  estadoId: number;
  areaId: number;
  subgrupoId: number;
  proveedorId?: number;
  numeroFactura?: string;
  fechaIngreso: string;
  observaciones?: string;
  garantiaHasta?: string;
  vidaUtilAnios?: number;
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

// Tipos para catálogos
export interface Area {
  id: number;
  nombre: string;
  jefe?: string;
  activo: boolean;
}

export interface Estado {
  id: number;
  nombre: string;
  color: string;
  activo: boolean;
}

export interface Subgrupo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Proveedor {
  id: number;
  nombreComercial: string;
  nit?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}