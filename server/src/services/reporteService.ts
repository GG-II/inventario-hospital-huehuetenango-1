import { db } from '../config/database';
import { equipos, areas, estados, subgrupos } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import QRCode from 'qrcode';

export const reporteService = {
  // Obtener datos para reporte de inventario anual
  async inventarioAnual(anio?: number) {
    const anioActual = anio || new Date().getFullYear();
    
    // Obtener todos los equipos
    const todosEquipos = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
        marca: equipos.marca,
        modelo: equipos.modelo,
        numeroSerie: equipos.numeroSerie,
        precioUnitario: equipos.precioUnitario,
        fechaIngreso: equipos.fechaIngreso,
        area: areas.nombre,
        estado: estados.nombre,
        subgrupo: sql<string>`${subgrupos.codigo} || ' - ' || ${subgrupos.nombre}`.as('subgrupo'),
      })
      .from(equipos)
      .leftJoin(areas, eq(equipos.areaId, areas.id))
      .leftJoin(estados, eq(equipos.estadoId, estados.id))
      .leftJoin(subgrupos, eq(equipos.subgrupoId, subgrupos.id))
      .orderBy(equipos.codigoSICOIN);

    // Calcular totales
    const totalEquipos = todosEquipos.length;
    const precioTotal = todosEquipos.reduce((sum, eq) => sum + eq.precioUnitario, 0);

    // Agrupar por área
    const porArea = todosEquipos.reduce((acc, eq) => {
      const area = eq.area || 'Sin área';
      if (!acc[area]) {
        acc[area] = { cantidad: 0, precioTotal: 0 };
      }
      acc[area].cantidad++;
      acc[area].precioTotal += eq.precioUnitario;
      return acc;
    }, {} as Record<string, { cantidad: number; precioTotal: number }>);

    // Agrupar por subgrupo
    const porSubgrupo = todosEquipos.reduce((acc, eq) => {
      const subgrupo = eq.subgrupo || 'Sin subgrupo';
      if (!acc[subgrupo]) {
        acc[subgrupo] = { cantidad: 0, precioTotal: 0 };
      }
      acc[subgrupo].cantidad++;
      acc[subgrupo].precioTotal += eq.precioUnitario;
      return acc;
    }, {} as Record<string, { cantidad: number; precioTotal: number }>);

    // Agrupar por estado
    const porEstado = todosEquipos.reduce((acc, eq) => {
      const estado = eq.estado || 'Sin estado';
      if (!acc[estado]) {
        acc[estado] = 0;
      }
      acc[estado]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      anio: anioActual,
      equipos: todosEquipos,
      totales: {
        cantidad: totalEquipos,
        precioTotal,
        porArea: Object.entries(porArea).map(([area, datos]) => ({
          area,
          ...datos,
        })),
        porSubgrupo: Object.entries(porSubgrupo).map(([subgrupo, datos]) => ({
          subgrupo,
          ...datos,
        })),
        porEstado: Object.entries(porEstado).map(([estado, cantidad]) => ({
          estado,
          cantidad,
        })),
      },
      fechaGeneracion: new Date().toISOString(),
    };
  },

  // Obtener datos para tarjeta de responsabilidad
  async tarjetaResponsabilidad(areaId: number) {
    // Obtener información del área
    const [area] = await db
      .select({
        id: areas.id,
        nombre: areas.nombre,
        jefe: areas.jefe,
      })
      .from(areas)
      .where(eq(areas.id, areaId))
      .limit(1);

    if (!area) {
      throw new Error('Área no encontrada');
    }

    // Obtener equipos del área
    const equiposArea = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
        marca: equipos.marca,
        modelo: equipos.modelo,
        numeroSerie: equipos.numeroSerie,
        precioUnitario: equipos.precioUnitario,
        fechaIngreso: equipos.fechaIngreso,
        area: areas.nombre,
        estado: estados.nombre,
        subgrupo: sql<string>`${subgrupos.codigo} || ' - ' || ${subgrupos.nombre}`.as('subgrupo'),
      })
      .from(equipos)
      .leftJoin(areas, eq(equipos.areaId, areas.id))
      .leftJoin(estados, eq(equipos.estadoId, estados.id))
      .leftJoin(subgrupos, eq(equipos.subgrupoId, subgrupos.id))
      .where(eq(equipos.areaId, areaId))
      .orderBy(equipos.codigoSICOIN);

    // Calcular totales
    const totalEquipos = equiposArea.length;
    const precioTotal = equiposArea.reduce((sum, eq) => sum + eq.precioUnitario, 0);

    // Agrupar por subgrupo
    const porSubgrupo = equiposArea.reduce((acc, eq) => {
      const subgrupo = eq.subgrupo || 'Sin subgrupo';
      if (!acc[subgrupo]) {
        acc[subgrupo] = { cantidad: 0, precioTotal: 0 };
      }
      acc[subgrupo].cantidad++;
      acc[subgrupo].precioTotal += eq.precioUnitario;
      return acc;
    }, {} as Record<string, { cantidad: number; precioTotal: number }>);

    return {
      area,
      equipos: equiposArea,
      totales: {
        cantidad: totalEquipos,
        precioTotal,
        porSubgrupo: Object.entries(porSubgrupo).map(([subgrupo, datos]) => ({
          subgrupo,
          ...datos,
        })),
      },
      fechaGeneracion: new Date().toISOString(),
    };
  },

  // Generar código QR para un equipo
  async generarQR(equipoId: number) {
    // Verificar que el equipo exista
    const [equipo] = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
      })
      .from(equipos)
      .where(eq(equipos.id, equipoId))
      .limit(1);

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    // Generar datos del QR (URL que se abrirá al escanear)
    const qrData = JSON.stringify({
      equipoId: equipo.id,
      codigo: equipo.codigoSICOIN,
      url: `${process.env.APP_URL || 'http://localhost:3000'}/equipos/${equipo.id}`,
    });

    // Generar QR en base64
    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
    });

    return {
      equipoId: equipo.id,
      codigoSICOIN: equipo.codigoSICOIN,
      qrCode, // data:image/png;base64,...
      qrData,
    };
  },
};