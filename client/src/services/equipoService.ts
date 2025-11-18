import api from './api';
import { Equipo, CrearEquipoRequest, ListarEquiposQuery, PaginatedResponse } from '../types/equipo';

export const equipoService = {
  async listar(query: ListarEquiposQuery = {}): Promise<PaginatedResponse<Equipo>> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.busqueda) params.append('busqueda', query.busqueda);
    if (query.areaId) params.append('areaId', query.areaId.toString());
    if (query.estadoId) params.append('estadoId', query.estadoId.toString());
    if (query.subgrupoId) params.append('subgrupoId', query.subgrupoId.toString());

    const response = await api.get(`/equipos?${params.toString()}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Equipo> {
    const response = await api.get(`/equipos/${id}`);
    return response.data.data;
  },

  async crear(data: CrearEquipoRequest): Promise<Equipo> {
    const response = await api.post('/equipos', data);
    return response.data.data;
  },

  async actualizar(id: number, data: Partial<CrearEquipoRequest>): Promise<Equipo> {
    const response = await api.put(`/equipos/${id}`, data);
    return response.data.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/equipos/${id}`);
  },

  async obtenerHistorial(id: number) {
    const response = await api.get(`/equipos/${id}/historial`);
    return response.data.data;
  },

  async subirFoto(equipoId: number, file: File): Promise<{ fotoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/equipos/${equipoId}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async eliminarFoto(equipoId: number): Promise<void> {
    await api.delete(`/equipos/${equipoId}/foto`);
  },
};