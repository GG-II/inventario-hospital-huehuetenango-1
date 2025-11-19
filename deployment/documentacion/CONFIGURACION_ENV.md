# 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

## 📋 Variables de Entorno para tu Proyecto

Basado en tu documentación DEVELOPMENT.md, estas son las variables correctas:

---

## 🖥️ Backend (server/.env)

### Desarrollo
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

### Producción (Red Local Hospital)
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_PATH=./database.sqlite

# JWT
JWT_SECRET=[GENERAR_CLAVE_SEGURA_ALEATORIA_EN_PRODUCCION]
JWT_EXPIRES_IN=8h

# App
APP_URL=http://[IP-DEL-SERVIDOR]:3000
```

---

## 💻 Frontend (client/.env)

### Desarrollo
```env
# API
VITE_API_URL=http://localhost:3000/api

# App
VITE_APP_NAME=Sistema de Inventario Hospitalario
```

### Producción
```env
# API (se conectará al backend en la misma máquina)
VITE_API_URL=http://localhost:3000/api

# App
VITE_APP_NAME=Sistema de Inventario Hospitalario
```

---

## 🔐 Generar JWT_SECRET Seguro

### Opción 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Opción 2: PowerShell
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Opción 3: Online
Usar generador seguro: https://randomkeygen.com/

**Ejemplo de JWT_SECRET seguro:**
```
a8f5f167f44f4964e6c998dee827110c03ae3ba5b5d3dd6a867f2cb9e26f3b3f
```

---

## 📝 NOTAS IMPORTANTES

### Para Desarrollo
- ✅ El JWT_SECRET puede ser simple
- ✅ NODE_ENV debe ser `development`
- ✅ Usar `localhost` en las URLs

### Para Producción
- ⚠️ **CAMBIAR** el JWT_SECRET a uno aleatorio y seguro
- ⚠️ NODE_ENV debe ser `production`
- ⚠️ JWT_EXPIRES_IN = 8h (tokens válidos por 8 horas)
- ⚠️ DATABASE_PATH debe apuntar a `database.sqlite`

---

## 🔄 Diferencias con los Scripts de Despliegue

Los scripts de despliegue que te generé anteriormente asumían:
- ❌ Base de datos: `inventario.db`
- ❌ JWT expira en: `24h`

**CORRECCIÓN APLICADA:**
- ✅ Base de datos: `database.sqlite`
- ✅ JWT expira en: `8h`

---

## 📂 Ubicación de Archivos

```
tu-proyecto/
├── server/
│   ├── .env                  ← Variables backend
│   ├── database.sqlite       ← Base de datos SQLite
│   └── ...
│
└── client/
    ├── .env                  ← Variables frontend
    └── ...
```

---

## ✅ Checklist de Configuración

Antes de desplegar en producción:

- [ ] Generar JWT_SECRET aleatorio y seguro
- [ ] Actualizar JWT_SECRET en `server/.env`
- [ ] Verificar NODE_ENV=production
- [ ] Verificar DATABASE_PATH=./database.sqlite
- [ ] Configurar IP correcta en APP_URL
- [ ] Hacer respaldo de `database.sqlite`

---

**Archivo creado:** Noviembre 2025  
**Compatible con:** Node.js v22.21.0  
**Sistema:** Inventario Hospital Regional Huehuetenango