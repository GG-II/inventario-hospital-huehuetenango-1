# ✅ CHECKLIST DE DESPLIEGUE EN PRODUCCIÓN

## 📋 PREPARACIÓN

### Verificar Requisitos Previos
- [ ] Node.js instalado (v18 o superior) - Verificar con: `node --version`
- [ ] npm instalado - Verificar con: `npm --version`
- [ ] Proyecto compilando sin errores en desarrollo
- [ ] Base de datos con datos de prueba funcionando

---

## 🔧 CONFIGURACIÓN INICIAL

### Archivos y Dependencias
- [ ] Copiar todos los scripts (.js y .ps1) a la carpeta `server/`
- [ ] Instalar node-windows: `npm install --save-dev node-windows`
- [ ] Instalar @fastify/cors: `npm install @fastify/cors`
- [ ] Instalar @fastify/static: `npm install @fastify/static`

### Configurar Backend
- [ ] Editar `server/.env` y configurar variables de producción
- [ ] Cambiar JWT_SECRET a un valor seguro y aleatorio
- [ ] Establecer NODE_ENV=production
- [ ] Agregar código CORS en `server/src/index.ts`
- [ ] Agregar código para servir frontend estático en `server/src/index.ts`
- [ ] Agregar ruta catch-all para SPA en `server/src/index.ts`

### Compilar Proyecto
- [ ] Compilar frontend: `cd client && npm run build`
- [ ] Verificar que existe carpeta `client/dist/`
- [ ] Compilar backend: `cd server && npm run build`
- [ ] Verificar que existe carpeta `server/dist/`

---

## 🚀 INSTALACIÓN DEL SERVICIO

### Instalar como Servicio de Windows
- [ ] Abrir PowerShell como Administrador
- [ ] Navegar a la carpeta `server/`
- [ ] Ejecutar: `node install-service.js`
- [ ] Verificar mensaje de éxito

### Verificar Servicio
- [ ] Abrir `services.msc` (Win + R → services.msc)
- [ ] Buscar "Inventario Hospital Huehue"
- [ ] Verificar que el estado sea "En ejecución"
- [ ] Verificar que "Tipo de inicio" sea "Automático"

---

## 🌐 CONFIGURACIÓN DE RED

### Configurar Firewall
- [ ] Ejecutar `abrir-puerto.ps1` como Administrador
- [ ] Verificar mensaje de éxito
- [ ] Anotar la IP local mostrada

### Obtener IP de la PC Servidor
- [ ] Ejecutar: `ipconfig`
- [ ] Anotar "Dirección IPv4" (ejemplo: 192.168.1.100)
- [ ] IP anotada: ___________________

---

## ✨ PRUEBAS DE FUNCIONAMIENTO

### Prueba Local (en PC servidor)
- [ ] Abrir navegador
- [ ] Ir a: `http://localhost:3000`
- [ ] Verificar que carga la página de login
- [ ] Probar login con usuario: `admin` / password: `admin123`
- [ ] Verificar que entra al dashboard

### Prueba desde Otra PC
- [ ] Desde otra PC en la red, abrir navegador
- [ ] Ir a: `http://[IP-DEL-SERVIDOR]:3000`
- [ ] Verificar que carga la página de login
- [ ] Probar login
- [ ] Verificar que funciona correctamente

### Prueba de Funcionalidades Básicas
- [ ] Crear un equipo nuevo
- [ ] Editar un equipo existente
- [ ] Crear un traslado
- [ ] Solicitar una baja
- [ ] Generar un reporte PDF
- [ ] Visualizar código QR

---

## 📊 CONFIGURACIÓN DE LOGS

### Verificar Logs
- [ ] Ejecutar: `.\view-logs.ps1`
- [ ] Verificar opción 1 (logs normales)
- [ ] Verificar que se muestran logs del sistema
- [ ] Cerrar con Ctrl+C

### Crear Acceso Directo a Logs
- [ ] Crear acceso directo en escritorio
- [ ] Apuntar a: `view-logs.ps1`
- [ ] Nombrar: "Ver Logs - Sistema Inventario"
- [ ] Probar que funciona

---

## 🖥️ CONFIGURACIÓN DE ACCESOS

### Crear Accesos Directos - PC Servidor
- [ ] Crear acceso directo en escritorio
- [ ] URL: `http://localhost:3000`
- [ ] Nombre: "Sistema de Inventario Hospital"
- [ ] Probar que funciona

### Crear Accesos Directos - Otras 3 PCs
- [ ] PC 1: Crear acceso directo con IP del servidor
- [ ] PC 2: Crear acceso directo con IP del servidor
- [ ] PC 3: Crear acceso directo con IP del servidor
- [ ] Probar que funcionan desde todas las PCs

---

## 💾 CONFIGURACIÓN DE RESPALDOS

