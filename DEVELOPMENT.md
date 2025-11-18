# 🛠️ Guía de Desarrollo - Sistema de Inventario Hospitalario

Guía completa para desarrolladores que trabajen en este proyecto.

---

## 📋 Tabla de Contenidos

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Flujo de Trabajo Git](#flujo-de-trabajo-git)
4. [Estándares de Código](#estándares-de-código)
5. [Base de Datos](#base-de-datos)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Despliegue](#despliegue)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Configuración del Entorno

### Requisitos del Sistema
```
- Node.js v22.21.0 o superior
- npm v10 o superior
- Git 2.x o superior
- VS Code (recomendado)
```

### Extensiones Recomendadas para VS Code
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Variables de Entorno

#### Backend (`server/.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=8h

# App
APP_URL=http://localhost:3000
```

#### Frontend (`client/.env`)
```env
# API
VITE_API_URL=http://localhost:3000/api

# App
VITE_APP_NAME=Sistema de Inventario Hospitalario
```

---

## 📁 Estructura del Proyecto

### Backend
```
server/
├── src/
│   ├── config/              # Configuraciones globales
│   │   ├── database.ts      # Config de Drizzle ORM
│   │   └── jwt.ts           # Config de JWT (futuro)
│   │
│   ├── db/                  # Base de datos
│   │   ├── schema/          # Definición de tablas
│   │   │   ├── index.ts     # Export central
│   │   │   ├── usuarios.ts  # Tabla usuarios y roles
│   │   │   ├── catalogos.ts # Áreas, subgrupos, estados, proveedores
│   │   │   ├── equipos.ts   # Tabla principal de equipos
│   │   │   ├── movimientos.ts  # Traslados
│   │   │   ├── bajas.ts     # Solicitudes de baja
│   │   │   ├── archivos.ts  # Fotos y documentos
│   │   │   ├── notificaciones.ts  # Notificaciones internas
│   │   │   └── auditoria.ts # Log de operaciones
│   │   │
│   │   ├── migrations/      # Migraciones generadas
│   │   └── seed.ts          # Datos iniciales
│   │
│   ├── middleware/          # Middlewares de Fastify
│   │   └── auth.ts          # Verificación de JWT
│   │
│   ├── routes/              # Rutas de la API
│   │   ├── auth.ts          # Login, logout, me
│   │   ├── equipos.ts       # CRUD equipos
│   │   ├── traslados.ts     # Sistema de traslados
│   │   ├── bajas.ts         # Sistema de bajas
│   │   ├── reportes.ts      # Reportes y QR
│   │   └── catalogos.ts     # Áreas, subgrupos, etc.
│   │
│   ├── services/            # Lógica de negocio
│   │   ├── authService.ts
│   │   ├── equipoService.ts
│   │   ├── trasladoService.ts
│   │   ├── bajaService.ts
│   │   ├── reporteService.ts
│   │   └── catalogoService.ts
│   │
│   ├── types/               # Interfaces TypeScript
│   │   ├── auth.ts
│   │   ├── equipo.ts
│   │   ├── traslado.ts
│   │   ├── baja.ts
│   │   └── reporte.ts
│   │
│   ├── utils/               # Utilidades
│   │   ├── jwt.ts           # Generar/verificar tokens
│   │   └── hash.ts          # Hash de contraseñas
│   │
│   └── index.ts             # Punto de entrada del servidor
│
├── database.sqlite          # Base de datos SQLite
├── package.json
├── tsconfig.json
├── drizzle.config.ts        # Config de Drizzle Kit
└── .env
```

### Frontend
```
client/
├── public/                  # Archivos estáticos
│
├── src/
│   ├── components/          # Componentes React
│   │   ├── common/          # Componentes reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Icon.tsx
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   └── ProtectedRoute.tsx  # Guard para rutas privadas
│   │
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx  # Contexto de autenticación
│   │
│   ├── pages/               # Páginas principales
│   │   ├── Login.tsx        # Página de login
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── equipos/         # (futuro)
│   │   ├── traslados/       # (futuro)
│   │   └── bajas/           # (futuro)
│   │
│   ├── services/            # Servicios de API
│   │   ├── api.ts           # Cliente Axios
│   │   ├── authService.ts   # (futuro)
│   │   └── equipoService.ts # (futuro)
│   │
│   ├── types/               # Interfaces TypeScript
│   │   └── auth.ts
│   │
│   ├── utils/               # Utilidades
│   │
│   ├── App.tsx              # App principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .env
```

---

## 🔄 Flujo de Trabajo Git

### Ramas Principales
```
main          → Código en producción (protegida)
develop       → Rama de desarrollo (protegida)
```

### Ramas de Funcionalidad
```
feature/nombre-descriptivo    → Nueva funcionalidad
bugfix/nombre-bug             → Corrección de bugs
hotfix/nombre-urgente         → Corrección urgente
```

### Workflow Típico
```bash
# 1. Crear nueva rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/modulo-equipos

# 2. Desarrollar
# ... hacer cambios ...

# 3. Commit
git add .
git commit -m "feat(equipos): implementar lista con filtros"

# 4. Push
git push origin feature/modulo-equipos

# 5. Crear Pull Request en GitHub
# Revisar → Aprobar → Merge a develop

# 6. Eliminar rama local
git checkout develop
git branch -d feature/modulo-equipos
```

### Convención de Commits

Seguimos la convención [Conventional Commits](https://www.conventionalcommits.org/):
```
<tipo>(<alcance>): <descripción>

Tipos:
- feat: Nueva funcionalidad
- fix: Corrección de bug
- docs: Cambios en documentación
- style: Formateo, punto y coma faltante, etc.
- refactor: Refactorización de código
- test: Agregar tests
- chore: Tareas de mantenimiento
```

**Ejemplos:**
```bash
git commit -m "feat(equipos): agregar búsqueda por número de serie"
git commit -m "fix(auth): corregir validación de token expirado"
git commit -m "docs(api): actualizar documentación de endpoints"
git commit -m "refactor(traslados): simplificar generación de folio"
```

---

## 📐 Estándares de Código

### TypeScript

#### Nombres
```typescript
// PascalCase para componentes, clases, interfaces, types
interface User {}
class EquipoService {}
function LoginPage() {}

// camelCase para variables, funciones, métodos
const userName = 'admin';
function getUserById(id: number) {}

// UPPER_SNAKE_CASE para constantes
const MAX_ITEMS_PER_PAGE = 100;
const API_BASE_URL = 'http://localhost:3000';
```

#### Interfaces vs Types
```typescript
// Usar 'interface' para objetos que pueden extenderse
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// Usar 'type' para uniones, intersecciones, alias
type Status = 'active' | 'inactive';
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

#### Evitar 'any'
```typescript
// ❌ Mal
function processData(data: any) {}

// ✅ Bien
function processData(data: unknown) {
  if (typeof data === 'string') {
    // ...
  }
}

// ✅ Mejor
interface DataInput {
  id: number;
  value: string;
}
function processData(data: DataInput) {}
```

### React

#### Componentes Funcionales
```typescript
// ✅ Usar function declaration
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Evitar arrow functions para componentes exportados
export const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
```

#### Props
```typescript
// ✅ Definir interface para props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  // ...
}
```

#### Hooks
```typescript
// ✅ Nombrar custom hooks con 'use'
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
}

// ✅ Extraer lógica compleja a custom hooks
function useEquiposList(filters: Filters) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // fetch data
  }, [filters]);
  
  return { equipos, loading };
}
```

### Tailwind CSS

#### Orden de Clases
```typescript
// Orden recomendado:
// 1. Layout (display, position)
// 2. Box model (margin, padding, border)
// 3. Typography
// 4. Visual (background, color)
// 5. Miscellaneous (cursor, transition)

<div className="
  flex items-center justify-between
  px-4 py-2 border border-neutral-200 rounded
  text-sm font-medium
  bg-white text-neutral-900
  hover:bg-neutral-50 transition-colors
">
```

#### Componentes Reutilizables
```typescript
// ✅ Crear componentes para patrones repetitivos
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-neutral-200 rounded shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Uso
<Card className="p-6">Contenido</Card>
```

---

## 🗄️ Base de Datos

### Migraciones

#### Crear una nueva migración
```bash
cd server

# 1. Modificar archivos en src/db/schema/
# 2. Generar migración
npm run db:generate

# 3. Aplicar migración
npm run db:push
```

#### Ver base de datos en Drizzle Studio
```bash
npm run db:studio
```

Abre en: `https://local.drizzle.studio`

### Queries con Drizzle ORM
```typescript
import { db } from '../config/database';
import { equipos, areas, estados } from '../db/schema';
import { eq, and, like } from 'drizzle-orm';

// SELECT simple
const allEquipos = await db.select().from(equipos);

// SELECT con WHERE
const equipo = await db
  .select()
  .from(equipos)
  .where(eq(equipos.id, 1))
  .limit(1);

// SELECT con JOIN
const equipoConRelaciones = await db
  .select({
    id: equipos.id,
    descripcion: equipos.descripcion,
    area: areas.nombre,
    estado: estados.nombre,
  })
  .from(equipos)
  .leftJoin(areas, eq(equipos.areaId, areas.id))
  .leftJoin(estados, eq(equipos.estadoId, estados.id));

// INSERT
const [nuevoEquipo] = await db
  .insert(equipos)
  .values({
    codigoSICOIN: '323-001-2025',
    descripcion: 'Camilla...',
    // ...
  })
  .returning();

// UPDATE
await db
  .update(equipos)
  .set({ descripcion: 'Nueva descripción' })
  .where(eq(equipos.id, 1));

// DELETE
await db
  .delete(equipos)
  .where(eq(equipos.id, 1));
```

---

## 🧪 Testing

### Backend (Futuro)
```bash
# Instalar dependencias de testing
npm install -D vitest @vitest/ui

# Ejecutar tests
npm test

# Ejecutar con coverage
npm run test:coverage
```

### Frontend (Futuro)
```bash
# Instalar dependencias
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Ejecutar tests
npm test
```

---

## 🐛 Debugging

### Backend

#### Con VS Code

Crear `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server",
      "console": "integratedTerminal"
    }
  ]
}
```

#### Logs
```typescript
// Fastify tiene logger integrado
fastify.log.info('Usuario autenticado', { userId: user.id });
fastify.log.error('Error al crear equipo', error);
```

### Frontend

#### React DevTools

Instalar extensión: [React Developer Tools](https://react.dev/learn/react-developer-tools)

#### Network Inspector
```typescript
// Ver requests en la consola
api.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

---

## 🚀 Despliegue

### Desarrollo Local
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### Producción - Red Local Hospital

#### 1. Build del Frontend
```bash
cd client
npm run build
```

Esto genera la carpeta `client/dist/` con archivos estáticos.

#### 2. Servir Frontend desde Backend

Actualizar `server/src/index.ts`:
```typescript
import path from 'path';
import fastifyStatic from '@fastify/static';

// Servir archivos estáticos del frontend
server.register(fastifyStatic, {
  root: path.join(__dirname, '../../client/dist'),
  prefix: '/',
});

// Ruta catch-all para SPA
server.setNotFoundHandler((request, reply) => {
  if (!request.url.startsWith('/api')) {
    reply.sendFile('index.html');
  }
});
```

Instalar dependencia:
```bash
cd server
npm install @fastify/static
```

#### 3. Configurar para Red Local

Actualizar `server/.env`:
```env
PORT=3000
NODE_ENV=production
```

#### 4. Iniciar Servidor
```bash
cd server
npm run build
npm start
```

El sistema completo estará en: `http://IP-DEL-SERVIDOR:3000`

#### 5. Configurar Firewall de Windows
```powershell
# Abrir PowerShell como Administrador
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

#### 6. Encontrar IP del Servidor
```bash
# Windows
ipconfig

# Buscar "IPv4 Address"
# Ejemplo: 192.168.1.100
```

Los clientes acceden desde: `http://192.168.1.100:3000`

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. "Cannot find module" en TypeScript
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 2. Error de CORS en Frontend

Verificar en `server/src/index.ts`:
```typescript
await server.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
});
```

#### 3. Token JWT expirado
```typescript
// Los tokens expiran en 8 horas
// Hacer logout y volver a hacer login
```

#### 4. Base de datos bloqueada (SQLite)
```bash
# Cerrar todos los procesos que usan la BD
# En Windows Task Manager, buscar "node.exe"
# Reiniciar el servidor
```

#### 5. Puerto 3000 ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (Windows)
taskkill /PID [PID] /F

# O cambiar el puerto en .env
PORT=3001
```

#### 6. Tailwind no aplica estilos
```bash
# Verificar que postcss.config.js existe
# Reiniciar el servidor de Vite
npm run dev
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Fastify](https://www.fastify.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Herramientas Útiles

- [Thunder Client](https://www.thunderclient.com/) - Testing de API
- [DB Browser for SQLite](https://sqlitebrowser.org/) - Explorar BD
- [Postman](https://www.postman.com/) - Testing de API

---

## 📝 Checklist para Pull Requests

Antes de crear un PR, verificar:

- [ ] El código compila sin errores
- [ ] No hay warnings de TypeScript
- [ ] El código sigue los estándares establecidos
- [ ] Se agregaron tipos TypeScript apropiados
- [ ] Se probó manualmente la funcionalidad
- [ ] Se actualizó la documentación si es necesario
- [ ] El commit message sigue la convención
- [ ] Se hizo pull de develop antes de hacer push

---

## 🎯 Roadmap de Desarrollo

### Fase 1: Backend (✅ Completado)
- [x] Autenticación
- [x] CRUD Equipos
- [x] Sistema de Traslados
- [x] Sistema de Bajas
- [x] Reportes y QR
- [x] Catálogos

### Fase 2: Frontend Base (✅ Completado)
- [x] Login
- [x] Layout principal
- [x] Dashboard

### Fase 3: Frontend CRUD (⏳ En progreso)
- [ ] Módulo de Equipos
- [ ] Módulo de Traslados
- [ ] Módulo de Bajas
- [ ] Módulo de Reportes
- [ ] Catálogos (Áreas, Proveedores)

### Fase 4: Mejoras (📋 Planificado)
- [ ] Subida de fotos
- [ ] Dashboard con gráficas
- [ ] Exportación a Excel
- [ ] Búsqueda avanzada
- [ ] App móvil (QR scanner)

---

**Última actualización:** Noviembre 2025  
**Mantenido por:** Gerbert - Universidad Mariano Gálvez de Guatemala
```

---

## ✅ **COMMIT FINAL DE DOCUMENTACIÓN**

### En GitHub Desktop:

**Summary:**
```
docs: crear documentación completa del proyecto
```

**Description:**
```
- README.md con descripción, instalación y uso
- API_DOCS.md con todos los endpoints documentados
- DEVELOPMENT.md con guía para desarrolladores
- Estructura del proyecto explicada
- Flujo de trabajo Git
- Estándares de código
- Troubleshooting común
- Roadmap del proyecto
```

**Commit to feature/frontend-base** → **Merge a develop** → **Push**

---

## 🎉 **¡PROYECTO DOCUMENTADO AL 100%!**

Ahora tienes:

✅ **README.md** - Para cualquiera que vea el proyecto  
✅ **API_DOCS.md** - Para consumir la API  
✅ **DEVELOPMENT.md** - Para desarrolladores  
✅ **Código limpio y organizado**  
✅ **Backend 100% funcional**  
✅ **Frontend 40% completo**  

---

## 📊 **RESUMEN FINAL DE LA SESIÓN**
```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🎉 SESIÓN DE DESARROLLO COMPLETADA 🎉            ║
║                                                          ║
║  ✅ Backend: 6 sprints (100%)                           ║
║  ✅ Frontend: Login + Layout + Dashboard (40%)          ║
║  ✅ Documentación: 3 archivos completos                 ║
║  ✅ Código en GitHub actualizado                        ║
║                                                          ║
║  📊 Progreso Total: 85%                                 ║
║  ⏱️ Tiempo estimado restante: 6-8 horas                ║
║                                                          ║
║  🎯 Próxima sesión: Módulos CRUD del frontend          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