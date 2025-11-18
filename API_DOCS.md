# 📡 Documentación de API - Sistema de Inventario Hospitalario

Documentación completa de todos los endpoints del backend.

**Base URL:** `http://localhost:3000/api`

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login`) requieren autenticación mediante JWT.

### Headers Requeridos
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📋 Índice de Endpoints

1. [Autenticación](#autenticación)
2. [Equipos](#equipos)
3. [Traslados](#traslados)
4. [Bajas](#bajas)
5. [Reportes](#reportes)
6. [Catálogos](#catálogos)

---

## 🔑 Autenticación

### POST /api/auth/login

Iniciar sesión en el sistema.

**Permisos:** Público

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "username": "admin",
      "nombre": "Administrador del Sistema",
      "rol": "Admin"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Usuario o contraseña incorrectos"
  }
}
```

---

### GET /api/auth/me

Obtener información del usuario actual.

**Permisos:** Todos

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "admin",
    "rol": "Admin"
  }
}
```

---

### POST /api/auth/logout

Cerrar sesión.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 📦 Equipos

### GET /api/equipos

Listar equipos con paginación y filtros.

**Permisos:** Todos

**Query Parameters:**
- `page` (number, default: 1) - Página actual
- `limit` (number, default: 50, max: 100) - Elementos por página
- `busqueda` (string) - Buscar en código, descripción, marca, modelo, serie
- `areaId` (number) - Filtrar por área
- `estadoId` (number) - Filtrar por estado
- `subgrupoId` (number) - Filtrar por subgrupo

**Ejemplo:**
```
GET /api/equipos?page=1&limit=20&busqueda=camilla&areaId=2
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigoSICOIN": "323-001-2025",
      "descripcion": "Camilla de exploración médica marca Stryker",
      "marca": "Stryker",
      "modelo": "Prime Series",
      "numeroSerie": "STR-2025-001",
      "precioUnitario": 1500000,
      "numeroFactura": "FAC-2025-001",
      "fechaIngreso": "2025-01-15",
      "observaciones": "Equipo nuevo para área de emergencia",
      "fotoUrl": null,
      "garantiaHasta": "2027-01-15",
      "vidaUtilAnios": 10,
      "createdAt": "2025-11-17T08:31:26.222Z",
      "updatedAt": "CURRENT_TIMESTAMP",
      "estado": {
        "id": 1,
        "nombre": "Activo",
        "color": "green"
      },
      "area": {
        "id": 2,
        "nombre": "Emergencia",
        "jefe": "Por asignar"
      },
      "subgrupo": {
        "id": 3,
        "codigo": "323",
        "nombre": "Médico, sanitario y laboratorio"
      },
      "proveedor": null,
      "creadoPor": {
        "id": 1,
        "nombre": "Administrador del Sistema"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### GET /api/equipos/:id

Obtener detalle de un equipo específico.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigoSICOIN": "323-001-2025",
    "descripcion": "Camilla de exploración médica...",
    "estado": {
      "id": 1,
      "nombre": "Activo",
      "color": "green"
    },
    "area": {
      "id": 2,
      "nombre": "Emergencia"
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "GET_ERROR",
    "message": "Equipo no encontrado"
  }
}
```

---

### POST /api/equipos

Crear un nuevo equipo.

**Permisos:** Admin, Inventarios

**Request Body:**
```json
{
  "codigoSICOIN": "323-001-2025",
  "descripcion": "Camilla de exploración médica marca Stryker modelo Prime Series",
  "marca": "Stryker",
  "modelo": "Prime Series",
  "numeroSerie": "STR-2025-001",
  "precioUnitario": 1500000,
  "estadoId": 1,
  "areaId": 2,
  "subgrupoId": 3,
  "proveedorId": 1,
  "numeroFactura": "FAC-2025-001",
  "fechaIngreso": "2025-01-15",
  "observaciones": "Equipo nuevo para área de emergencia",
  "garantiaHasta": "2027-01-15",
  "vidaUtilAnios": 10
}
```

**Campos Requeridos:**
- `codigoSICOIN` (string)
- `descripcion` (string)
- `precioUnitario` (number) - En centavos (ej: 1500000 = Q15,000.00)
- `estadoId` (number)
- `areaId` (number)
- `subgrupoId` (number)
- `fechaIngreso` (string, ISO date)

**Response (201 Created):**
```json
{
  "success": true,
  "data": { /* equipo completo */ },
  "message": "Equipo creado exitosamente"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "CREATE_ERROR",
    "message": "El número de serie ya existe en el sistema"
  }
}
```

---

### PUT /api/equipos/:id

Actualizar un equipo existente.

**Permisos:** Admin, Inventarios

**Request Body:**
```json
{
  "descripcion": "Camilla de exploración médica actualizada",
  "marca": "Stryker",
  "observaciones": "Se actualizó la descripción"
}
```

**Nota:** Solo se envían los campos a actualizar.

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* equipo actualizado */ },
  "message": "Equipo actualizado exitosamente"
}
```