### Verificar Respaldos Automáticos
- [ ] Verificar que existe carpeta `server/backups/`
- [ ] Verificar que se crean respaldos automáticos
- [ ] Anotar ubicación de respaldos

### Probar Respaldo Manual
- [ ] Ejecutar: `.\respaldar-base-datos.ps1`
- [ ] Verificar que se crea el respaldo
- [ ] Verificar carpeta `respaldos/`

---

## 📚 DOCUMENTACIÓN Y CAPACITACIÓN

### Crear Documentación
- [ ] Imprimir o guardar guía completa
- [ ] Crear documento de usuarios y contraseñas
- [ ] Crear manual de usuario básico
- [ ] Documentar procedimientos comunes

### Capacitar Personal
- [ ] Capacitar al Jefe de Inventarios
- [ ] Capacitar a usuario 2 del departamento
- [ ] Capacitar a usuario 3 del departamento
- [ ] Hacer pruebas con cada usuario

---

## 🔐 SEGURIDAD

### Configurar Seguridad
- [ ] Cambiar contraseña del usuario `admin`
- [ ] Crear usuarios reales (no usar usuarios de prueba)
- [ ] Configurar roles apropiados
- [ ] Eliminar usuarios de prueba innecesarios

### Verificar Permisos
- [ ] Verificar que Admin puede hacer todo
- [ ] Verificar que Inventarios puede gestionar equipos
- [ ] Verificar que Mantenimiento solo puede solicitar bajas
- [ ] Verificar que Consulta solo puede ver

---

## 🧪 PRUEBAS FINALES

### Pruebas de Reinicio
- [ ] Reiniciar la PC servidor
- [ ] Verificar que el servicio inicia automáticamente
- [ ] Verificar que el sistema es accesible después del reinicio
- [ ] Probar acceso desde otras PCs

### Pruebas de Carga
- [ ] Crear 10 equipos de prueba
- [ ] Hacer 5 traslados
- [ ] Solicitar 2 bajas
- [ ] Generar 3 reportes PDF
- [ ] Verificar rendimiento

### Pruebas de Recuperación
- [ ] Crear respaldo manual
- [ ] Detener servicio
- [ ] Iniciar servicio
- [ ] Verificar que todo funciona

---

## 📝 ENTREGA FINAL

### Documentación Entregada
- [ ] Guía de despliegue completa
- [ ] README de inicio rápido
- [ ] Checklist (este documento)
- [ ] Manual de usuario
- [ ] Documento de credenciales

### Scripts Entregados
- [ ] install-service.js
- [ ] uninstall-service.js
- [ ] view-logs.ps1
- [ ] abrir-puerto.ps1
- [ ] actualizar-sistema.ps1
- [ ] reiniciar-servicio.ps1
- [ ] detener-servicio.ps1
- [ ] iniciar-servicio.ps1
- [ ] respaldar-base-datos.ps1

### Capacitación Completada
- [ ] Demostración del sistema
- [ ] Explicación de funcionalidades
- [ ] Práctica con usuarios reales
- [ ] Preguntas resueltas

---

## ✅ VERIFICACIÓN FINAL

### Todo Funcionando
- [ ] Sistema inicia automáticamente con Windows
- [ ] Accesible desde las 4 computadoras
- [ ] Logs visibles y funcionando
- [ ] Respaldos automáticos funcionando
- [ ] Todos los usuarios pueden acceder
- [ ] Todas las funcionalidades funcionan correctamente

### Información Anotada
- [ ] IP del servidor: ___________________
- [ ] Usuario Admin: ___________________
- [ ] Contraseña Admin: ___________________
- [ ] Ubicación de respaldos: ___________________
- [ ] Fecha de instalación: ___________________

---

## 🎉 ¡SISTEMA EN PRODUCCIÓN!

Si has completado todos los items de este checklist, el sistema está:

✅ Completamente instalado
✅ Configurado correctamente
✅ Probado y funcionando
✅ Documentado
✅ Personal capacitado
✅ Listo para uso en producción

---

## 📞 CONTACTO DE SOPORTE

**Desarrollador:** Gerbert
**Universidad:** Universidad Mariano Gálvez de Guatemala
**Proyecto:** Sistema de Control de Inventarios - Hospital Regional de Huehuetenango

---

## 📅 MANTENIMIENTO FUTURO

### Tareas Programadas

**Diario:**
- Ninguna (sistema automático)

**Semanal:**
- [ ] Verificar logs para detectar errores
- [ ] Verificar que respaldos se estén creando

**Mensual:**
- [ ] Crear respaldo manual adicional
- [ ] Revisar y limpiar respaldos antiguos (mantener últimos 3 meses)
- [ ] Verificar espacio en disco
- [ ] Actualizar documentación si hay cambios

---

*Documento completado: ___/___/202___*
*Responsable: _______________________*
*Firma: _____________________________*