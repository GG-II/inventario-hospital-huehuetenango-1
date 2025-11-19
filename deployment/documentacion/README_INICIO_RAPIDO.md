# Script para crear respaldo manual de la base de datos

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  RESPALDO DE BASE DE DATOS - SISTEMA DE INVENTARIO  " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$origen = ".\server\data\inventario.db"
$carpetaRespaldos = ".\respaldos"
$destino = "$carpetaRespaldos\inventario_$fecha.db"

# Verificar que la base de datos existe
if (-not (Test-Path $origen)) {
    Write-Host "❌ Error: No se encontró la base de datos" -ForegroundColor Red
    Write-Host "   Ruta buscada: $origen" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Verifique que está en la raíz del proyecto" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Presione Enter para salir"
    exit
}

Write-Host "📋 Información del respaldo:" -ForegroundColor Yellow
Write-Host "   - Base de datos: $origen" -ForegroundColor White

# Obtener tamaño del archivo
$size = (Get-Item $origen).Length / 1MB
Write-Host "   - Tamaño: $([math]::Round($size, 2)) MB" -ForegroundColor White
Write-Host "   - Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

Write-Host "Creando respaldo..." -ForegroundColor Yellow

# Crear carpeta de respaldos si no existe
if (-not (Test-Path $carpetaRespaldos)) {
    New-Item -ItemType Directory -Force -Path $carpetaRespaldos | Out-Null
    Write-Host "📁 Carpeta de respaldos creada: $carpetaRespaldos" -ForegroundColor Gray
}

# Copiar base de datos
try {
    Copy-Item $origen -Destination $destino -ErrorAction Stop
    Write-Host ""
    Write-Host "✅ Respaldo creado exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📄 Ubicación del respaldo:" -ForegroundColor Cyan
    Write-Host "   $destino" -ForegroundColor White
    Write-Host ""
    
    # Mostrar respaldos recientes
    Write-Host "📂 Respaldos recientes:" -ForegroundColor Yellow
    Write-Host ""
    Get-ChildItem $carpetaRespaldos -Filter "inventario_*.db" | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 5 | 
        Format-Table Name, @{Name="Tamaño (MB)";Expression={[math]::Round($_.Length/1MB, 2)}}, LastWriteTime -AutoSize
    
    # Contar respaldos
    $cantidadRespaldos = (Get-ChildItem $carpetaRespaldos -Filter "inventario_*.db").Count
    Write-Host ""
    Write-Host "💾 Total de respaldos: $cantidadRespaldos" -ForegroundColor Cyan
    
    if ($cantidadRespaldos -gt 30) {
        Write-Host ""
        Write-Host "⚠️  Tiene más de 30 respaldos" -ForegroundColor Yellow
        Write-Host "💡 Considere eliminar los respaldos antiguos para ahorrar espacio" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error al crear el respaldo" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Presione Enter para salir"