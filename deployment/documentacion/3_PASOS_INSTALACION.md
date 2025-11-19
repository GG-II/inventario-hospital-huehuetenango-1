# 🎯 3 PASOS PARA INSTALAR - GUÍA VISUAL

## ⚡ INSTALACIÓN SÚPER RÁPIDA (5 minutos)

---

## 📥 PASO 1: ORGANIZA LOS ARCHIVOS

### Descarga los 15 archivos y organízalos así:

```
📁 TU-PROYECTO/
│
├── 📄 instalacion-completa.ps1       👈 AQUÍ (raíz)
├── 📄 actualizar-sistema.ps1         👈 AQUÍ (raíz)
│
├── 📁 server/
│   ├── 📄 install-service.js         👈 AQUÍ
│   ├── 📄 uninstall-service.js       👈 AQUÍ
│   ├── 📄 abrir-puerto.ps1           👈 AQUÍ
│   ├── 📄 view-logs.ps1              👈 AQUÍ
│   ├── 📄 reiniciar-servicio.ps1     👈 AQUÍ
│   ├── 📄 detener-servicio.ps1       👈 AQUÍ
│   ├── 📄 iniciar-servicio.ps1       👈 AQUÍ
│   ├── 📄 respaldar-base-datos.ps1   👈 AQUÍ
│   └── ...
│
├── 📁 client/
│   └── ...
│
└── 📁 docs/ (crear esta carpeta)
    ├── 📄 RESUMEN_EJECUTIVO.md       👈 AQUÍ
    ├── 📄 README_INICIO_RAPIDO.md    👈 AQUÍ
    ├── 📄 GUIA_DESPLIEGUE_PRODUCCION.md 👈 AQUÍ
    ├── 📄 CHECKLIST_DESPLIEGUE.md    👈 AQUÍ
    └── 📄 INDICE_ARCHIVOS.md         👈 AQUÍ
```

---

## ⚙️ PASO 2: EJECUTA EL INSTALADOR

### 2.1 Abre PowerShell como Administrador

1. Busca "PowerShell" en Windows
2. **Clic derecho** → "Ejecutar como administrador"
3. Di "Sí" cuando pregunte

### 2.2 Ve a tu proyecto

```powershell
cd C:\ruta\a\tu\proyecto
```

Ejemplo:
```powershell
cd C:\Users\Gerbert\proyectos\inventario-hospital
```

### 2.3 Ejecuta el instalador

```powershell
.\instalacion-completa.ps1
```

### 2.4 Espera 5-10 minutos

El script hará **TODO automáticamente**:

```
✅ Instalando dependencias...
✅ Compilando frontend...
✅ Compilando backend...
✅ Instalando servicio de Windows...
✅ Configurando firewall...
✅ ¡Listo!
```

---

## ✅ PASO 3: VERIFICA QUE FUNCIONA

### 3.1 Abre el navegador

Ve a: `http://localhost:3000`

### 3.2 Deberías ver esto:

```
┌─────────────────────────────────────┐
│  Sistema de Inventario Hospitalario │
│                                     │
│  Usuario: _______________          │
│  Contraseña: ___________           │
│                                     │
│  [  Iniciar Sesión  ]              │
└─────────────────────────────────────┘
```

### 3.3 Inicia sesión con:

```
Usuario: admin
Contraseña: admin123
```

### 3.4 ¡Listo! Estás dentro del sistema

---

## 🌐 BONUS: ACCESO DESDE OTRAS PCs

### Obtén la IP de tu PC:

1. Abre CMD o PowerShell
2. Escribe: `ipconfig`
3. Busca "Dirección IPv4"
4. Ejemplo: `192.168.1.100`

### Accede desde otras PCs:

En el navegador de otra PC:
```
http://192.168.1.100:3000
```

---

## 🎨 CREAR ACCESOS DIRECTOS

### En todas las PCs:

1. **Clic derecho** en el escritorio
2. Nuevo → **Acceso directo**
3. **En PC servidor:** escribe `http://localhost:3000`
4. **En otras PCs:** escribe `http://192.168.1.100:3000`
5. Nombre: **Sistema de Inventario Hospital**
6. **Aceptar**

¡Ahora todos pueden abrir el sistema con un doble clic!

---

## 🔍 VERIFICAR EL SERVICIO

### ¿Quieres ver si el servicio está corriendo?

