# Script para ver logs del servicio en tiempo real

$logPath = "C:\ProgramData\Inventario Hospital Huehue\daemon\"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  VISOR DE LOGS - SISTEMA DE INVENTARIO HOSPITALARIO  " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si la carpeta de logs existe
if (-not (Test-Path $logPath)) {
    Write-Host "❌ Error: No se encontró la carpeta de logs" -ForegroundColor Red
    Write-Host "   Ruta buscada: $logPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Cyan
    Write-Host "   1. Verifique que el servicio esté instalado" -ForegroundColor White
    Write-Host "   2. Ejecute: Get-Service 'Inventario Hospital Huehue'" -ForegroundColor White
    Write-Host "   3. Reinstale el servicio si es necesario" -ForegroundColor White
    Write-Host ""
    Read-Host "Presione Enter para salir"
    exit
}

Write-Host "Logs disponibles:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Logs normales (out.log)" -ForegroundColor Green
Write-Host "      - Muestra: console.log, información general" -ForegroundColor Gray
Write-Host ""
Write-Host "  [2] Logs de errores (err.log)" -ForegroundColor Red
Write-Host "      - Muestra: console.error, errores del sistema" -ForegroundColor Gray
Write-Host ""
Write-Host "  [3] Logs del wrapper (wrapper.log)" -ForegroundColor Cyan
Write-Host "      - Muestra: inicio/detención del servicio" -ForegroundColor Gray
Write-Host ""
Write-Host "  [4] Ver todos los archivos de log" -ForegroundColor Magenta
Write-Host ""

$choice = Read-Host "Seleccione qué log desea ver (1, 2, 3 o 4)"

switch ($choice) {
    "1" { 
        $logFile = "$logPath\Inventario Hospital Huehue.out.log"
        if (Test-Path $logFile) {
            Write-Host ""
            Write-Host "📄 Mostrando logs normales..." -ForegroundColor Green
            Write-Host "   Presione Ctrl+C para salir" -ForegroundColor Yellow
            Write-Host ""
            Get-Content $logFile -Wait -Tail 50
        } else {
            Write-Host "❌ El archivo de log no existe aún" -ForegroundColor Red
            Write-Host "💡 El archivo se creará cuando el servicio genere su primer log" -ForegroundColor Cyan
        }
    }
    "2" { 
        $logFile = "$logPath\Inventario Hospital Huehue.err.log"
        if (Test-Path $logFile) {
            Write-Host ""
            Write-Host "📄 Mostrando logs de errores..." -ForegroundColor Red
            Write-Host "   Presione Ctrl+C para salir" -ForegroundColor Yellow
            Write-Host ""
            Get-Content $logFile -Wait -Tail 50
        } else {
            Write-Host "✅ No hay errores registrados (el archivo no existe)" -ForegroundColor Green
            Write-Host "💡 Esto es bueno, significa que no ha habido errores" -ForegroundColor Cyan
        }
    }
    "3" { 
        $logFile = "$logPath\Inventario Hospital Huehue.wrapper.log"
        if (Test-Path $logFile) {
            Write-Host ""
            Write-Host "📄 Mostrando logs del wrapper..." -ForegroundColor Cyan
            Write-Host "   Presione Ctrl+C para salir" -ForegroundColor Yellow
            Write-Host ""
            Get-Content $logFile -Wait -Tail 50
        } else {
            Write-Host "❌ El archivo de log no existe aún" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host ""
        Write-Host "📂 Archivos de log disponibles:" -ForegroundColor Cyan
        Write-Host ""
        Get-ChildItem $logPath | Format-Table Name, Length, LastWriteTime -AutoSize
        Write-Host ""
        Write-Host "💡 Ubicación: $logPath" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presione Enter para salir"
    }
    default { 
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        Write-Host "💡 Por favor, seleccione 1, 2, 3 o 4" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presione Enter para salir"
    }
}