# 🤖 Bot de Telegram para SIGP

Bot de Telegram que se conecta a la base de datos de Django para consultar información sobre pandillas, integrantes y eventos.

## 📋 Requisitos Previos

1. **Bot de Telegram creado con BotFather**
   - Abre Telegram y busca `@BotFather`
   - Envía `/newbot` y sigue las instrucciones
   - Guarda el **token** que te proporciona BotFather

2. **Base de datos configurada**
   - MySQL debe estar corriendo en XAMPP
   - La base de datos `pandillas` debe existir y tener datos

3. **Entorno virtual activado**
   - El mismo entorno virtual que usa Django

## 🔧 Configuración

### Paso 1: Obtener Token del Bot

1. Abre Telegram y busca `@BotFather`
2. Envía el comando `/newbot`
3. Sigue las instrucciones:
   - Elige un nombre para tu bot (ej: "SIGP Bot")
   - Elige un username (debe terminar en `bot`, ej: `sigp_bot`)
4. BotFather te dará un token que se ve así:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
5. **Copia este token**, lo necesitarás en el siguiente paso

### Paso 2: Agregar Token al Archivo .env

Abre el archivo `backend_django/.env` y agrega la siguiente línea:

```env
TELEGRAM_BOT_TOKEN=tu_token_aqui
```

**Ejemplo:**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Paso 3: Instalar Dependencias

Si aún no has instalado `python-telegram-bot`, ejecuta:

```powershell
cd backend_django
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 🚀 Iniciar el Bot

### Opción 1: Usar el Script (Recomendado)

```powershell
cd backend_django
.\iniciar_bot.ps1
```

### Opción 2: Manualmente

```powershell
cd backend_django
.\venv\Scripts\Activate.ps1
python telegram_bot/bot.py
```

## 📱 Comandos del Bot

Una vez iniciado el bot, puedes interactuar con él en Telegram:

- `/start` - Mensaje de bienvenida y lista de comandos
- `/help` - Mostrar ayuda detallada
- `/pandillas` - Listar todas las pandillas registradas
- `/pandilla <nombre>` - Buscar información de una pandilla específica
  - Ejemplo: `/pandilla Los Zetas`
- `/integrantes <pandilla>` - Listar integrantes de una pandilla
  - Ejemplo: `/integrantes Los Zetas`
- `/eventos` - Ver los últimos 10 eventos registrados

## 🔍 Ejemplos de Uso

1. **Buscar una pandilla:**
   ```
   /pandilla Los Zetas
   ```

2. **Ver integrantes:**
   ```
   /integrantes Los Zetas
   ```

3. **Ver eventos recientes:**
   ```
   /eventos
   ```

## ⚙️ Funcionalidades

El bot se conecta directamente a la base de datos de Django usando los mismos modelos:

- ✅ Consulta de pandillas con información completa
- ✅ Búsqueda de integrantes por pandilla
- ✅ Visualización de eventos recientes
- ✅ Indicadores visuales de peligrosidad (🟢🟡🔴)
- ✅ Formato legible con emojis

## 🛠️ Solución de Problemas

### Error: "TELEGRAM_BOT_TOKEN no encontrado"
- Verifica que el archivo `.env` existe en `backend_django/`
- Verifica que la línea `TELEGRAM_BOT_TOKEN=...` está presente
- Asegúrate de no tener espacios alrededor del `=`

### Error: "No se puede conectar a MySQL"
- Verifica que MySQL esté corriendo en XAMPP
- Verifica las credenciales en el archivo `.env`
- Ejecuta `python verificar_mysql.py` para diagnosticar

### El bot no responde
- Verifica que el bot esté corriendo (debe mostrar "Bot iniciado")
- Verifica que el token sea correcto
- Intenta reiniciar el bot

### Error: "ModuleNotFoundError: No module named 'telegram'"
- Activa el entorno virtual: `.\venv\Scripts\Activate.ps1`
- Instala dependencias: `pip install -r requirements.txt`

## 📝 Notas

- El bot usa la misma base de datos que Django, así que cualquier cambio en la base de datos se reflejará inmediatamente
- El bot está diseñado para consultas de solo lectura (no modifica datos)
- Los mensajes están limitados a 4096 caracteres por las restricciones de Telegram
- El bot se puede ejecutar en paralelo con el servidor Django sin problemas

## 🔐 Seguridad

- **NUNCA** compartas tu token del bot públicamente
- El archivo `.env` está en `.gitignore` y no debe subirse a repositorios
- El bot solo lee datos, no modifica la base de datos

## 🎯 Próximas Mejoras

Posibles funcionalidades futuras:
- Búsqueda avanzada de integrantes
- Estadísticas de pandillas
- Notificaciones de nuevos eventos
- Autenticación de usuarios
- Comandos administrativos

