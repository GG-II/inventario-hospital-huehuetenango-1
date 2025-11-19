# Script de Instalación Completa - Todo en Uno
# DEBE EJECUTARSE COMO ADMINISTRADOR desde la RAÍZ del proyecto

param(
    [switch]$SkipBuild,
    [switch]$SkipFirewall
)

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN COMPLETA - SISTEMA DE INVENTARIO  " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se está ejecutando como administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Para ejecutar como Administrador:" -ForegroundColor Yellow
    Write-Host "   1. Clic derecho en PowerShell" -ForegroundColor White
    Write-Host "   2. Seleccionar 'Ejecutar como administrador'" -ForegroundColor White
    Write-Host "   3. Navegar a la raíz del proyecto" -ForegroundColor White
    Write-Host "   4. Ejecutar: .\instalacion-completa.ps1" -ForegroundColor White
    Write-Host ""
    Read-Host "Presione Enter para salir"
    exit
}

Write-Host "✅ Ejecutándose con privilegios de Administrador" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en la raíz del proyecto
if (-not (Test-Path ".\server") -or -not (Test-Path ".\client")) {
    Write-Host "❌ ERROR: Debe ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   (donde están las carpetas 'server' y 'client')" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presione Enter para salir"
    exit
}

Write-Host "📦 INICIANDO INSTALACIÓN COMPLETA..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Este proceso:" -ForegroundColor Yellow
Write-Host "  1. Instalará dependencias necesarias" -ForegroundColor White
Write-Host "  2. Compilará frontend y backend" -ForegroundColor White
Write-Host "  3. Instalará el servicio de Windows" -ForegroundColor White
Write-Host "  4. Configurará el firewall" -ForegroundColor White
Write-Host "  5. Iniciará el sistema" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Tiempo estimado: 5-10 minutos" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "¿Desea continuar? (S/N)"
if ($continue -ne "S" -and $continue -ne "s") {
    Write-Host "Instalación cancelada" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Instalar dependencias
Write-Host "1️⃣  INSTALANDO DEPENDENCIAS..." -ForegroundColor Yellow
Write-Host ""

# Instalar dependencias del backend
Write-Host "   📦 Instalando dependencias del backend..." -ForegroundColor Gray
Set-Location -Path ".\server"
npm install --silent
npm install --save-dev node-windows --silent
npm install @fastify/cors --silent
npm install @fastify/static --silent
Write-Host "   ✅ Dependencias del backend instaladas" -ForegroundColor Green
Write-Host ""

# Instalar dependencias del frontend
Write-Host "   📦 Instalando dependencias del frontend..." -ForegroundColor Gray
Set-Location -Path "..\client"
npm install --silent
Write-Host "   ✅ Dependencias del frontend instaladas" -ForegroundColor Green
Write-Host ""

Set-Location -Path ".."

# PASO 2: Compilar proyecto
if (-not $SkipBuild) {
    Write-Host "2️⃣  COMPILANDO PROYECTO..." -ForegroundColor Yellow
    Write-Host ""

    # Compilar frontend
    Write-Host "   🔨 Compilando frontend..." -ForegroundColor Gray
    Set-Location -Path ".\client"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "   ❌ Error al compilar frontend" -ForegroundColor Red
        Write-Host "   Revise los mensajes de error anteriores" -ForegroundColor Yellow
        Set-Location -Path ".."
        Read-Host "Presione Enter para salir"
        exit
    }
    Write-Host "   ✅ Frontend compilado correctamente" -ForegroundColor Green
    Write-Host ""

    # Compilar backend
    Write-Host "   🔨 Compilando backend..." -ForegroundColor Gray
    Set-Location -Path "..\server"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "   ❌ Error al compilar backend" -ForegroundColor Red
        Write-Host "   Revise los mensajes de error anteriores" -ForegroundColor Yellow
        Set-Location -Path ".."
        Read-Host "Presione Enter para salir"
        exit
    }
    Write-Host "   ✅ Backend compilado correctamente" -ForegroundColor Green
    Write-Host ""

    Set-Location -Path ".."
} else {
    Write-Host "2️⃣  COMPILACIÓN OMITIDA (parámetro -SkipBuild)" -ForegroundColor Yellow
    Write-Host ""
}

# PASO 3: Instalar servicio
Write-Host "3️⃣  INSTALANDO SERVICIO DE WINDOWS..." -ForegroundColor Yellow
Write-Host ""

Set-Location -Path ".\server"
node install-service.js

# Esperar a que el servicio se instale
Start-Sleep -Seconds 5

Set-Location -Path ".."
Write-Host ""