---

### DELETE /api/equipos/:id

Marcar equipo como dado de baja (soft delete).

**Permisos:** Admin, Inventarios

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipo marcado como dado de baja"
}
```

---

## 🔄 Traslados

### GET /api/traslados

Listar traslados con filtros.

**Permisos:** Todos

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `equipoId` (number)
- `areaOrigenId` (number)
- `areaDestinoId` (number)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "TRASLADO",
      "folioConocimiento": "CONOC-202511-0001",
      "observaciones": "Traslado por necesidad del servicio",
      "fechaMovimiento": "2025-11-17T08:45:24.583Z",
      "equipo": {
        "id": 1,
        "codigoSICOIN": "323-001-2025",
        "descripcion": "Camilla de exploración médica..."
      },
      "areaOrigen": {
        "id": 2,
        "nombre": "Emergencia"
      },
      "areaDestino": {
        "id": 3,
        "nombre": "Hospitalización"
      },
      "usuario": {
        "id": 1,
        "nombre": "Administrador del Sistema"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

---

### POST /api/traslados

Crear un nuevo traslado.

**Permisos:** Admin, Inventarios

**Request Body:**
```json
{
  "equipoId": 1,
  "areaDestinoId": 3,
  "observaciones": "Traslado por necesidad del servicio"
}
```

**Validaciones:**
- El equipo debe existir
- El área destino debe existir
- No se puede trasladar al mismo área donde ya está

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "folioConocimiento": "CONOC-202511-0001",
    "equipo": { /* datos del equipo */ },
    "areaOrigen": { /* área de origen */ },
    "areaDestino": { /* área destino */ }
  },
  "message": "Traslado registrado exitosamente"
}
```

**Nota:** El sistema automáticamente:
- Genera el folio de conocimiento (CONOC-AAAAMM-NNNN)
- Actualiza la ubicación del equipo
- Registra en auditoría
- Notifica a Informática si es equipo de cómputo (subgrupo 328)

---

### GET /api/traslados/equipo/:equipoId/historial

Obtener historial de movimientos de un equipo.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "TRASLADO",
      "folioConocimiento": "CONOC-202511-0001",
      "fechaMovimiento": "2025-11-17T08:45:24.583Z",
      "areaOrigen": { /* área origen */ },
      "areaDestino": { /* área destino */ },
      "usuario": { /* usuario que realizó el traslado */ }
    }
  ]
}
```

---

## 🗑️ Bajas

### GET /api/bajas

Listar solicitudes de baja con filtros.

**Permisos:** Todos

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `equipoId` (number)
- `estado` (string) - PENDIENTE, APROBADO, RECHAZADO, TODOS
- `motivo` (string) - IRREPARABLE, OBSOLETO, PERDIDA_TOTAL, ROBO, TODOS

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "motivo": "OBSOLETO",
      "observaciones": "Equipo con más de 15 años de uso...",
      "estado": "PENDIENTE",
      "fechaCreacion": "2025-11-17T09:00:00.000Z",
      "equipo": {
        "id": 1,
        "codigoSICOIN": "323-001-2025",
        "descripcion": "Camilla..."
      },
      "creadoPor": {
        "id": 1,
        "nombre": "Administrador del Sistema"
      }
    }
  ],
  "pagination": { /* paginación */ }
}
```

---

### POST /api/bajas

Crear solicitud de baja.

**Permisos:** Admin, Inventarios, Mantenimiento

**Request Body:**
```json
{
  "equipoId": 1,
  "motivo": "OBSOLETO",
  "observaciones": "Equipo con más de 15 años de uso, tecnología obsoleta"
}
```

**Motivos válidos:**
- `IRREPARABLE` - Equipo irreparable
- `OBSOLETO` - Tecnología obsoleta
- `PERDIDA_TOTAL` - Pérdida total del equipo
- `ROBO` - Robo del equipo

**Validaciones:**
- El equipo no debe estar ya dado de baja
- No puede tener una solicitud de baja pendiente

**Response (201 Created):**
```json
{
  "success": true,
  "data": { /* baja creada */ },
  "message": "Solicitud de baja creada exitosamente"
}
```

**Nota:** El sistema automáticamente:
- Cambia el estado del equipo a "De baja (pendiente)"
- Notifica a los administradores

---

### PATCH /api/bajas/:id/procesar

Aprobar o rechazar una solicitud de baja.

**Permisos:** Admin, Inventarios

**Request Body (Aprobar):**
```json
{
  "aprobado": true
}
```

**Request Body (Rechazar):**
```json
{
  "aprobado": false,
  "motivoRechazo": "El equipo aún puede ser utilizado con mantenimiento"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* baja procesada */ },
  "message": "Baja aprobada exitosamente"
}
```

**Nota:** Al aprobar:
- El equipo pasa a estado "Dado de baja"

