# Script para configurar Firewall de Windows
# DEBE EJECUTARSE COMO ADMINISTRADOR

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACIÓN DE FIREWALL - SISTEMA DE INVENTARIO  " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se está ejecutando como administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Para ejecutar como Administrador:" -ForegroundColor Yellow
    Write-Host "   1. Clic derecho en el archivo" -ForegroundColor White
    Write-Host "   2. Seleccionar 'Ejecutar como administrador'" -ForegroundColor White
    Write-Host ""
    Read-Host "Presione Enter para salir"
    exit
}

Write-Host "✅ Ejecutándose con privilegios de Administrador" -ForegroundColor Green
Write-Host ""
Write-Host "Configurando Firewall para el Sistema de Inventario..." -ForegroundColor Yellow
Write-Host ""

# Eliminar regla existente si existe
try {
    Remove-NetFirewallRule -DisplayName "Sistema Inventario Hospital" -ErrorAction SilentlyContinue
    Write-Host "🗑️  Regla anterior eliminada (si existía)" -ForegroundColor Gray
} catch {
    # No hay problema si no existe
}

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

    Write-Host ""
    Write-Host "✅ Firewall configurado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Detalles de la configuración:" -ForegroundColor Cyan
    Write-Host "   - Puerto abierto: 3000" -ForegroundColor White
    Write-Host "   - Protocolo: TCP" -ForegroundColor White
    Write-Host "   - Perfil: Privado (red local)" -ForegroundColor White
    Write-Host "   - Dirección: Entrada (Inbound)" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Ahora otras computadoras pueden acceder al sistema" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Para acceder desde otras PCs:" -ForegroundColor Yellow
    
    # Obtener IP local
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"} | Select-Object -First 1).IPAddress
    
    if ($ipAddress) {
        Write-Host "   URL: http://$ipAddress:3000" -ForegroundColor Cyan
    } else {
        Write-Host "   URL: http://[IP-DE-ESTA-PC]:3000" -ForegroundColor Cyan
    }
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error al configurar el firewall" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    Write-Host ""
}

# Mostrar regla creada
Write-Host "📋 Verificando regla de firewall:" -ForegroundColor Cyan
Write-Host ""
Get-NetFirewallRule -DisplayName "Sistema Inventario Hospital" | Format-Table DisplayName, Enabled, Direction, Action

Write-Host ""
Read-Host "Presione Enter para salir"