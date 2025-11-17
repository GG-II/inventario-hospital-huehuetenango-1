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
        // Validaciones básicas
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
};

export default equiposRoutes;