1. Presiona `Win + R`
2. Escribe: `services.msc`
3. Presiona Enter
4. Busca: **Inventario Hospital Huehue**
5. Debe decir: **En ejecución** ✅

---

## 📊 VER LOS LOGS

### ¿Quieres ver qué está haciendo el sistema?

Desde la carpeta `server/`:

```powershell
.\view-logs.ps1
```

Aparecerá un menú:
```
1. Logs normales
2. Logs de errores
3. Logs del wrapper
4. Ver todos los archivos
```

Elige una opción y verás los logs en tiempo real.

---

## 🔄 COMANDOS ÚTILES

### Si necesitas reiniciar el sistema:

```powershell
cd server
.\reiniciar-servicio.ps1
```

### Si necesitas actualizar el código:

```powershell
.\actualizar-sistema.ps1
```

### Si necesitas crear un respaldo:

```powershell
cd server
.\respaldar-base-datos.ps1
```

---

## 🆘 SOLUCIÓN RÁPIDA DE PROBLEMAS

### ❌ "No puedo acceder al sistema"

**Solución:**
1. Verifica que el servicio esté corriendo
   ```powershell
   Get-Service "Inventario Hospital Huehue"
   ```
2. Si no está corriendo:
   ```powershell
   cd server
   .\iniciar-servicio.ps1
   ```

### ❌ "No puedo acceder desde otra PC"

**Solución:**
1. Verifica la IP:
   ```powershell
   ipconfig
   ```
2. Reconfigura el firewall:
   ```powershell
   cd server
   .\abrir-puerto.ps1
   ```

### ❌ "El frontend no carga"

**Solución:**
1. Recompila:
   ```powershell
   cd client
   npm run build
   ```
2. Reinicia:
   ```powershell
   cd ..\server
   .\reiniciar-servicio.ps1
   ```

---

## ✅ CHECKLIST RÁPIDO

Marca cada paso que completes:

- [ ] Archivos organizados en las carpetas correctas
- [ ] PowerShell abierto como Administrador
- [ ] Ejecutado `instalacion-completa.ps1`
- [ ] Sistema accesible en `http://localhost:3000`
- [ ] Login funcionando (admin/admin123)
- [ ] Dashboard visible
- [ ] Servicio "En ejecución" en services.msc
- [ ] Accesible desde otra PC en la red
- [ ] Accesos directos creados
- [ ] Logs visibles con `view-logs.ps1`

**¿Todos marcados? ¡Sistema instalado! 🎉**

---

## 📖 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles, lee en orden:

1. **RESUMEN_EJECUTIVO.md** (5 min) - Visión general
2. **README_INICIO_RAPIDO.md** (5 min) - Guía rápida
3. **GUIA_DESPLIEGUE_PRODUCCION.md** (20 min) - Guía completa
4. **CHECKLIST_DESPLIEGUE.md** - Lista detallada

---

## 🎯 LO MÁS IMPORTANTE

### El archivo mágico: `instalacion-completa.ps1`

Este script hace **TODO** por ti:
- ✅ Instala dependencias
- ✅ Compila frontend
- ✅ Compila backend
- ✅ Instala servicio
- ✅ Configura firewall
- ✅ Inicia sistema

**Solo ejecútalo y espera 5-10 minutos.**

---

## 🎓 PARA TU PRESENTACIÓN DE TESIS

### Puedes decir con orgullo:

✅ "Implementé un sistema de inventario web completo"
✅ "Configuré despliegue en producción como servicio de Windows"
✅ "El sistema inicia automáticamente con el servidor"
✅ "Incluye respaldos automáticos y logs para auditoría"
✅ "Documentación completa para mantenimiento"
✅ "Capacitación al personal del hospital"

**Esto es trabajo PROFESIONAL, no solo un proyecto estudiantil.**

---

## 🚀 ¿Listo?

1. Organiza los archivos ✅
2. Ejecuta `instalacion-completa.ps1` ✅
3. Abre `http://localhost:3000` ✅
4. **¡Disfruta tu sistema funcionando!** 🎉

---

**¡3 PASOS Y LISTO!**
**No puede ser más fácil que esto.**

---

*Sistema de Inventario - Hospital Regional de Huehuetenango*
*Gerbert - Universidad Mariano Gálvez de Guatemala*
*Noviembre 2025*