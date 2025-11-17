import { db } from '../config/database';
import { bajas, equipos, estados, usuarios, notificaciones } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CrearBajaRequest, ProcesarBajaRequest, ListarBajasQuery } from '../types/baja';

export const bajaService = {
  // Crear solicitud de baja
  async crear(data: CrearBajaRequest, usuarioId: number) {
    // 1. Verificar que el equipo exista
    const [equipo] = await db
      .select({
        id: equipos.id,
        codigoSICOIN: equipos.codigoSICOIN,
        descripcion: equipos.descripcion,
        estadoId: equipos.estadoId,
      })
      .from(equipos)
      .where(eq(equipos.id, data.equipoId))
      .limit(1);

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    // 2. Verificar que el equipo no esté ya dado de baja
    const [estadoBaja] = await db
      .select({ id: estados.id })
      .from(estados)
      .where(eq(estados.nombre, 'Dado de baja'))
      .limit(1);

    if (estadoBaja && equipo.estadoId === estadoBaja.id) {
      throw new Error('El equipo ya está dado de baja');
    }

    // 3. Verificar que no tenga una solicitud de baja pendiente
    const [bajaPendiente] = await db
      .select({ id: bajas.id })
      .from(bajas)
      .where(
        and(
          eq(bajas.equipoId, data.equipoId),
          eq(bajas.estado, 'PENDIENTE')
        )
      )
      .limit(1);

    if (bajaPendiente) {
      throw new Error('El equipo ya tiene una solicitud de baja pendiente');
    }

    // 4. Buscar el estado "De baja (pendiente)"
    const [estadoPendiente] = await db
      .select({ id: estados.id })
      .from(estados)
      .where(eq(estados.nombre, 'De baja (pendiente)'))
      .limit(1);

    if (!estadoPendiente) {
      throw new Error('Estado "De baja (pendiente)" no encontrado');
    }

    // 5. Crear la solicitud de baja
    const [nuevaBaja] = await db
      .insert(bajas)
      .values({
        equipoId: data.equipoId,
        motivo: data.motivo,
        observaciones: data.observaciones,
        estado: 'PENDIENTE',
        creadoPor: usuarioId,
        fechaCreacion: new Date().toISOString(),
      })
      .returning();

    // 6. Cambiar estado del equipo a "De baja (pendiente)"
    await db
      .update(equipos)
      .set({
        estadoId: estadoPendiente.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(equipos.id, data.equipoId));

    // 7. Notificar a los administradores
    const admins = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .leftJoin(sql`roles`, sql`${usuarios.rolId} = roles.id`)
      .where(sql`roles.nombre IN ('Admin', 'Inventarios')`);

    for (const admin of admins) {
      await db.insert(notificaciones).values({
        usuarioId: admin.id,
        tipo: 'BAJA_PENDIENTE',
        titulo: 'Nueva solicitud de baja',
        mensaje: `Se creó una solicitud de baja para el equipo ${equipo.codigoSICOIN}`,
        relacionadoId: data.equipoId,
        relacionadoTipo: 'EQUIPO',
        leida: false,
        createdAt: new Date().toISOString(),
      });
    }

    return await this.obtenerPorId(nuevaBaja.id);
  },

  // Obtener baja por ID
  async obtenerPorId(id: number) {
    const [baja] = await db
      .select({
        id: bajas.id,
        motivo: bajas.motivo,
        observaciones: bajas.observaciones,
        estado: bajas.estado,
        fotosUrls: bajas.fotosUrls,
        motivoRechazo: bajas.motivoRechazo,
        fechaCreacion: bajas.fechaCreacion,
        fechaAprobacion: bajas.fechaAprobacion,
        equipo: {
          id: equipos.id,
          codigoSICOIN: equipos.codigoSICOIN,
          descripcion: equipos.descripcion,
        },
        creadoPor: {
          id: sql<number>`usuario_creador.id`.as('creador_id'),
          nombre: sql<string>`usuario_creador.nombre`.as('creador_nombre'),
        },
        aprobadoPor: {
          id: sql<number>`usuario_aprobador.id`.as('aprobador_id'),
          nombre: sql<string>`usuario_aprobador.nombre`.as('aprobador_nombre'),
        },
      })
      .from(bajas)
      .leftJoin(equipos, eq(bajas.equipoId, equipos.id))
      .leftJoin(
        sql`usuarios as usuario_creador`,
        sql`${bajas.creadoPor} = usuario_creador.id`
      )
      .leftJoin(
        sql`usuarios as usuario_aprobador`,
        sql`${bajas.aprobadoPor} = usuario_aprobador.id`
      )
      .where(eq(bajas.id, id))
      .limit(1);

    if (!baja) {
      throw new Error('Solicitud de baja no encontrada');
    }

    return baja;
  },

  // Listar bajas con filtros
  async listar(query: ListarBajasQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const offset = (page - 1) * limit;

    // Construir condiciones
    const condiciones = [];

    if (query.equipoId) {
      condiciones.push(eq(bajas.equipoId, query.equipoId));
    }

    if (query.estado && query.estado !== 'TODOS') {
      condiciones.push(eq(bajas.estado, query.estado));
    }

    if (query.motivo && query.motivo !== 'TODOS') {
      condiciones.push(eq(bajas.motivo, query.motivo));
    }

    const whereClause = condiciones.length > 0 ? and(...condiciones) : undefined;

    // Contar total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bajas)
      .where(whereClause);

    // Obtener bajas
    const resultados = await db
      .select({
        id: bajas.id,
        motivo: bajas.motivo,
        observaciones: bajas.observaciones,
        estado: bajas.estado,
        fotosUrls: bajas.fotosUrls,
        motivoRechazo: bajas.motivoRechazo,
        fechaCreacion: bajas.fechaCreacion,
        fechaAprobacion: bajas.fechaAprobacion,
        equipo: {
          id: equipos.id,
          codigoSICOIN: equipos.codigoSICOIN,
          descripcion: equipos.descripcion,
        },
        creadoPor: {
          id: sql<number>`usuario_creador.id`.as('creador_id'),
          nombre: sql<string>`usuario_creador.nombre`.as('creador_nombre'),
        },
        aprobadoPor: {
          id: sql<number>`usuario_aprobador.id`.as('aprobador_id'),
          nombre: sql<string>`usuario_aprobador.nombre`.as('aprobador_nombre'),
        },
      })
      .from(bajas)
      .leftJoin(equipos, eq(bajas.equipoId, equipos.id))
      .leftJoin(
        sql`usuarios as usuario_creador`,
        sql`${bajas.creadoPor} = usuario_creador.id`
      )
      .leftJoin(
        sql`usuarios as usuario_aprobador`,
        sql`${bajas.aprobadoPor} = usuario_aprobador.id`
      )
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${bajas.fechaCreacion} DESC`);

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

  // Procesar baja (aprobar o rechazar)
  async procesar(id: number, data: ProcesarBajaRequest, usuarioId: number) {
    // 1. Obtener la baja
    const baja = await this.obtenerPorId(id);

    // 2. Verificar que esté pendiente
    if (baja.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden procesar bajas pendientes');
    }

    // 3. Obtener el equipo
    const [equipo] = await db
      .select({
        id: equipos.id,
        estadoId: equipos.estadoId,
      })
      .from(equipos)
      .where(eq(equipos.id, baja.equipo.id))
      .limit(1);

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    if (data.aprobado) {
      // APROBAR LA BAJA

      // Buscar estado "Dado de baja"
      const [estadoBaja] = await db
        .select({ id: estados.id })
        .from(estados)
        .where(eq(estados.nombre, 'Dado de baja'))
        .limit(1);

      if (!estadoBaja) {
        throw new Error('Estado "Dado de baja" no encontrado');
      }

      // Actualizar baja
      await db
        .update(bajas)
        .set({
          estado: 'APROBADO',
          aprobadoPor: usuarioId,
          fechaAprobacion: new Date().toISOString(),
        })
        .where(eq(bajas.id, id));

      // Cambiar estado del equipo
      await db
        .update(equipos)
        .set({
          estadoId: estadoBaja.id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(equipos.id, baja.equipo.id));

      // Notificar al creador
      await db.insert(notificaciones).values({
        usuarioId: baja.creadoPor.id,
        tipo: 'BAJA_APROBADA',
        titulo: 'Baja aprobada',
        mensaje: `La baja del equipo ${baja.equipo.codigoSICOIN} fue aprobada`,
        relacionadoId: baja.equipo.id,
        relacionadoTipo: 'EQUIPO',
        leida: false,
        createdAt: new Date().toISOString(),
      });

    } else {
      // RECHAZAR LA BAJA

      if (!data.motivoRechazo) {
        throw new Error('Debe proporcionar un motivo de rechazo');
      }

      // Buscar estado "Activo"
      const [estadoActivo] = await db
        .select({ id: estados.id })
        .from(estados)
        .where(eq(estados.nombre, 'Activo'))
        .limit(1);

      if (!estadoActivo) {
        throw new Error('Estado "Activo" no encontrado');
      }

      // Actualizar baja
      await db
        .update(bajas)
        .set({
          estado: 'RECHAZADO',
          aprobadoPor: usuarioId,
          motivoRechazo: data.motivoRechazo,
          fechaAprobacion: new Date().toISOString(),
        })
        .where(eq(bajas.id, id));

      // Regresar equipo a estado "Activo"
      await db
        .update(equipos)
        .set({
          estadoId: estadoActivo.id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(equipos.id, baja.equipo.id));

      // Notificar al creador
      await db.insert(notificaciones).values({
        usuarioId: baja.creadoPor.id,
        tipo: 'BAJA_RECHAZADA',
        titulo: 'Baja rechazada',
        mensaje: `La baja del equipo ${baja.equipo.codigoSICOIN} fue rechazada: ${data.motivoRechazo}`,
        relacionadoId: baja.equipo.id,
        relacionadoTipo: 'EQUIPO',
        leida: false,
        createdAt: new Date().toISOString(),
      });
    }

    return await this.obtenerPorId(id);
  },
};