import api from './api';
import { Area, Estado, Subgrupo, Proveedor } from '../types/equipo';

export const catalogoService = {
  async listarAreas(): Promise<Area[]> {
    const response = await api.get('/catalogos/areas');
    return response.data.data;
  },

  async listarEstados(): Promise<Estado[]> {
    const response = await api.get('/catalogos/estados');
    return response.data.data;
  },

  async listarSubgrupos(): Promise<Subgrupo[]> {
    const response = await api.get('/catalogos/subgrupos');
    return response.data.data;
  },

  async listarProveedores(): Promise<Proveedor[]> {
    const response = await api.get('/catalogos/proveedores');
    return response.data.data;
  },
};