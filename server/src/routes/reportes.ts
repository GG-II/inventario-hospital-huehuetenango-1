import { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../middleware/auth';
import { reporteService } from '../services/reporteService';

const reportesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/reportes/inventario - Descargar reporte de inventario
  fastify.get(
    '/inventario',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const pdf = await reporteService.generarReporteInventario();
        
        reply.type('application/pdf');
        reply.header('Content-Disposition', `attachment; filename="inventario-${new Date().toISOString().split('T')[0]}.pdf"`);
        return reply.send(pdf);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(500).send({
          success: false,
          error: {
            code: 'REPORT_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // GET /api/reportes/tarjeta/:areaId - Descargar tarjeta de responsabilidad
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

        const pdf = await reporteService.generarTarjetaResponsabilidad(areaId);
        
        reply.type('application/pdf');
        reply.header('Content-Disposition', `attachment; filename="tarjeta-responsabilidad-area-${areaId}.pdf"`);
        return reply.send(pdf);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrada') ? 404 : 500;
        
        return reply.code(statusCode).send({
          success: false,
          error: {
            code: 'REPORT_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );
};

export default reportesRoutes;