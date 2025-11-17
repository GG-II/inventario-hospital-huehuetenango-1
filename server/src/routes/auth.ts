import { FastifyPluginAsync } from 'fastify';
import { authService } from '../services/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { LoginRequest, LoginResponse } from '../types/auth';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/auth/login
  fastify.post<{ Body: LoginRequest; Reply: LoginResponse }>(
    '/login',
    async (request, reply) => {
      try {
        const { username, password } = request.body;

        // Validaciones básicas
        if (!username || !password) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELDS',
              message: 'Usuario y contraseña son requeridos',
            },
          });
        }

        // Intentar login
        const resultado = await authService.login(username, password);

        return reply.code(200).send({
          success: true,
          data: resultado,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(401).send({
          success: false,
          error: {
            code: 'LOGIN_FAILED',
            message: errorMessage,
          },
        });
      }
    }
  );

  // GET /api/auth/me - Obtener usuario actual
  fastify.get(
    '/me',
    {
      preHandler: [requireAuth],
    },
    async (request: AuthenticatedRequest, reply) => {
      return reply.send({
        success: true,
        data: {
          userId: request.user?.userId,
          username: request.user?.username,
          rol: request.user?.rolNombre,
        },
      });
    }
  );

  // POST /api/auth/logout
  fastify.post(
    '/logout',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      // En JWT no hay "logout" real en el servidor
      // El cliente debe eliminar el token
      return reply.send({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    }
  );
};

export default authRoutes;