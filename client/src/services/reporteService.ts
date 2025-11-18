import api from './api';
import { ReporteInventario, TarjetaResponsabilidad } from '../types/reporte';

export const reporteService = {
  /**
   * Obtener datos del reporte de inventario (JSON)
   */
  async obtenerDatosInventario(anio?: number): Promise<ReporteInventario> {
    const params = anio ? `?anio=${anio}` : '';
    const response = await api.get(`/reportes/inventario${params}`);
    return response.data.data;
  },

  /**
   * Descargar PDF del reporte de inventario
   */
  async descargarInventarioPDF(): Promise<Blob> {
    const response = await api.get('/reportes/inventario/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Obtener datos de tarjeta de responsabilidad (JSON)
   */
  async obtenerDatosTarjeta(areaId: number): Promise<TarjetaResponsabilidad> {
    const response = await api.get(`/reportes/tarjeta/${areaId}`);
    return response.data.data;
  },

  /**
   * Descargar PDF de tarjeta de responsabilidad
   */
  async descargarTarjetaPDF(areaId: number): Promise<Blob> {
    const response = await api.get(`/reportes/tarjeta/${areaId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Obtener código QR de un equipo
   */
  async obtenerQR(equipoId: number): Promise<{
    equipoId: number;
    codigoSICOIN: string;
    qrCode: string;
    qrData: string;
  }> {
    const response = await api.get(`/reportes/qr/${equipoId}`);
    return response.data.data;
  },
};