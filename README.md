# 🏥 Sistema de Inventario Hospitalario

Sistema de control y gestión de equipos médicos y mobiliario para el Hospital Regional de Huehuetenango "Dr. Jorge Vides Molina".

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Backend](https://img.shields.io/badge/Backend-100%25-success)
![Frontend](https://img.shields.io/badge/Frontend-40%25-yellow)

---

## 📋 Descripción

Sistema web diseñado para el control integral del inventario de equipos médicos y mobiliario del Hospital Regional de Huehuetenango. Permite:

- ✅ Registro y control de equipos médicos y mobiliario
- ✅ Sistema de traslados entre áreas con folios automáticos
- ✅ Gestión de bajas con proceso de aprobación
- ✅ Generación de reportes en tiempo real
- ✅ Códigos QR para identificación de equipos
- ✅ Control de acceso por roles
- ✅ Auditoría completa de operaciones
- ✅ Notificaciones internas

---

## 🎯 Características Principales

### Backend (100% Completado)
- **Autenticación JWT** con roles (Admin, Inventarios, Mantenimiento, Consulta)
- **CRUD de Equipos** con paginación y filtros avanzados
- **Sistema de Traslados** con generación automática de folios (CONOC-AAAAMM-NNNN)
- **Sistema de Bajas** con flujo de aprobación
- **Reportes** de inventario y tarjetas de responsabilidad
- **Códigos QR** para cada equipo
- **Catálogos** (Áreas, Subgrupos SICOIN, Estados, Proveedores)
- **Notificaciones** automáticas
- **Auditoría** completa de todas las operaciones

### Frontend (40% Completado)
- ✅ **Login** con diseño profesional estilo Office 365
- ✅ **Layout** responsivo con Header y Sidebar colapsable
- ✅ **Dashboard** con estadísticas y acciones rápidas
- ⏳ Módulo de Equipos (pendiente)
- ⏳ Módulo de Traslados (pendiente)
- ⏳ Módulo de Bajas (pendiente)
- ⏳ Módulo de Reportes (pendiente)

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js v22
- **Framework:** Fastify 5
- **Lenguaje:** TypeScript
- **Base de Datos:** SQLite (local)
- **ORM:** Drizzle ORM
- **Autenticación:** JWT (jsonwebtoken)
- **Validaciones:** Zod
- **Hash de contraseñas:** bcrypt
- **Generación QR:** qrcode

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Estado:** React Context API

---

## 📦 Estructura del Proyecto
```
inventario-hospital-huehuetenango/
├── server/                          # Backend (Node.js + Fastify)
│   ├── src/
│   │   ├── config/                  # Configuraciones
│   │   ├── db/                      # Base de datos
│   │   │   ├── schema/              # Esquemas de tablas
│   │   │   ├── migrations/          # Migraciones
│   │   │   └── seed.ts              # Datos iniciales
│   │   ├── middleware/              # Middlewares
│   │   ├── routes/                  # Rutas de la API
│   │   ├── services/                # Lógica de negocio
│   │   ├── types/                   # Tipos TypeScript
│   │   ├── utils/                   # Utilidades
│   │   └── index.ts                 # Punto de entrada
│   ├── database.sqlite              # Base de datos SQLite
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── client/                          # Frontend (React + Vite)
    ├── src/
    │   ├── components/              # Componentes React
    │   │   ├── common/              # Componentes reutilizables
    │   │   └── layout/              # Header, Sidebar, Layout
    │   ├── contexts/                # React Context
    │   ├── pages/                   # Páginas principales
    │   ├── services/                # Servicios API
    │   ├── types/                   # Tipos TypeScript
    │   └── App.tsx
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js v22 o superior
- npm v10 o superior
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/inventario-hospital-huehuetenango.git
cd inventario-hospital-huehuetenango
```

### 2. Configurar Backend
```bash
cd server
npm install
```

Crear archivo `.env`:
```env
PORT=3000
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=8h
NODE_ENV=development
DATABASE_PATH=./database.sqlite
```

Generar base de datos y datos iniciales:
```bash
npm run db:push
npm run db:seed
```

Iniciar servidor de desarrollo:
```bash
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### 3. Configurar Frontend

En una **nueva terminal**:
```bash
cd client
npm install
```

Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Iniciar servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 👤 Usuarios de Prueba

### Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Permisos:** Acceso total

### Inventarios
- **Usuario:** `inventario1`
- **Contraseña:** `inventario123`
- **Permisos:** Gestión de equipos, traslados y bajas

---

## 📊 Base de Datos

### Tablas Principales

1. **usuarios** - Usuarios del sistema
2. **roles** - Roles y permisos
3. **equipos** - Equipos médicos y mobiliario ⭐
4. **areas** - Áreas/servicios del hospital
5. **estados** - Estados de equipos
6. **subgrupos** - Clasificación SICOIN (321-329)
7. **proveedores** - Proveedores de equipos
8. **movimientos** - Traslados entre áreas
9. **bajas** - Solicitudes de baja
10. **archivos** - Fotos y documentos
11. **notificaciones** - Notificaciones internas
12. **auditoria** - Log de operaciones

### Subgrupos SICOIN

- **321** - De producción
- **322** - De oficina y muebles
- **323** - Médico, sanitario y laboratorio
- **324** - Educacional, cultural y recreativo
- **325** - Transporte, tracción y elevación
- **326** - De comunicaciones
- **328** - De cómputo
- **329** - Otros activos

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Equipos
- `GET /api/equipos` - Listar equipos
- `GET /api/equipos/:id` - Obtener equipo
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Dar de baja equipo

### Traslados
- `GET /api/traslados` - Listar traslados
- `GET /api/traslados/:id` - Obtener traslado
- `POST /api/traslados` - Crear traslado
- `GET /api/traslados/equipo/:equipoId/historial` - Historial del equipo

### Bajas
- `GET /api/bajas` - Listar bajas
- `GET /api/bajas/:id` - Obtener baja
- `POST /api/bajas` - Solicitar baja
- `PATCH /api/bajas/:id/procesar` - Aprobar/rechazar baja

### Reportes
- `GET /api/reportes/inventario` - Reporte de inventario
- `GET /api/reportes/tarjeta/:areaId` - Tarjeta de responsabilidad
- `GET /api/reportes/qr/:equipoId` - Generar código QR

### Catálogos
- `GET /api/catalogos/areas` - Listar áreas
- `GET /api/catalogos/subgrupos` - Listar subgrupos
- `GET /api/catalogos/estados` - Listar estados
- `GET /api/catalogos/proveedores` - Listar proveedores

**Ver documentación completa:** [API_DOCS.md](./API_DOCS.md)

---

## 🎨 Diseño

El sistema utiliza un diseño moderno y profesional inspirado en **Microsoft Office 365**:

- ✅ Colores sólidos sin degradados
- ✅ Bordes rectos y limpios
- ✅ Espacios bien definidos
- ✅ Tipografía Segoe UI
- ✅ Responsive para móvil y tablet
- ✅ Sidebar colapsable
- ✅ Header fijo superior

### Paleta de Colores

- **Primario:** Azul (#3b82f6)
- **Éxito:** Verde (#10b981)
- **Advertencia:** Amarillo (#f59e0b)
- **Error:** Rojo (#ef4444)
- **Neutral:** Escala de grises

---

## 🔐 Seguridad

- ✅ Autenticación JWT con tokens de 8 horas
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Control de acceso basado en roles
- ✅ Validación de datos con Zod
- ✅ Protección contra inyección SQL (ORM)
- ✅ CORS configurado

---

## 📈 Estado del Proyecto

### Completado (85%)
- ✅ Backend completo (100%)
- ✅ Base de datos y migraciones (100%)
- ✅ Autenticación y autorización (100%)
- ✅ Sistema de traslados con folios (100%)
- ✅ Sistema de bajas con aprobación (100%)
- ✅ Reportes y códigos QR (100%)
- ✅ Frontend: Login y Layout (100%)

### En Desarrollo (15%)
- ⏳ Frontend: Módulo de Equipos
- ⏳ Frontend: Módulo de Traslados
- ⏳ Frontend: Módulo de Bajas
- ⏳ Frontend: Módulo de Reportes
- ⏳ Frontend: Catálogos

### Futuras Mejoras
- 📱 Aplicación móvil para escaneo QR
- 📊 Dashboard con gráficas interactivas
- 📧 Notificaciones por email
- 📄 Exportación a Excel
- 🔍 Búsqueda avanzada con filtros múltiples
- 📸 Subida de fotos de equipos

---

## 🤝 Contribución

Este es un proyecto de tesis para la Universidad Mariano Gálvez de Guatemala.

**Desarrollador:** Gerbert  
**Carrera:** Ingeniería en Sistemas  
**Institución:** Hospital Regional de Huehuetenango

---

## 📄 Licencia

Este proyecto fue desarrollado específicamente para el Hospital Regional de Huehuetenango y es de uso exclusivo de la institución.

---

## 📞 Contacto

Para soporte o consultas sobre el sistema, contactar al Departamento de Inventarios del Hospital Regional de Huehuetenango.

---

## 🙏 Agradecimientos

- Hospital Regional de Huehuetenango "Dr. Jorge Vides Molina"
- Departamento de Inventarios
- Universidad Mariano Gálvez de Guatemala
- Facultad de Ingeniería en Sistemas

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0-beta