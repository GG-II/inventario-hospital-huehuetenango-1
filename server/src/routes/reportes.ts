import { FastifyPluginAsync } from 'fastify';
import { reporteService } from '../services/reporteService';
import { requireAuth } from '../middleware/auth';

const reportesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/reportes/inventario - Datos para reporte anual
  fastify.get<{ Querystring: { anio?: string } }>(
    '/inventario',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const anio = request.query.anio ? parseInt(request.query.anio, 10) : undefined;

        const reporte = await reporteService.inventarioAnual(anio);

        return reply.send({
          success: true,
          data: reporte,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(500).send({
          success: false,
          error: {
            code: 'REPORTE_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // GET /api/reportes/tarjeta/:areaId - Datos para tarjeta de responsabilidad
  fastify.get<{ Params: { areaId: string } }>(
    '/tarjeta/:areaId',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const areaId = parseInt(request.params.areaId, 10);

        if (isNaN(areaId)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID de área inválido',
            },
          });
        }

        const tarjeta = await reporteService.tarjetaResponsabilidad(areaId);

        return reply.send({
          success: true,
          data: tarjeta,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'TARJETA_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // GET /api/reportes/qr/:equipoId - Generar código QR
  fastify.get<{ Params: { equipoId: string } }>(
    '/qr/:equipoId',
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

        const qr = await reporteService.generarQR(equipoId);

        return reply.send({
          success: true,
          data: qr,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'QR_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );
};

export default reportesRoutes;