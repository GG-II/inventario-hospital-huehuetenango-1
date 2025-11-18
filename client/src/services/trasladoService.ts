import api from './api';
import { Traslado, CrearTrasladoRequest, ListarTrasladosQuery, PaginatedResponse } from '../types/traslado';

export const trasladoService = {
  async listar(query: ListarTrasladosQuery = {}): Promise<PaginatedResponse<Traslado>> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.equipoId) params.append('equipoId', query.equipoId.toString());
    if (query.areaOrigenId) params.append('areaOrigenId', query.areaOrigenId.toString());
    if (query.areaDestinoId) params.append('areaDestinoId', query.areaDestinoId.toString());

    const response = await api.get(`/traslados?${params.toString()}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Traslado> {
    const response = await api.get(`/traslados/${id}`);
    return response.data.data;
  },

  async crear(data: CrearTrasladoRequest): Promise<Traslado> {
    const response = await api.post('/traslados', data);
    return response.data.data;
  },
};