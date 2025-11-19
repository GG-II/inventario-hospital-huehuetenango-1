# Script para reiniciar el servicio
# DEBE EJECUTARSE COMO ADMINISTRADOR

Write-Host "Reiniciando servicio del Sistema de Inventario..." -ForegroundColor Yellow

try {
    Restart-Service "Inventario Hospital Huehue" -ErrorAction Stop
    Write-Host "✅ Servicio reiniciado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 El sistema está disponible en: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al reiniciar el servicio" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Verifique que el servicio esté instalado:" -ForegroundColor Cyan
    Write-Host "   Get-Service 'Inventario Hospital Huehue'" -ForegroundColor White
}

Write-Host ""
Start-Sleep -Seconds 2