import api from './api';
import { Usuario, CrearUsuarioRequest, ActualizarUsuarioRequest, Rol } from '../types/usuario';

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const response = await api.get('/usuarios');
    return response.data.data;
  },

  async obtenerPorId(id: number): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.data;
  },

  async crear(data: CrearUsuarioRequest): Promise<Usuario> {
    const response = await api.post('/usuarios', data);
    return response.data.data;
  },

  async actualizar(id: number, data: ActualizarUsuarioRequest): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  async listarRoles(): Promise<Rol[]> {
    const response = await api.get('/usuarios/roles');
    return response.data.data;
  },
};