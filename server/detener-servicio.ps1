# Script para detener el servicio
# DEBE EJECUTARSE COMO ADMINISTRADOR

Write-Host "Deteniendo servicio del Sistema de Inventario..." -ForegroundColor Yellow

try {
    Stop-Service "Inventario Hospital Huehue" -ErrorAction Stop
    Write-Host "✅ Servicio detenido correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 El sistema ya no está disponible" -ForegroundColor Cyan
    Write-Host "   Para iniciarlo nuevamente: Start-Service 'Inventario Hospital Huehue'" -ForegroundColor White
} catch {
    Write-Host "❌ Error al detener el servicio" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Verifique que el servicio esté instalado y en ejecución:" -ForegroundColor Cyan
    Write-Host "   Get-Service 'Inventario Hospital Huehue'" -ForegroundColor White
}

Write-Host ""
Start-Sleep -Seconds 2