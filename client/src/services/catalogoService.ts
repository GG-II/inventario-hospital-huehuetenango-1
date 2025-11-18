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

  // CRUD de Áreas
async crearArea(data: { nombre: string; jefe?: string }): Promise<Area> {
  const response = await api.post('/catalogos/areas', data);
  return response.data.data;
},

async actualizarArea(id: number, data: { nombre: string; jefe?: string }): Promise<Area> {
  const response = await api.put(`/catalogos/areas/${id}`, data);
  return response.data.data;
},

async eliminarArea(id: number): Promise<void> {
  await api.delete(`/catalogos/areas/${id}`);
},

// CRUD de Proveedores
async crearProveedor(data: { 
  nombreComercial: string; 
  nombreFiscal?: string;
  nit?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}): Promise<Proveedor> {
  const response = await api.post('/catalogos/proveedores', data);
  return response.data.data;
},

async actualizarProveedor(id: number, data: {
  nombreComercial?: string;
  nombreFiscal?: string;
  nit?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}): Promise<Proveedor> {
  const response = await api.put(`/catalogos/proveedores/${id}`, data);
  return response.data.data;
},

async eliminarProveedor(id: number): Promise<void> {
  await api.delete(`/catalogos/proveedores/${id}`);
},
};