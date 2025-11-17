import { db } from '../config/database';
import { equipos, areas, estados, subgrupos, proveedores, usuarios } from '../db/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';
import { CrearEquipoRequest, ActualizarEquipoRequest, ListarEquiposQuery } from '../types/equipo';

export const equipoService = {
  // Listar equipos con paginación y filtros
  async listar(query: ListarEquiposQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100); // Máximo 100 por página
    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    const condiciones = [];

    if (query.busqueda) {
      const busqueda = `%${query.busqueda}%`;
      condiciones.push(
        or(
          like(equipos.codigoSICOIN, busqueda),
          like(equipos.descripcion, busqueda),
          like(equipos.marca, busqueda),
          like(equipos.modelo, busqueda),
          like(equipos.numeroSerie, busqueda)
        )
      );
    }

    if (query.areaId) {
      condiciones.push(eq(equipos.areaId, query.areaId));
    }

    if (query.estadoId) {
      condiciones.push(eq(equipos.estadoId, query.estadoId));
    }

    if (query.subgrupoId) {
      condiciones.push(eq(equipos.subgrupoId, query.subgrupoId));
    }

    const whereClause = condiciones.length > 0 ? and(...condiciones) : undefined;

    // Contar total de registros
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(equipos)
      .where(whereClause);

    // Obtener equipos con relaciones
    const resultados = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
        marca: equipos.marca,
        modelo: equipos.modelo,
        numeroSerie: equipos.numeroSerie,
        precioUnitario: equipos.precioUnitario,
        numeroFactura: equipos.numeroFactura,
        fechaIngreso: equipos.fechaIngreso,
        observaciones: equipos.observaciones,
        fotoUrl: equipos.fotoUrl,
        garantiaHasta: equipos.garantiaHasta,
        vidaUtilAnios: equipos.vidaUtilAnios,
        createdAt: equipos.createdAt,
        updatedAt: equipos.updatedAt,
        estado: {
          id: estados.id,
          nombre: estados.nombre,
          color: estados.color,
        },
        area: {
          id: areas.id,
          nombre: areas.nombre,
          jefe: areas.jefe,
        },
        subgrupo: {
          id: subgrupos.id,
          codigo: subgrupos.codigo,
          nombre: subgrupos.nombre,
        },
        proveedor: {
          id: proveedores.id,
          nombreComercial: proveedores.nombreComercial,
        },
        creadoPor: {
          id: usuarios.id,
          nombre: usuarios.nombre,
        },
      })
      .from(equipos)
      .leftJoin(estados, eq(equipos.estadoId, estados.id))
      .leftJoin(areas, eq(equipos.areaId, areas.id))
      .leftJoin(subgrupos, eq(equipos.subgrupoId, subgrupos.id))
      .leftJoin(proveedores, eq(equipos.proveedorId, proveedores.id))
      .leftJoin(usuarios, eq(equipos.creadoPor, usuarios.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(equipos.createdAt);

    return {
      data: resultados,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  },

  // Obtener un equipo por ID
  async obtenerPorId(id: number) {
    const [equipo] = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
        marca: equipos.marca,
        modelo: equipos.modelo,
        numeroSerie: equipos.numeroSerie,
        precioUnitario: equipos.precioUnitario,
        numeroFactura: equipos.numeroFactura,
        fechaIngreso: equipos.fechaIngreso,
        observaciones: equipos.observaciones,
        fotoUrl: equipos.fotoUrl,
        garantiaHasta: equipos.garantiaHasta,
        vidaUtilAnios: equipos.vidaUtilAnios,
        createdAt: equipos.createdAt,
        updatedAt: equipos.updatedAt,
        estado: {
          id: estados.id,
          nombre: estados.nombre,
          color: estados.color,
        },
        area: {
          id: areas.id,
          nombre: areas.nombre,
          jefe: areas.jefe,
        },
        subgrupo: {
          id: subgrupos.id,
          codigo: subgrupos.codigo,
          nombre: subgrupos.nombre,
        },
        proveedor: {
          id: proveedores.id,
          nombreComercial: proveedores.nombreComercial,
        },
        creadoPor: {
          id: usuarios.id,
          nombre: usuarios.nombre,
        },
      })
      .from(equipos)
      .leftJoin(estados, eq(equipos.estadoId, estados.id))
      .leftJoin(areas, eq(equipos.areaId, areas.id))
      .leftJoin(subgrupos, eq(equipos.subgrupoId, subgrupos.id))
      .leftJoin(proveedores, eq(equipos.proveedorId, proveedores.id))
      .leftJoin(usuarios, eq(equipos.creadoPor, usuarios.id))
      .where(eq(equipos.id, id))
      .limit(1);

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    return equipo;
  },

  // Crear nuevo equipo
  async crear(data: CrearEquipoRequest, usuarioId: number) {
    // Verificar que el número de serie sea único (si se proporciona)
    if (data.numeroSerie) {
      const [existente] = await db
        .select({ id: equipos.id })
        .from(equipos)
        .where(eq(equipos.numeroSerie, data.numeroSerie))
        .limit(1);

      if (existente) {
        throw new Error('El número de serie ya existe en el sistema');
      }
    }

    // Crear equipo
    const [nuevoEquipo] = await db
      .insert(equipos)
      .values({
        ...data,
        creadoPor: usuarioId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return await this.obtenerPorId(nuevoEquipo.id);
  },

  // Actualizar equipo
  async actualizar(id: number, data: ActualizarEquipoRequest) {
    // Verificar que el equipo exista
    await this.obtenerPorId(id);

    // Verificar número de serie único (si se está actualizando)
    if (data.numeroSerie) {
      const [existente] = await db
        .select({ id: equipos.id })
        .from(equipos)
        .where(
          and(
            eq(equipos.numeroSerie, data.numeroSerie),
            sql`${equipos.id} != ${id}`
          )
        )
        .limit(1);

      if (existente) {
        throw new Error('El número de serie ya existe en otro equipo');
      }
    }

    // Actualizar
    await db
      .update(equipos)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(equipos.id, id));

    return await this.obtenerPorId(id);
  },

  // Eliminar equipo (soft delete - cambiar a estado "Dado de baja")
  async eliminar(id: number) {
    const equipo = await this.obtenerPorId(id);

    // Buscar el estado "Dado de baja"
    const [estadoBaja] = await db
      .select({ id: estados.id })
      .from(estados)
      .where(eq(estados.nombre, 'Dado de baja'))
      .limit(1);

    if (!estadoBaja) {
      throw new Error('Estado "Dado de baja" no encontrado en el sistema');
    }

    // Actualizar estado
    await db
      .update(equipos)
      .set({
        estadoId: estadoBaja.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(equipos.id, id));

    return { message: 'Equipo marcado como dado de baja' };
  },
};