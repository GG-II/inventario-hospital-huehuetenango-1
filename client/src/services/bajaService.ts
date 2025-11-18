import api from './api';
import { Baja, CrearBajaRequest, ProcesarBajaRequest, ListarBajasQuery, PaginatedResponse } from '../types/baja';

export const bajaService = {
  async listar(query: ListarBajasQuery = {}): Promise<PaginatedResponse<Baja>> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.equipoId) params.append('equipoId', query.equipoId.toString());
    if (query.estado) params.append('estado', query.estado);
    if (query.motivo) params.append('motivo', query.motivo);

    const response = await api.get(`/bajas?${params.toString()}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Baja> {
    const response = await api.get(`/bajas/${id}`);
    return response.data.data;
  },

  async crear(data: CrearBajaRequest): Promise<Baja> {
    const response = await api.post('/bajas', data);
    return response.data.data;
  },

  async procesar(id: number, data: ProcesarBajaRequest): Promise<Baja> {
  const response = await api.patch(`/bajas/${id}/procesar`, data);
  return response.data.data;
},
};