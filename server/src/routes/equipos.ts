import { FastifyPluginAsync } from 'fastify';
import { equipoService } from '../services/equipoService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  CrearEquipoRequest,
  ActualizarEquipoRequest,
  ListarEquiposQuery,
  PaginatedResponse,
  EquipoResponse,
} from '../types/equipo';

const equiposRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/equipos - Listar equipos
  fastify.get<{ Querystring: ListarEquiposQuery }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const resultado = await equipoService.listar(request.query);

        return reply.send({
          success: true,
          ...resultado,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(500).send({
          success: false,
          error: {
            code: 'LIST_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // GET /api/equipos/:id - Obtener equipo por ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);

        if (isNaN(id)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID inválido',
            },
          });
        }

        const equipo = await equipoService.obtenerPorId(id);

        return reply.send({
          success: true,
          data: equipo,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'GET_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // POST /api/equipos - Crear nuevo equipo
  fastify.post<{ Body: CrearEquipoRequest }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { codigoSICOIN, descripcion, precioUnitario, estadoId, areaId, subgrupoId, fechaIngreso } = request.body;

        if (!codigoSICOIN || !descripcion || !precioUnitario || !estadoId || !areaId || !subgrupoId || !fechaIngreso) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELDS',
              message: 'Campos requeridos: codigoSICOIN, descripcion, precioUnitario, estadoId, areaId, subgrupoId, fechaIngreso',
            },
          });
        }

        const nuevoEquipo = await equipoService.crear(
          request.body,
          request.user!.userId
        );

        return reply.code(201).send({
          success: true,
          data: nuevoEquipo,
          message: 'Equipo creado exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(400).send({
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // PUT /api/equipos/:id - Actualizar equipo
  fastify.put<{ Params: { id: string }; Body: ActualizarEquipoRequest }>(
    '/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);

        if (isNaN(id)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID inválido',
            },
          });
        }

        const equipoActualizado = await equipoService.actualizar(id, request.body);

        return reply.send({
          success: true,
          data: equipoActualizado,
          message: 'Equipo actualizado exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 400;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // DELETE /api/equipos/:id - Eliminar (soft delete)
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);

        if (isNaN(id)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID inválido',
            },
          });
        }

        const resultado = await equipoService.eliminar(id);

        return reply.send({
          success: true,
          message: resultado.message,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // POST /api/equipos/:id/foto - Subir foto
  fastify.post<{ Params: { id: string } }>(
    '/:id/foto',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const id = parseInt(request.params.id, 10);

        if (isNaN(id)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID inválido',
            },
          });
        }

        const data = await request.file();
        
        if (!data) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'NO_FILE',
              message: 'No se recibió ningún archivo',
            },
          });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(data.mimetype)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_TYPE',
              message: 'Solo se permiten archivos JPG o PNG',
            },
          });
        }

        const buffer = await data.toBuffer();
        const base64 = buffer.toString('base64');
        const fotoUrl = `data:${data.mimetype};base64,${base64}`;

        await equipoService.actualizar(id, { fotoUrl } as any);

        return reply.send({
          success: true,
          data: { fotoUrl },
          message: 'Foto subida exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(500).send({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // DELETE /api/equipos/:id/foto - Eliminar foto
  fastify.delete<{ Params: { id: string } }>(
    '/:id/foto',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);

        if (isNaN(id)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID inválido',
            },
          });
        }

        await equipoService.actualizar(id, { fotoUrl: null } as any);

        return reply.send({
          success: true,
          message: 'Foto eliminada exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(500).send({
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );


// GET /api/equipos/:id/historial - Obtener historial
fastify.get<{ Params: { id: string } }>(
  '/:id/historial',
  {
    preHandler: [requireAuth],
  },
  async (request, reply) => {
    try {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'ID inválido',
          },
        });
      }

      // Importar db y schemas necesarios
      const { db } = await import('../config/database');
      const { movimientos } = await import('../db/schema/movimientos');
      const { auditoria } = await import('../db/schema/auditoria');
      const { areas } = await import('../db/schema/catalogos');
      const { usuarios } = await import('../db/schema/usuarios');
      const { eq } = await import('drizzle-orm');

      // Obtener movimientos (traslados)
      const movimientosData = await db
        .select({
          id: movimientos.id,
          tipo: movimientos.tipo,
          folioConocimiento: movimientos.folioConocimiento,
          fechaMovimiento: movimientos.fechaMovimiento,
          observaciones: movimientos.observaciones,
          areaOrigenId: movimientos.areaOrigenId,
          areaDestinoId: movimientos.areaDestinoId,
          usuarioId: movimientos.usuarioId,
        })
        .from(movimientos)
        .where(eq(movimientos.equipoId, id))
        .orderBy(movimientos.fechaMovimiento);

      // Obtener datos relacionados de áreas y usuarios para movimientos
      const movimientosCompletos = await Promise.all(
        movimientosData.map(async (mov) => {
          const [areaOrigen, areaDestino, usuario] = await Promise.all([
            db.select().from(areas).where(eq(areas.id, mov.areaOrigenId)).limit(1),
            db.select().from(areas).where(eq(areas.id, mov.areaDestinoId)).limit(1),
            db.select().from(usuarios).where(eq(usuarios.id, mov.usuarioId)).limit(1),
          ]);

          return {
            id: mov.id,
            tipo: mov.tipo,
            folioConocimiento: mov.folioConocimiento,
            fechaMovimiento: mov.fechaMovimiento,
            observaciones: mov.observaciones,
            areaOrigen: {
              id: areaOrigen[0].id,
              nombre: areaOrigen[0].nombre,
            },
            areaDestino: {
              id: areaDestino[0].id,
              nombre: areaDestino[0].nombre,
            },
            usuario: {
              id: usuario[0].id,
              nombre: usuario[0].nombre,
            },
          };
        })
      );

      // Obtener registros de auditoría
      const auditoriaData = await db
        .select({
          id: auditoria.id,
          accion: auditoria.accion,
          tabla: auditoria.tabla,
          datosAntes: auditoria.datosAntes,
          datosDespues: auditoria.datosDespues,
          createdAt: auditoria.createdAt,
          usuarioId: auditoria.usuarioId,
        })
        .from(auditoria)
        .where(eq(auditoria.registroId, id))
        .orderBy(auditoria.createdAt);

      // Obtener datos de usuarios para auditoría
      const auditoriaCompleta = await Promise.all(
        auditoriaData.map(async (audit) => {
          const usuario = await db
            .select()
            .from(usuarios)
            .where(eq(usuarios.id, audit.usuarioId))
            .limit(1);

          return {
            id: audit.id,
            accion: audit.accion,
            tabla: audit.tabla,
            datosAntes: audit.datosAntes ? JSON.parse(audit.datosAntes) : null,
            datosDespues: audit.datosDespues ? JSON.parse(audit.datosDespues) : null,
            createdAt: audit.createdAt,
            usuario: {
              id: usuario[0].id,
              nombre: usuario[0].nombre,
            },
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          movimientos: movimientosCompletos,
          auditoria: auditoriaCompleta,
        },
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return reply.code(500).send({
        success: false,
        error: {
          code: 'HISTORIAL_ERROR',
          message: errorMessage,
        },
      });
    }
  }
);
};

export default equiposRoutes;