export interface EquipoParaReporte {
  id: number;
  codigoSICOIN: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  precioUnitario: number;
  area: string;
  estado: string;
  subgrupo: string;
  fechaIngreso: string;
}

export interface TarjetaResponsabilidad {
  area: {
    id: number;
    nombre: string;
    jefe?: string;
  };
  equipos: EquipoParaReporte[];
  totales: {
    cantidad: number;
    precioTotal: number;
    porSubgrupo: Array<{
      subgrupo: string;
      cantidad: number;
      precioTotal: number;
    }>;
  };
  fechaGeneracion: string;
}

export interface ReporteInventario {
  anio: number;
  equipos: EquipoParaReporte[];
  totales: {
    cantidad: number;
    precioTotal: number;
    porArea: Array<{
      area: string;
      cantidad: number;
      precioTotal: number;
    }>;
    porSubgrupo: Array<{
      subgrupo: string;
      cantidad: number;
      precioTotal: number;
    }>;
    porEstado: Array<{
      estado: string;
      cantidad: number;
    }>;
  };
  fechaGeneracion: string;
}