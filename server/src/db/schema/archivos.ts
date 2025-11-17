import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { equipos } from './equipos';
import { usuarios } from './usuarios';

export const archivos = sqliteTable('archivos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  equipoId: integer('equipo_id').notNull().references(() => equipos.id),
  tipo: text('tipo').notNull(), // "FOTO", "DOCUMENTO", "FACTURA"
  url: text('url').notNull(), // Ruta del archivo: /uploads/equipos/123/foto1.jpg
  nombreOriginal: text('nombre_original').notNull(),
  tamanoBytes: integer('tamano_bytes'),
  mimeType: text('mime_type'), // image/jpeg, application/pdf
  descripcion: text('descripcion'),
  subidoPor: integer('subido_por').notNull().references(() => usuarios.id),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});