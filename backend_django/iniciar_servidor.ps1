# Script para iniciar el servidor Django y el bot de Telegram
# Ejecuta este script con: .\iniciar_servidor.ps1

# Cambiar al directorio del script (backend_django)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando SIGP - Servidor y Bot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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

# Verificar configuración del bot (opcional)
$botTokenExists = $false
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "TELEGRAM_BOT_TOKEN\s*=") {
        $botTokenExists = $true
        Write-Host "`n>>> Configuracion del bot encontrada" -ForegroundColor Green
    }
}

# Iniciar bot de Telegram en segundo plano (si está configurado)
$botProcess = $null
if ($botTokenExists) {
    Write-Host "`n>>> Iniciando bot de Telegram..." -ForegroundColor Blue
    try {
        # Crear un script temporal para el bot
        $botScript = @"
cd `"$scriptPath`"
. venv\Scripts\Activate.ps1
Write-Host 'Bot de Telegram iniciado' -ForegroundColor Green
python telegram_bot/bot.py
"@
        $botScriptPath = Join-Path $env:TEMP "sigp_bot_script.ps1"
        $botScript | Out-File -FilePath $botScriptPath -Encoding UTF8
        
        # Iniciar el bot en una nueva ventana de PowerShell
        $botProcess = Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "& '$botScriptPath'" -PassThru
        Write-Host "Bot de Telegram iniciado (PID: $($botProcess.Id))" -ForegroundColor Green
        Write-Host "El bot se ejecuta en una ventana separada" -ForegroundColor Gray
        Write-Host "Cierra esa ventana o presiona Ctrl+C en ella para detener el bot" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "Advertencia: No se pudo iniciar el bot: $_" -ForegroundColor Yellow
        Write-Host "Puedes iniciarlo manualmente con: .\iniciar_bot.ps1" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n>>> Bot de Telegram no configurado" -ForegroundColor Yellow
    Write-Host "Para habilitar el bot, agrega TELEGRAM_BOT_TOKEN al archivo .env" -ForegroundColor Gray
}

# Iniciar servidor
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Iniciando servidor en http://localhost:8000" -ForegroundColor Cyan
if ($botTokenExists) {
    Write-Host "Servidor y Bot ejecutandose simultaneamente" -ForegroundColor Green
}
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor (el bot ya está corriendo en su propia ventana)
python manage.py runserver