Al rechazar:
- El equipo vuelve a estado "Activo"
- Se notifica al solicitante

---

## 📊 Reportes

### GET /api/reportes/inventario

Obtener datos para reporte de inventario anual.

**Permisos:** Todos

**Query Parameters:**
- `anio` (number, opcional) - Año del reporte (default: año actual)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "anio": 2025,
    "equipos": [ /* lista de todos los equipos */ ],
    "totales": {
      "cantidad": 1234,
      "precioTotal": 15000000,
      "porArea": [
        {
          "area": "Emergencia",
          "cantidad": 120,
          "precioTotal": 2500000
        }
      ],
      "porSubgrupo": [
        {
          "subgrupo": "323 - Médico, sanitario y laboratorio",
          "cantidad": 450,
          "precioTotal": 8000000
        }
      ],
      "porEstado": [
        {
          "estado": "Activo",
          "cantidad": 1100
        }
      ]
    },
    "fechaGeneracion": "2025-11-17T10:00:00.000Z"
  }
}
```

---

### GET /api/reportes/tarjeta/:areaId

Obtener datos para tarjeta de responsabilidad de un área.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "area": {
      "id": 2,
      "nombre": "Emergencia",
      "jefe": "Dr. Juan Pérez"
    },
    "equipos": [ /* equipos del área */ ],
    "totales": {
      "cantidad": 120,
      "precioTotal": 2500000,
      "porSubgrupo": [ /* totales por subgrupo */ ]
    },
    "fechaGeneracion": "2025-11-17T10:00:00.000Z"
  }
}
```

---

### GET /api/reportes/qr/:equipoId

Generar código QR para un equipo.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipoId": 1,
    "codigoSICOIN": "323-001-2025",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "qrData": "{\"equipoId\":1,\"codigo\":\"323-001-2025\",\"url\":\"...\"}"
  }
}
```

**Nota:** El campo `qrCode` es una imagen en base64 lista para usar en `<img src="..." />`

---

## 📚 Catálogos

### GET /api/catalogos/areas

Listar todas las áreas activas.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Administración",
      "jefe": "Por asignar",
      "activo": true,
      "createdAt": "2025-11-17T07:00:00.000Z"
    }
  ]
}
```

---

### GET /api/catalogos/subgrupos

Listar todos los subgrupos SICOIN.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "321",
      "nombre": "De producción",
      "descripcion": "Maquinaria y equipo de producción",
      "activo": true
    },
    {
      "id": 2,
      "codigo": "322",
      "nombre": "De oficina y muebles",
      "descripcion": "Equipo de oficina y mobiliario",
      "activo": true
    }
  ]
}
```

---

### GET /api/catalogos/estados

Listar todos los estados de equipos.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Activo",
      "color": "green",
      "activo": true
    },
    {
      "id": 2,
      "nombre": "En reparación",
      "color": "yellow",
      "activo": true
    }
  ]
}
```

---

### GET /api/catalogos/proveedores

Listar todos los proveedores activos.

**Permisos:** Todos

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombreComercial": "Distribuidora Médica S.A.",
      "nit": "12345678-9",
      "direccion": "Zona 10, Ciudad",
      "telefono": "7777-7777",
      "email": "ventas@distmedica.com",
      "activo": true,
      "createdAt": "2025-11-17T07:00:00.000Z"
    }
  ]
}
```

---

### POST /api/catalogos/proveedores

Crear un nuevo proveedor.

**Permisos:** Admin, Inventarios

**Request Body:**
```json
{
  "nombreComercial": "Distribuidora Médica S.A.",
  "nit": "12345678-9",
  "direccion": "Zona 10, Ciudad de Guatemala",
  "telefono": "7777-7777",
  "email": "ventas@distmedica.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { /* proveedor creado */ },
  "message": "Proveedor creado exitosamente"
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 🔒 Control de Acceso por Rol

| Endpoint | Admin | Inventarios | Mantenimiento | Consulta |
|----------|-------|-------------|---------------|----------|
| POST /equipos | ✅ | ✅ | ❌ | ❌ |
| PUT /equipos/:id | ✅ | ✅ | ❌ | ❌ |
| POST /traslados | ✅ | ✅ | ❌ | ❌ |
| POST /bajas | ✅ | ✅ | ✅ | ❌ |
| PATCH /bajas/:id/procesar | ✅ | ✅ | ❌ | ❌ |
| GET (todos) | ✅ | ✅ | ✅ | ✅ |

---

## 📝 Notas Adicionales

### Formato de Fechas
Todas las fechas se manejan en formato ISO 8601:
```
2025-11-17T10:30:00.000Z
```

### Precios
Los precios se almacenan en **centavos** para evitar problemas de redondeo:
```
Q15,000.00 = 1500000 centavos
```

### Paginación
La paginación por defecto es:
- `limit`: 50 elementos
- `max limit`: 100 elementos
- `page`: empieza en 1

---

**Última actualización:** Noviembre 2025