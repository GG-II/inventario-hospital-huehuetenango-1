import { FastifyPluginAsync } from 'fastify';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/database';
import { usuarios, roles } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const usuariosRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/usuarios/roles - Listar roles
  fastify.get(
    '/roles',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const rolesData = await db.select().from(roles);

        return reply.send({
          success: true,
          data: rolesData,
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

  // GET /api/usuarios - Listar usuarios
  fastify.get(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const usuariosData = await db
          .select({
            id: usuarios.id,
            username: usuarios.username,
            nombre: usuarios.nombre,
            email: usuarios.email,
            rolId: usuarios.rolId,
            createdAt: usuarios.createdAt,
          })
          .from(usuarios);

        // Obtener roles para cada usuario
        const usuariosConRoles = await Promise.all(
          usuariosData.map(async (usuario) => {
            const [rol] = await db
              .select()
              .from(roles)
              .where(eq(roles.id, usuario.rolId))
              .limit(1);

            return {
              ...usuario,
              rol: {
                id: rol.id,
                nombre: rol.nombre,
              },
            };
          })
        );

        return reply.send({
          success: true,
          data: usuariosConRoles,
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

  // POST /api/usuarios - Crear usuario
  fastify.post<{
    Body: {
      username: string;
      password: string;
      nombre: string;
      email: string;
      rolId: number;
    };
  }>(
    '/',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const { username, password, nombre, email, rolId } = request.body;

        // Validaciones
        if (!username || !password || !nombre || !email || !rolId) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'MISSING_FIELDS',
              message: 'Todos los campos son requeridos',
            },
          });
        }

        // Verificar si el usuario ya existe
        const [existente] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.username, username))
          .limit(1);

        if (existente) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'USER_EXISTS',
              message: 'El nombre de usuario ya existe',
            },
          });
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const [nuevoUsuario] = await db
          .insert(usuarios)
          .values({
            username,
            password: hashedPassword,
            nombre,
            email,
            rolId,
          })
          .returning();

        // Obtener rol
        const [rol] = await db
          .select()
          .from(roles)
          .where(eq(roles.id, rolId))
          .limit(1);

        return reply.code(201).send({
          success: true,
          data: {
            id: nuevoUsuario.id,
            username: nuevoUsuario.username,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: {
              id: rol.id,
              nombre: rol.nombre,
            },
            createdAt: nuevoUsuario.createdAt,
          },
          message: 'Usuario creado exitosamente',
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

  // PUT /api/usuarios/:id - Actualizar usuario
  fastify.put<{
    Params: { id: string };
    Body: {
      nombre?: string;
      email?: string;
      rolId?: number;
      password?: string;
    };
  }>(
    '/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      try {
        const id = parseInt(request.params.id, 10);
        const { nombre, email, rolId, password } = request.body;

        if (isNaN(id)) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_ID',
              message: 'ID inválido',
            },
          });
        }

        const updateData: any = {};
        if (nombre) updateData.nombre = nombre;
        if (email) updateData.email = email;
        if (rolId) updateData.rolId = rolId;
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }

        const [usuarioActualizado] = await db
          .update(usuarios)
          .set(updateData)
          .where(eq(usuarios.id, id))
          .returning();

        if (!usuarioActualizado) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Usuario no encontrado',
            },
          });
        }

        // Obtener rol
        const [rol] = await db
          .select()
          .from(roles)
          .where(eq(roles.id, usuarioActualizado.rolId))
          .limit(1);

        return reply.send({
          success: true,
          data: {
            id: usuarioActualizado.id,
            username: usuarioActualizado.username,
            nombre: usuarioActualizado.nombre,
            email: usuarioActualizado.email,
            rol: {
              id: rol.id,
              nombre: rol.nombre,
            },
            createdAt: usuarioActualizado.createdAt,
          },
          message: 'Usuario actualizado exitosamente',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        return reply.code(400).send({
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: errorMessage,
          },
        });
      }
    }
  );

  // DELETE /api/usuarios/:id - Eliminar usuario
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

        await db.delete(usuarios).where(eq(usuarios.id, id));

        return reply.send({
          success: true,
          message: 'Usuario eliminado exitosamente',
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
};

export default usuariosRoutes;