import { FastifyPluginAsync } from 'fastify';
import { trasladoService } from '../services/trasladoService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { CrearTrasladoRequest, ListarTrasladosQuery } from '../types/traslado';

const trasladosRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/traslados - Listar traslados
  fastify.get<{ Querystring: ListarTrasladosQuery }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const resultado = await trasladoService.listar(request.query);

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

  // GET /api/traslados/:id - Obtener traslado por ID
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

        const traslado = await trasladoService.obtenerPorId(id);

        return reply.send({
          success: true,
          data: traslado,
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

  // POST /api/traslados - Crear traslado
  fastify.post<{ Body: CrearTrasladoRequest }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { equipoId, areaDestinoId } = request.body;

        if (!equipoId || !areaDestinoId) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELDS',
              message: 'Campos requeridos: equipoId, areaDestinoId',
            },
          });
        }

        const nuevoTraslado = await trasladoService.crear(
          request.body,
          request.user!.userId
        );

        return reply.code(201).send({
          success: true,
          data: nuevoTraslado,
          message: 'Traslado registrado exitosamente',
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

  // GET /api/traslados/equipo/:equipoId/historial - Historial de un equipo
  fastify.get<{ Params: { equipoId: string } }>(
    '/equipo/:equipoId/historial',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const equipoId = parseInt(request.params.equipoId, 10);

        if (isNaN(equipoId)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID de equipo inválido',
            },
          });
        }

        const historial = await trasladoService.historialEquipo(equipoId);

        return reply.send({
          success: true,
          data: historial,
        });
      } catch (error) {
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

export default trasladosRoutes;