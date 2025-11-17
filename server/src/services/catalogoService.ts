import { db } from '../config/database';
import { areas, subgrupos, estados, proveedores, roles } from '../db/schema';
import { eq } from 'drizzle-orm';

export const catalogoService = {
  // ========== ÁREAS ==========
  async listarAreas() {
    return await db
      .select()
      .from(areas)
      .where(eq(areas.activo, true))
      .orderBy(areas.nombre);
  },

  async obtenerArea(id: number) {
    const [area] = await db
      .select()
      .from(areas)
      .where(eq(areas.id, id))
      .limit(1);

    if (!area) {
      throw new Error('Área no encontrada');
    }

    return area;
  },

  async actualizarArea(id: number, data: { nombre?: string; jefe?: string }) {
    await this.obtenerArea(id);

    await db
      .update(areas)
      .set(data)
      .where(eq(areas.id, id));

    return await this.obtenerArea(id);
  },

  // ========== SUBGRUPOS ==========
  async listarSubgrupos() {
    return await db
      .select()
      .from(subgrupos)
      .where(eq(subgrupos.activo, true))
      .orderBy(subgrupos.codigo);
  },

  async obtenerSubgrupo(id: number) {
    const [subgrupo] = await db
      .select()
      .from(subgrupos)
      .where(eq(subgrupos.id, id))
      .limit(1);

    if (!subgrupo) {
      throw new Error('Subgrupo no encontrado');
    }

    return subgrupo;
  },

  // ========== ESTADOS ==========
  async listarEstados() {
    return await db
      .select()
      .from(estados)
      .where(eq(estados.activo, true))
      .orderBy(estados.nombre);
  },

  async obtenerEstado(id: number) {
    const [estado] = await db
      .select()
      .from(estados)
      .where(eq(estados.id, id))
      .limit(1);

    if (!estado) {
      throw new Error('Estado no encontrado');
    }

    return estado;
  },

  // ========== PROVEEDORES ==========
  async listarProveedores() {
    return await db
      .select()
      .from(proveedores)
      .where(eq(proveedores.activo, true))
      .orderBy(proveedores.nombreComercial);
  },

  async obtenerProveedor(id: number) {
    const [proveedor] = await db
      .select()
      .from(proveedores)
      .where(eq(proveedores.id, id))
      .limit(1);

    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }

    return proveedor;
  },

  async crearProveedor(data: {
    nombreComercial: string;
    nit?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  }) {
    const [nuevoProveedor] = await db
      .insert(proveedores)
      .values({
        ...data,
        activo: true,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return nuevoProveedor;
  },

  async actualizarProveedor(
    id: number,
    data: {
      nombreComercial?: string;
      nit?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    }
  ) {
    await this.obtenerProveedor(id);

    await db
      .update(proveedores)
      .set(data)
      .where(eq(proveedores.id, id));

    return await this.obtenerProveedor(id);
  },

  async eliminarProveedor(id: number) {
    await this.obtenerProveedor(id);

    // Soft delete
    await db
      .update(proveedores)
      .set({ activo: false })
      .where(eq(proveedores.id, id));

    return { message: 'Proveedor desactivado' };
  },

  // ========== ROLES ==========
  async listarRoles() {
    return await db.select().from(roles).orderBy(roles.nombre);
  },

  async obtenerRol(id: number) {
    const [rol] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!rol) {
      throw new Error('Rol no encontrado');
    }

    return rol;
  },
};