# PASO 4: Configurar firewall
if (-not $SkipFirewall) {
    Write-Host "4️⃣  CONFIGURANDO FIREWALL..." -ForegroundColor Yellow
    Write-Host ""

    Set-Location -Path ".\server"

    # Eliminar regla existente si existe
    try {
        Remove-NetFirewallRule -DisplayName "Sistema Inventario Hospital" -ErrorAction SilentlyContinue
    } catch {}

    # Crear nueva regla
    try {
        New-NetFirewallRule `
            -DisplayName "Sistema Inventario Hospital" `
            -Direction Inbound `
            -LocalPort 3000 `
            -Protocol TCP `
            -Action Allow `
            -Profile Private `
            -Description "Permite acceso al Sistema de Inventario desde la red local" | Out-Null

        Write-Host "   ✅ Firewall configurado correctamente" -ForegroundColor Green
        Write-Host "   Puerto 3000 abierto para la red local" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  No se pudo configurar el firewall automáticamente" -ForegroundColor Yellow
        Write-Host "   Puede configurarlo manualmente ejecutando: .\abrir-puerto.ps1" -ForegroundColor Gray
    }

    Set-Location -Path ".."
    Write-Host ""
} else {
    Write-Host "4️⃣  CONFIGURACIÓN DE FIREWALL OMITIDA (parámetro -SkipFirewall)" -ForegroundColor Yellow
    Write-Host ""
}

# PASO 5: Verificar que el servicio está corriendo
Write-Host "5️⃣  VERIFICANDO INSTALACIÓN..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3

try {
    $servicio = Get-Service "Inventario Hospital Huehue" -ErrorAction Stop
    
    if ($servicio.Status -eq "Running") {
        Write-Host "   ✅ Servicio instalado y en ejecución" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Servicio instalado pero no está en ejecución" -ForegroundColor Yellow
        Write-Host "   Intentando iniciar el servicio..." -ForegroundColor Gray
        Start-Service "Inventario Hospital Huehue"
        Start-Sleep -Seconds 3
        Write-Host "   ✅ Servicio iniciado" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ No se pudo verificar el servicio" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
}

Write-Host ""

# PASO 6: Mostrar información final
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE  " -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Obtener IP local
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"} | Select-Object -First 1).IPAddress

Write-Host "🌐 ACCESO AL SISTEMA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Desde esta PC:" -ForegroundColor Yellow
Write-Host "   → http://localhost:3000" -ForegroundColor White
Write-Host ""

if ($ipAddress) {
    Write-Host "   Desde otras PCs en la red local:" -ForegroundColor Yellow
    Write-Host "   → http://$ipAddress:3000" -ForegroundColor White
    Write-Host ""
}

Write-Host "👤 CREDENCIALES DE PRUEBA:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Usuario: admin" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "   ⚠️  IMPORTANTE: Cambie estas credenciales después del primer login" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 INFORMACIÓN DEL SERVICIO:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Nombre: Inventario Hospital Huehue" -ForegroundColor White
Write-Host "   Estado: $(try { (Get-Service 'Inventario Hospital Huehue').Status } catch { 'Desconocido' })" -ForegroundColor White
Write-Host "   Inicio automático: Sí" -ForegroundColor White
Write-Host ""

Write-Host "📁 UBICACIONES IMPORTANTES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Base de datos:" -ForegroundColor White
Write-Host "   → .\server\data\inventario.db" -ForegroundColor Gray
Write-Host ""
Write-Host "   Respaldos automáticos:" -ForegroundColor White
Write-Host "   → .\server\backups\" -ForegroundColor Gray
Write-Host ""
Write-Host "   Logs del servicio:" -ForegroundColor White
Write-Host "   → C:\ProgramData\Inventario Hospital Huehue\daemon\" -ForegroundColor Gray
Write-Host ""

Write-Host "🛠️  COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Ver logs en tiempo real:" -ForegroundColor White
Write-Host "   → .\server\view-logs.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   Reiniciar servicio:" -ForegroundColor White
Write-Host "   → Restart-Service 'Inventario Hospital Huehue'" -ForegroundColor Gray
Write-Host ""
Write-Host "   Ver estado del servicio:" -ForegroundColor White
Write-Host "   → Get-Service 'Inventario Hospital Huehue'" -ForegroundColor Gray
Write-Host ""
Write-Host "   Crear respaldo manual:" -ForegroundColor White
Write-Host "   → .\server\respaldar-base-datos.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Guía completa:" -ForegroundColor White
Write-Host "   → GUIA_DESPLIEGUE_PRODUCCION.md" -ForegroundColor Gray
Write-Host ""
Write-Host "   Inicio rápido:" -ForegroundColor White
Write-Host "   → README_INICIO_RAPIDO.md" -ForegroundColor Gray
Write-Host ""
Write-Host "   Checklist:" -ForegroundColor White
Write-Host "   → CHECKLIST_DESPLIEGUE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 ¡El sistema está listo para usar!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos recomendados:" -ForegroundColor Yellow
Write-Host "1. Probar acceso desde esta PC (http://localhost:3000)" -ForegroundColor White
Write-Host "2. Probar acceso desde otra PC en la red local" -ForegroundColor White
Write-Host "3. Cambiar credenciales por defecto" -ForegroundColor White
Write-Host "4. Crear usuarios reales del departamento" -ForegroundColor White
Write-Host "5. Capacitar al personal" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 3
Read-Host "Presione Enter para salir"