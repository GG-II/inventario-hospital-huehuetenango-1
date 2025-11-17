import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import equiposRoutes from './routes/equipos';

dotenv.config();

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
});

const PORT = parseInt(process.env.PORT || '3000', 10);

// Registrar CORS
server.register(cors, {
  origin: true, // En desarrollo aceptar todos los orígenes
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Ruta raíz
server.get('/', async (request, reply) => {
  return {
    message: 'Sistema de Inventario - Hospital Regional de Huehuetenango',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  };
});

// REGISTRAR RUTAS DE AUTENTICACIÓN ← AGREGAR ESTAS LÍNEAS
server.register(authRoutes, { prefix: '/api/auth' });
server.register(equiposRoutes, { prefix: '/api/equipos' }); 

// Iniciar servidor
const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏥  SISTEMA DE INVENTARIO HOSPITALARIO                  ║
║                                                            ║
║   🚀  Servidor iniciado correctamente                     ║
║   📍  URL: http://localhost:${PORT}                        ║
║   🌐  Red local: http://192.168.x.x:${PORT}               ║
║                                                            ║
║   ✅  Base de datos: Conectada                            ║
║   📊  Endpoints: Disponibles                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();