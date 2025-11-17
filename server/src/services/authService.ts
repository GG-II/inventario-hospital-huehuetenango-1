import { db } from '../config/database';
import { usuarios, roles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { compararPassword } from '../utils/hash';
import { generarToken } from '../utils/jwt';

export const authService = {
  async login(username: string, password: string) {
    // Buscar usuario por username
    const [usuario] = await db
      .select({
        id: usuarios.id,
        username: usuarios.username,
        password: usuarios.password,
        nombre: usuarios.nombre,
        rolId: usuarios.rolId,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(eq(usuarios.username, username))
      .limit(1);

    if (!usuario) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new Error('Usuario desactivado. Contacte al administrador.');
    }

    // Comparar contraseña
    const passwordValida = await compararPassword(password, usuario.password);

    if (!passwordValida) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Obtener información del rol
    const [rol] = await db
      .select({
        id: roles.id,
        nombre: roles.nombre,
      })
      .from(roles)
      .where(eq(roles.id, usuario.rolId))
      .limit(1);

    if (!rol) {
      throw new Error('Rol de usuario no encontrado');
    }

    // Generar token JWT
    const token = generarToken({
      userId: usuario.id,
      username: usuario.username,
      rolId: rol.id,
      rolNombre: rol.nombre,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: rol.nombre,
      },
    };
  },
};