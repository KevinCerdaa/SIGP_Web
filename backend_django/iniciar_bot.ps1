# Script para iniciar el bot de Telegram
# Ejecuta este script con: .\iniciar_bot.ps1

# Cambiar al directorio del script (backend_django)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Iniciando bot de Telegram..." -ForegroundColor Blue
Write-Host "Directorio de trabajo: $(Get-Location)" -ForegroundColor Gray

# Activar entorno virtual
if (Test-Path "venv\Scripts\Activate.ps1") {
    . venv\Scripts\Activate.ps1
    Write-Host "Entorno virtual activado" -ForegroundColor Green
} else {
    Write-Host "No se encontro el entorno virtual" -ForegroundColor Red
    Write-Host "Ejecuta primero: python -m venv venv" -ForegroundColor Magenta
    exit
}

# Verificar que el token del bot esté configurado
Write-Host "`n>>> Verificando configuracion del bot..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    Write-Host "Error: No se encontro el archivo .env" -ForegroundColor Red
    Write-Host "Crea el archivo .env y agrega TELEGRAM_BOT_TOKEN" -ForegroundColor Yellow
    exit
}

# Verificar que MySQL este corriendo
Write-Host "`n>>> Verificando conexion a MySQL..." -ForegroundColor Blue
$mysqlCheck = python verificar_mysql.py 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "MySQL conectado correctamente" -ForegroundColor Green
} else {
    Write-Host "Advertencia: No se pudo verificar MySQL" -ForegroundColor Yellow
    Write-Host "Asegurate de que MySQL este corriendo en XAMPP" -ForegroundColor Yellow
    Write-Host "Detalles: $mysqlCheck" -ForegroundColor Gray
}

# Iniciar bot
Write-Host "`nIniciando bot de Telegram..." -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener el bot" -ForegroundColor Magenta
Write-Host ""

python telegram_bot/bot.py

