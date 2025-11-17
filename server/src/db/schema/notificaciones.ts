import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { usuarios } from './usuarios';

export const notificaciones = sqliteTable('notificaciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  tipo: text('tipo').notNull(), // "TRASLADO_EQUIPO", "BAJA_APROBADA", "BAJA_RECHAZADA", "SISTEMA"
  titulo: text('titulo').notNull(),
  mensaje: text('mensaje').notNull(),
  relacionadoId: integer('relacionado_id'), // ID del equipo, traslado, baja, etc.
  relacionadoTipo: text('relacionado_tipo'), // "EQUIPO", "TRASLADO", "BAJA"
  leida: integer('leida', { mode: 'boolean' }).notNull().default(false),
  fechaLeida: text('fecha_leida'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});