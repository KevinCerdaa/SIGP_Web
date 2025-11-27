# Script para iniciar el servidor Django
# Ejecuta este script con: .\iniciar_servidor.ps1

Write-Host "🚀 Iniciando servidor Django..." -ForegroundColor Green

# Activar entorno virtual
if (Test-Path "venv\Scripts\Activate.ps1") {
    . venv\Scripts\Activate.ps1
    Write-Host "✅ Entorno virtual activado" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró el entorno virtual" -ForegroundColor Red
    Write-Host "Ejecuta primero: python -m venv venv" -ForegroundColor Yellow
    exit
}

# Verificar que MySQL esté corriendo
Write-Host "`n🔍 Verificando conexión a MySQL..." -ForegroundColor Yellow
python verificar_mysql.py 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: No se pudo verificar MySQL" -ForegroundColor Yellow
    Write-Host "Asegúrate de que MySQL esté corriendo en XAMPP" -ForegroundColor Yellow
}

# Iniciar servidor
Write-Host "`n🌐 Iniciando servidor en http://localhost:8000" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Yellow

python manage.py runserver

