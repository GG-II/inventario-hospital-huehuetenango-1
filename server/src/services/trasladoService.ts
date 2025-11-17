import { db } from '../config/database';
import { movimientos, equipos, areas, usuarios, notificaciones, subgrupos } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CrearTrasladoRequest, ListarTrasladosQuery } from '../types/traslado';

export const trasladoService = {
  // Generar folio automático: CONOC-AAAAMM-NNNN
  async generarFolio(): Promise<string> {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const prefijo = `CONOC-${anio}${mes}`;

    // Buscar el último folio del mes
    const [ultimoMovimiento] = await db
      .select({ folioConocimiento: movimientos.folioConocimiento })
      .from(movimientos)
      .where(sql`${movimientos.folioConocimiento} LIKE ${`${prefijo}%`}`)
      .orderBy(sql`${movimientos.folioConocimiento} DESC`)
      .limit(1);

    if (!ultimoMovimiento || !ultimoMovimiento.folioConocimiento) {
      // Primer conocimiento del mes
      return `${prefijo}-0001`;
    }

    // Extraer el número del último folio
    const ultimoNumero = parseInt(ultimoMovimiento.folioConocimiento.split('-')[2], 10);
    const nuevoNumero = String(ultimoNumero + 1).padStart(4, '0');

    return `${prefijo}-${nuevoNumero}`;
  },

  // Crear traslado
  async crear(data: CrearTrasladoRequest, usuarioId: number) {
    // 1. Verificar que el equipo exista
    const [equipo] = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
        areaId: equipos.areaId,
        subgrupoId: equipos.subgrupoId,
      })
      .from(equipos)
      .where(eq(equipos.id, data.equipoId))
      .limit(1);

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    // 2. Verificar que el área destino exista
    const [areaDestino] = await db
      .select({ id: areas.id, nombre: areas.nombre })
      .from(areas)
      .where(eq(areas.id, data.areaDestinoId))
      .limit(1);

    if (!areaDestino) {
      throw new Error('Área de destino no encontrada');
    }

    // 3. Validar que no sea al mismo lugar
    if (equipo.areaId === data.areaDestinoId) {
      throw new Error('El equipo ya está en esa área');
    }

    // 4. Obtener área origen
    const [areaOrigen] = await db
      .select({ id: areas.id, nombre: areas.nombre })
      .from(areas)
      .where(eq(areas.id, equipo.areaId))
      .limit(1);

    if (!areaOrigen) {
      throw new Error('Área de origen no encontrada');
    }

    // 5. Generar folio de conocimiento
    const folio = await this.generarFolio();

    // 6. Crear el movimiento
    const [nuevoMovimiento] = await db
      .insert(movimientos)
      .values({
        equipoId: data.equipoId,
        tipo: 'TRASLADO',
        areaOrigenId: equipo.areaId,
        areaDestinoId: data.areaDestinoId,
        folioConocimiento: folio,
        observaciones: data.observaciones,
        usuarioId,
        fechaMovimiento: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    // 7. Actualizar ubicación del equipo
    await db
      .update(equipos)
      .set({
        areaId: data.areaDestinoId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(equipos.id, data.equipoId));

    // 8. Si es equipo de cómputo (subgrupo 328), notificar a Informática
    if (equipo.subgrupoId === 7) { // ID del subgrupo "328 - De cómputo"
      // Buscar usuarios del área de Informática
      const [areaInformatica] = await db
        .select({ id: areas.id })
        .from(areas)
        .where(eq(areas.nombre, 'Informática'))
        .limit(1);

      if (areaInformatica) {
        const usuariosInformatica = await db
          .select({ id: usuarios.id })
          .from(usuarios)
          .where(eq(usuarios.areaId, areaInformatica.id));

        // Crear notificaciones
        for (const usuarioInf of usuariosInformatica) {
          await db.insert(notificaciones).values({
            usuarioId: usuarioInf.id,
            tipo: 'TRASLADO_EQUIPO',
            titulo: 'Traslado de equipo de cómputo',
            mensaje: `Se trasladó el equipo ${equipo.codigoSICOIN} de ${areaOrigen.nombre} a ${areaDestino.nombre}`,
            relacionadoId: data.equipoId,
            relacionadoTipo: 'EQUIPO',
            leida: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // 9. Retornar el traslado completo
    return await this.obtenerPorId(nuevoMovimiento.id);
  },

  // Obtener traslado por ID
  async obtenerPorId(id: number) {
    const [traslado] = await db
      .select({
        id: movimientos.id,
        tipo: movimientos.tipo,
        folioConocimiento: movimientos.folioConocimiento,
        observaciones: movimientos.observaciones,
        fechaMovimiento: movimientos.fechaMovimiento,
        equipo: {
          id: equipos.id,
          codigoSICOIN: equipos.codigoSICOIN,
          descripcion: equipos.descripcion,
        },
        areaOrigen: {
          id: sql<number>`${areas.id}`.as('area_origen_id'),
          nombre: sql<string>`${areas.nombre}`.as('area_origen_nombre'),
        },
        areaDestino: {
          id: sql<number>`area_destino.id`.as('area_destino_id'),
          nombre: sql<string>`area_destino.nombre`.as('area_destino_nombre'),
        },
        usuario: {
          id: usuarios.id,
          nombre: usuarios.nombre,
        },
      })
      .from(movimientos)
      .leftJoin(equipos, eq(movimientos.equipoId, equipos.id))
      .leftJoin(areas, eq(movimientos.areaOrigenId, areas.id))
      .leftJoin(
        sql`areas as area_destino`,
        sql`${movimientos.areaDestinoId} = area_destino.id`
      )
      .leftJoin(usuarios, eq(movimientos.usuarioId, usuarios.id))
      .where(eq(movimientos.id, id))
      .limit(1);

    if (!traslado) {
      throw new Error('Traslado no encontrado');
    }

    return traslado;
  },

  // Listar traslados con paginación y filtros
  async listar(query: ListarTrasladosQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const offset = (page - 1) * limit;

    // Construir condiciones
    const condiciones = [];

    if (query.equipoId) {
      condiciones.push(eq(movimientos.equipoId, query.equipoId));
    }

    if (query.areaOrigenId) {
      condiciones.push(eq(movimientos.areaOrigenId, query.areaOrigenId));
    }

    if (query.areaDestinoId) {
      condiciones.push(eq(movimientos.areaDestinoId, query.areaDestinoId));
    }

    const whereClause = condiciones.length > 0 ? and(...condiciones) : undefined;

    // Contar total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(movimientos)
      .where(whereClause);

    // Obtener traslados
    const resultados = await db
      .select({
        id: movimientos.id,
        tipo: movimientos.tipo,
        folioConocimiento: movimientos.folioConocimiento,
        observaciones: movimientos.observaciones,
        fechaMovimiento: movimientos.fechaMovimiento,
        equipo: {
          id: equipos.id,
          codigoSICOIN: equipos.codigoSICOIN,
          descripcion: equipos.descripcion,
        },
        areaOrigen: {
          id: sql<number>`${areas.id}`.as('area_origen_id'),
          nombre: sql<string>`${areas.nombre}`.as('area_origen_nombre'),
        },
        areaDestino: {
          id: sql<number>`area_destino.id`.as('area_destino_id'),
          nombre: sql<string>`area_destino.nombre`.as('area_destino_nombre'),
        },
        usuario: {
          id: usuarios.id,
          nombre: usuarios.nombre,
        },
      })
      .from(movimientos)
      .leftJoin(equipos, eq(movimientos.equipoId, equipos.id))
      .leftJoin(areas, eq(movimientos.areaOrigenId, areas.id))
      .leftJoin(
        sql`areas as area_destino`,
        sql`${movimientos.areaDestinoId} = area_destino.id`
      )
      .leftJoin(usuarios, eq(movimientos.usuarioId, usuarios.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${movimientos.fechaMovimiento} DESC`);

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

  // Obtener historial de un equipo
  async historialEquipo(equipoId: number) {
    return await db
      .select({
        id: movimientos.id,
        tipo: movimientos.tipo,
        folioConocimiento: movimientos.folioConocimiento,
        observaciones: movimientos.observaciones,
        fechaMovimiento: movimientos.fechaMovimiento,
        areaOrigen: {
          id: sql<number>`${areas.id}`.as('area_origen_id'),
          nombre: sql<string>`${areas.nombre}`.as('area_origen_nombre'),
        },
        areaDestino: {
          id: sql<number>`area_destino.id`.as('area_destino_id'),
          nombre: sql<string>`area_destino.nombre`.as('area_destino_nombre'),
        },
        usuario: {
          id: usuarios.id,
          nombre: usuarios.nombre,
        },
      })
      .from(movimientos)
      .leftJoin(areas, eq(movimientos.areaOrigenId, areas.id))
      .leftJoin(
        sql`areas as area_destino`,
        sql`${movimientos.areaDestinoId} = area_destino.id`
      )
      .leftJoin(usuarios, eq(movimientos.usuarioId, usuarios.id))
      .where(eq(movimientos.equipoId, equipoId))
      .orderBy(sql`${movimientos.fechaMovimiento} DESC`);
  },
};