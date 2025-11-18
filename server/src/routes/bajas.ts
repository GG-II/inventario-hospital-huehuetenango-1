import { FastifyPluginAsync } from 'fastify';
import { bajaService } from '../services/bajaService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { CrearBajaRequest, ProcesarBajaRequest, ListarBajasQuery } from '../types/baja';

const bajasRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/bajas - Listar bajas
  fastify.get<{ Querystring: ListarBajasQuery }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const resultado = await bajaService.listar(request.query);

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

  // GET /api/bajas/:id - Obtener baja por ID
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

        const baja = await bajaService.obtenerPorId(id);

        return reply.send({
          success: true,
          data: baja,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        
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

  // POST /api/bajas - Crear solicitud de baja
  fastify.post<{ Body: CrearBajaRequest }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { equipoId, motivo, observaciones } = request.body;

        if (!equipoId || !motivo || !observaciones) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELDS',
              message: 'Campos requeridos: equipoId, motivo, observaciones',
            },
          });
        }

        const nuevaBaja = await bajaService.crear(
          request.body,
          request.user!.userId
        );

        return reply.code(201).send({
          success: true,
          data: nuevaBaja,
          message: 'Solicitud de baja creada exitosamente',
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

  // PATCH /api/bajas/:id/procesar - Aprobar o rechazar baja
  fastify.patch<{ Params: { id: string }; Body: ProcesarBajaRequest }>(
    '/:id/procesar',
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

        const { aprobado } = request.body;

        if (aprobado === undefined) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELD',
              message: 'Campo requerido: aprobado',
            },
          });
        }

        const bajaProcesada = await bajaService.procesar(
          id,
          request.body,
          request.user!.userId
        );

        const mensaje = aprobado ? 'Baja aprobada exitosamente' : 'Baja rechazada';

        return reply.send({
          success: true,
          data: bajaProcesada,
          message: mensaje,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 400;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'PROCESS_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );
};


export default bajasRoutes;