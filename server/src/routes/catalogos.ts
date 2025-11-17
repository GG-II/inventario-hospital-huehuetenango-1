import { FastifyPluginAsync } from 'fastify';
import { catalogoService } from '../services/catalogoService';
import { requireAuth } from '../middleware/auth';

const catalogosRoutes: FastifyPluginAsync = async (fastify) => {
  // ========== ÁREAS ==========
  
  // GET /api/catalogos/areas
  fastify.get(
    '/areas',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const areas = await catalogoService.listarAreas();
        return reply.send({
          success: true,
          data: areas,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.code(500).send({
          success: false,
          error: { code: 'LIST_ERROR', message: errorMessage },
        });
      }
    }
  );

  // GET /api/catalogos/areas/:id
  fastify.get<{ Params: { id: string } }>(
    '/areas/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const area = await catalogoService.obtenerArea(id);
        return reply.send({
          success: true,
          data: area,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        return reply.code(statusCode).send({
          success: false,
          error: { code: 'GET_ERROR', message: errorMessage },
        });
      }
    }
  );

  // PUT /api/catalogos/areas/:id
  fastify.put<{
    Params: { id: string };
    Body: { nombre?: string; jefe?: string };
  }>(
    '/areas/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const areaActualizada = await catalogoService.actualizarArea(id, request.body);
        return reply.send({
          success: true,
          data: areaActualizada,
          message: 'Área actualizada exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 400;
        return reply.code(statusCode).send({
          success: false,
          error: { code: 'UPDATE_ERROR', message: errorMessage },
        });
      }
    }
  );

  // ========== SUBGRUPOS ==========

  // GET /api/catalogos/subgrupos
  fastify.get(
    '/subgrupos',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const subgrupos = await catalogoService.listarSubgrupos();
        return reply.send({
          success: true,
          data: subgrupos,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.code(500).send({
          success: false,
          error: { code: 'LIST_ERROR', message: errorMessage },
        });
      }
    }
  );

  // GET /api/catalogos/subgrupos/:id
  fastify.get<{ Params: { id: string } }>(
    '/subgrupos/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const subgrupo = await catalogoService.obtenerSubgrupo(id);
        return reply.send({
          success: true,
          data: subgrupo,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        return reply.code(statusCode).send({
          success: false,
          error: { code: 'GET_ERROR', message: errorMessage },
        });
      }
    }
  );

  // ========== ESTADOS ==========

  // GET /api/catalogos/estados
  fastify.get(
    '/estados',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const estados = await catalogoService.listarEstados();
        return reply.send({
          success: true,
          data: estados,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.code(500).send({
          success: false,
          error: { code: 'LIST_ERROR', message: errorMessage },
        });
      }
    }
  );

  // ========== PROVEEDORES ==========

  // GET /api/catalogos/proveedores
  fastify.get(
    '/proveedores',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const proveedores = await catalogoService.listarProveedores();
        return reply.send({
          success: true,
          data: proveedores,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.code(500).send({
          success: false,
          error: { code: 'LIST_ERROR', message: errorMessage },
        });
      }
    }
  );

  // GET /api/catalogos/proveedores/:id
  fastify.get<{ Params: { id: string } }>(
    '/proveedores/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const proveedor = await catalogoService.obtenerProveedor(id);
        return reply.send({
          success: true,
          data: proveedor,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        return reply.code(statusCode).send({
          success: false,
          error: { code: 'GET_ERROR', message: errorMessage },
        });
      }
    }
  );

  // POST /api/catalogos/proveedores
  fastify.post<{
    Body: {
      nombreComercial: string;
      nit?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    };
  }>(
    '/proveedores',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        if (!request.body.nombreComercial) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELD',
              message: 'Campo requerido: nombreComercial',
            },
          });
        }

        const nuevoProveedor = await catalogoService.crearProveedor(request.body);
        return reply.code(201).send({
          success: true,
          data: nuevoProveedor,
          message: 'Proveedor creado exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.code(400).send({
          success: false,
          error: { code: 'CREATE_ERROR', message: errorMessage },
        });
      }
    }
  );

  // PUT /api/catalogos/proveedores/:id
  fastify.put<{
    Params: { id: string };
    Body: {
      nombreComercial?: string;
      nit?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    };
  }>(
    '/proveedores/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const proveedorActualizado = await catalogoService.actualizarProveedor(
          id,
          request.body
        );
        return reply.send({
          success: true,
          data: proveedorActualizado,
          message: 'Proveedor actualizado exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 400;
        return reply.code(statusCode).send({
          success: false,
          error: { code: 'UPDATE_ERROR', message: errorMessage },
        });
      }
    }
  );

  // DELETE /api/catalogos/proveedores/:id
  fastify.delete<{ Params: { id: string } }>(
    '/proveedores/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const resultado = await catalogoService.eliminarProveedor(id);
        return reply.send({
          success: true,
          message: resultado.message,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = errorMessage.includes('no encontrad') ? 404 : 500;
        return reply.code(statusCode).send({
          success: false,
          error: { code: 'DELETE_ERROR', message: errorMessage },
        });
      }
    }
  );

  // ========== ROLES ==========

  // GET /api/catalogos/roles
  fastify.get(
    '/roles',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const roles = await catalogoService.listarRoles();
        return reply.send({
          success: true,
          data: roles,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return reply.code(500).send({
          success: false,
          error: { code: 'LIST_ERROR', message: errorMessage },
        });
      }
    }
  );
};

export default catalogosRoutes;