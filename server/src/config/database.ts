import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Construir la URL correcta para libsql
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');
const dbUrl = `file:${dbPath}`;

export const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client, { schema });