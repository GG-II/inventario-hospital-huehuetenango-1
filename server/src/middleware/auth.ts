import { FastifyRequest, FastifyReply } from 'fastify';
import { verificarToken } from '../utils/jwt';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: number;
    username: string;
    rolId: number;
    rolNombre: string;
  };
}

export const requireAuth = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No se proporcionó token de autenticación',
        },
      });
    }

    // Extraer token del header "Bearer TOKEN"
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Formato de token inválido',
        },
      });
    }

    // Verificar token
    const payload = verificarToken(token);

    // Adjuntar datos del usuario al request
    request.user = payload;

  } catch (error) {
    return reply.code(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado',
      },
    });
  }
};