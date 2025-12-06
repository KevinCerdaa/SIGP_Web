# 🚀 SIGP - Sistema de Identificación de Grupos Pandilleriles

<div align="center">

![SIGP](https://img.shields.io/badge/SIGP-Web-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.0-green?style=for-the-badge&logo=django)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)

**Sistema web completo para la gestión, consulta y visualización de información sobre grupos pandilleriles en San Luis Potosí**

[Inicio Rápido](#-inicio-rápido) • [Instalación Completa](#-instalación-completa) • [Errores Comunes](#-errores-comunes) • [Documentación](#-documentación)

</div>

---

## 📖 Acerca del Proyecto

**SIGP** es una plataforma web integral diseñada para facilitar la identificación, registro y consulta de información relacionada con grupos pandilleriles. El sistema permite a los usuarios (administradores, consultores y ciudadanos) acceder a datos estructurados mediante una interfaz moderna y responsiva, mapas interactivos y reportes detallados.

### 🎯 Objetivos Principales

- ✅ **Registro y Gestión**: Crear, editar y eliminar información de pandillas e integrantes
- ✅ **Consultas Avanzadas**: Búsqueda y filtrado por múltiples criterios (zona, peligrosidad, delitos, etc.)
- ✅ **Visualización Geográfica**: Mapas interactivos con Google Maps mostrando ubicaciones y zonas de riesgo
- ✅ **Reportes PDF**: Generación de informes detallados y descargables
- ✅ **Bot de Telegram**: Consultas rápidas mediante un bot integrado
- ✅ **Control de Acceso**: Sistema de roles con permisos diferenciados

---

## ✨ Características

### 🔐 Seguridad y Autenticación
- Autenticación segura con tokens JWT
- Sistema de roles (Administrador, Consultor, Ciudadano)
- Hash de contraseñas con PBKDF2
- Sesiones con expiración automática
- CORS configurado para desarrollo

### 📊 Gestión de Datos
- Registro completo de pandillas con información detallada
- Gestión de integrantes con múltiples imágenes
- Asociación de delitos y faltas
- Registro de eventos (riñas, delitos, faltas)
- Catálogos de delitos, faltas y zonas

### 🗺️ Visualización
- Mapas interactivos con Google Maps API
- Marcadores por zona y nivel de peligrosidad
- Mapas de calor (heatmaps)
- InfoWindows con información detallada según rol
- Tema oscuro personalizado para mapas

### 📄 Reportes y Consultas
- Consultas avanzadas con múltiples filtros
- Búsqueda por nombre, alias, pandilla, zona, peligrosidad
- Generación de PDFs con formato profesional
- Resaltado de texto en resultados de búsqueda
- Exportación de datos estructurados

### 🤖 Integración con Telegram
- Bot de Telegram para consultas rápidas
- Comandos intuitivos y fáciles de usar
- Autenticación mediante correo y contraseña
- Consultas de pandillas, integrantes y eventos

---

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework CSS utility-first
- **JavaScript (ES6+)** - Lógica del cliente
- **Google Maps API** - Visualización geográfica
- **jsPDF & jsPDF-AutoTable** - Generación de PDFs

### Backend
- **Python 3.8+** - Lenguaje de programación
- **Django 5.0** - Framework web
- **Django REST Framework** - API REST
- **PyMySQL** - Conector MySQL

### Base de Datos
- **MySQL 8.0** - Sistema de gestión de base de datos
- **XAMPP** - Entorno de desarrollo local

### Integraciones
- **Google Maps API** - Mapas y geolocalización
- **Telegram Bot API** - Bot de consultas
- **SMTP** - Envío de correos electrónicos

---

## 🚀 Inicio Rápido

### ⚡ Instalación Express (5 minutos)

```powershell
# 1. Instalar XAMPP → Iniciar MySQL
# 2. Crear base de datos "pandillas" en phpMyAdmin e importar pandillas.sql
# 3. Instalar Python 3.13+ (marcar "Add to PATH")
# 4. Navegar a la carpeta del proyecto
cd SIGP_Web\backend_django

# 5. Ejecutar script automático (hace todo por ti)
.\iniciar_servidor.ps1

# 6. Abrir index.html con Live Server en VS Code/Cursor
# 7. ¡Listo! 🎉
```

> **Nota**: El script `iniciar_servidor.ps1` crea automáticamente el entorno virtual, instala dependencias y verifica MySQL.

### 📋 Prerrequisitos

| Herramienta | Versión | Link de Descarga |
|-------------|---------|------------------|
| XAMPP | Última versión | [Descargar](https://www.apachefriends.org/) |
| Python | 3.13.7 o superior | [Descargar](https://www.python.org/downloads/) ⚠️ Marcar "Add to PATH" |
| VS Code/Cursor | Última versión | [VS Code](https://code.visualstudio.com/) / [Cursor](https://cursor.com/) |
| Live Server | Extensión | Buscar en extensiones del editor |

---

## 📦 Instalación Completa

### 1️⃣ Preparar la Base de Datos

```powershell
# Iniciar MySQL en XAMPP (botón "Start")
# Abrir phpMyAdmin: http://localhost/phpmyadmin
```

1. Click en **"Nueva"** → Crear base de datos
2. Nombre: `pandillas`
3. Intercalación: `utf8mb4_general_ci`
4. Click en **"Crear"**
5. Ir a la pestaña **"Importar"**
6. Seleccionar el archivo `pandillas.sql` (incluido en el proyecto)
7. Click en **"Continuar"**

### 2️⃣ Configurar el Proyecto

```powershell
# Navegar a la carpeta del backend
cd SIGP_Web\backend_django

# Crear archivo .env con las credenciales de MySQL
# Usar el siguiente contenido:
```

**Contenido del archivo `.env`** (crear en `backend_django/.env`):
```env
SECRET_KEY=django-insecure-clave-secreta-para-desarrollo
DEBUG=True
DB_NAME=pandillas
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

> **Nota**: Si tu MySQL tiene contraseña, agrégala en `DB_PASSWORD=tu_contraseña`

### 3️⃣ Iniciar el Servidor

**Opción A: Script Automático (Recomendado)**
```powershell
cd backend_django
.\iniciar_servidor.ps1
```

**Opción B: Manual**
```powershell
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

### 4️⃣ Abrir el Frontend

1. Instalar extensión **Live Server** en VS Code/Cursor
2. Abrir el proyecto en VS Code/Cursor
3. Click derecho en `index.html` → **"Open with Live Server"**
4. Se abrirá automáticamente en `http://localhost:5500`

### 5️⃣ Probar el Sistema

**Usuario de prueba** (si existe en la BD importada):
- **Correo**: `admin@example.com`
- **Contraseña**: `admin123`

**Crear nuevo usuario** (si no existe):
```powershell
python manage.py shell
```
```python
from api.models import Usuario
Usuario.objects.create_user(
    correo='admin@example.com',
    password='admin123',
    nombre='Admin',
    apellido='Usuario',
    user_name='admin',
    rol='admin'
)
exit()
```

---

## ❌ Errores Comunes

<details>
<summary><b>Error: "No module named 'django'"</b></summary>

**Solución**:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
</details>

<details>
<summary><b>Error: "Can't connect to MySQL server"</b></summary>

**Solución**:
- Abrir XAMPP y verificar que MySQL esté corriendo (verde)
- Verificar el puerto en `.env` (por defecto 3306)
- Verificar credenciales en `.env`
</details>

<details>
<summary><b>Error: "Access denied for user 'root'@'localhost'"</b></summary>

**Solución**:
- Verificar `DB_PASSWORD` en `.env`
- Por defecto XAMPP no tiene contraseña (dejar vacío)
</details>

<details>
<summary><b>Error: "Unknown database 'pandillas'"</b></summary>

**Solución**:
- Crear base de datos en phpMyAdmin (ver paso 1)
- Verificar `DB_NAME` en `.env`
</details>

<details>
<summary><b>Error: "Cannot run script because PowerShell execution policy"</b></summary>

**Solución**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
</details>

<details>
<summary><b>Error: "Port 8000 is already in use"</b></summary>

**Solución**:
```powershell
# Cerrar otras instancias del servidor o usar otro puerto
python manage.py runserver 8001
```
</details>

<details>
<summary><b>Error: Frontend no se conecta con el backend</b></summary>

**Solución**:
- Verificar que el servidor esté corriendo en `localhost:8000`
- Abrir consola del navegador (F12) para ver errores
- Usar Live Server (no abrir archivo directamente)
</details>

<details>
<summary><b>Error: "CORS error" en el navegador</b></summary>

**Solución**:
- Ya está configurado `django-cors-headers`
- Verificar que `CORS_ALLOWED_ORIGINS` en `settings.py` incluya tu URL
- Por defecto permite: `http://localhost:5500`
</details>

---

## 🤖 Bot de Telegram (Opcional)

### Configuración

1. **Crear bot con BotFather**
   - Buscar [@BotFather](https://t.me/botfather) en Telegram
   - Enviar `/newbot` y seguir instrucciones
   - Copiar el token proporcionado

2. **Agregar token al .env**
   ```env
   TELEGRAM_BOT_TOKEN=tu_token_del_bot_aqui
   ```

3. **Iniciar el bot**
   ```powershell
   cd backend_django
   .\iniciar_bot.ps1
   ```

### Comandos del Bot

- `/start` - Iniciar el bot
- `/login` - Autenticarse
- `/consultar` - Consultar información
- `/pandillas` - Listar pandillas
- `/help` - Ver ayuda

Más información: [README Bot de Telegram](backend_django/README_BOT_TELEGRAM.md)

---

## 📁 Estructura del Proyecto

```
SIGP_Web/
├── backend_django/          # Backend Django
│   ├── api/                 # Aplicación principal
│   │   ├── models.py        # Modelos de datos
│   │   ├── views.py         # Vistas y endpoints
│   │   └── urls.py          # Rutas de la API
│   ├── telegram_bot/        # Bot de Telegram
│   ├── sigp_backend/        # Configuración Django
│   └── manage.py            # Script de gestión
│
├── frontend/                 # Frontend
│   ├── components/          # Componentes reutilizables
│   ├── javascript/          # Scripts JavaScript
│   ├── pages/               # Páginas HTML
│   └── styles/              # Estilos CSS
│
├── index.html               # Página principal
├── Legacy/                  # Documentación histórica
└── README.md                # Este archivo
```

---

## 📚 Documentación

- 📄 **[INSTALACION_Y_EJECUCION.txt](INSTALACION_Y_EJECUCION.txt)** - ⭐ Guía completa paso a paso (RECOMENDADO)
- 📄 **[Backend README](backend_django/README.md)** - Documentación del backend
- 📄 **[Bot de Telegram](backend_django/README_BOT_TELEGRAM.md)** - Guía del bot de Telegram
- 📄 **[Instalación Legacy](Legacy/INSTALACION_EN_NUEVA_COMPUTADORA.md)** - Guía antigua de instalación
- 📄 **[Documento de Requerimientos](Legacy/documento_de_requerimientos.txt)** - Especificaciones del proyecto

---

## 👥 Roles del Sistema

### 🔴 Administrador
- Acceso total al sistema
- Crear, editar y eliminar registros
- Generar reportes completos
- Gestionar usuarios

### 🟡 Consultor
- Consultar información
- Generar reportes
- Ver datos completos
- Cambiar contraseña

### 🟢 Ciudadano
- Consulta pública limitada
- Visualización de mapas
- Ver información básica de pandillas
- Sin necesidad de registro

---

## 🎨 Características de la Interfaz

- ✨ **Diseño Moderno**: Interfaz limpia y profesional con Tailwind CSS
- 📱 **Responsive**: Adaptable a dispositivos móviles, tablets y desktop
- 🌙 **Tema Oscuro**: Paleta de colores oscura para mejor experiencia visual
- 🔍 **Búsqueda Inteligente**: Resaltado de términos encontrados
- 📊 **Visualizaciones**: Gráficos y mapas interactivos
- ⚡ **Rendimiento**: Carga rápida y navegación fluida

---

## 🔧 Scripts y Comandos Útiles

### Scripts PowerShell

```powershell
# Iniciar servidor Django (automático - recomendado)
cd backend_django
.\iniciar_servidor.ps1

# Iniciar bot de Telegram
cd backend_django
.\iniciar_bot.ps1

# Verificar conexión MySQL
cd backend_django
python verificar_mysql.py
```

### Comandos Django

```powershell
# Ver migraciones pendientes
python manage.py showmigrations

# Crear migraciones después de cambios en models.py
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario de Django
python manage.py createsuperuser

# Verificar estado del sistema
python manage.py check

# Shell interactivo de Django
python manage.py shell

# Acceder al panel de administración
# Abrir: http://localhost:8000/admin/
```

### Respaldo de Base de Datos

```powershell
# Crear respaldo
cd C:\xampp\mysql\bin
.\mysqldump.exe -u root pandillas > C:\backup\pandillas_backup.sql

# Restaurar respaldo
cd C:\xampp\mysql\bin
.\mysql.exe -u root pandillas < C:\backup\pandillas_backup.sql
```

---

## 📝 Notas Importantes

### ⚠️ Desarrollo vs Producción

Este proyecto está configurado para **desarrollo local**. Para **producción**:

- ❌ **NO** usar `DEBUG=True`
- ❌ **NO** usar la `SECRET_KEY` por defecto
- ✅ Cambiar a servidor de producción (Gunicorn + Nginx)
- ✅ Configurar HTTPS
- ✅ Establecer contraseña para MySQL
- ✅ Ajustar `CORS_ALLOWED_ORIGINS` para dominios específicos
- ✅ Configurar respaldos automáticos de la base de datos

### 🔒 Seguridad

- Las contraseñas se hashean automáticamente usando PBKDF2
- Tokens de autenticación para API REST
- Sesiones con expiración de 30 minutos
- CORS configurado para desarrollo (`localhost:5500`)

### 📧 Sistema de Correos

El sistema incluye funcionalidad de correo que requiere configuración SMTP válida en el archivo `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu_correo@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
```

> **Nota para Gmail**: Necesitas generar una [Contraseña de Aplicación](https://myaccount.google.com/apppasswords)

---

## 🤝 Autores

- **Kevin Francisco Cerda Esparza**
- **Eric Yael Hernández Hernández**
- **Fernando Jesús Sánchez Flores**

**Equipo T15D - CNO II Programación Web II**

---

## 🆘 Soporte y Ayuda

### Si tienes problemas:

1. **Revisar errores en PowerShell** (donde corre el servidor)
2. **Revisar consola del navegador** (F12)
3. **Revisar logs de MySQL** (Panel de XAMPP)
4. **Consultar sección** [Errores Comunes](#-errores-comunes)

### Usar el Chatbot de Cursor

Si usas Cursor y tienes problemas, pregunta al chatbot integrado:

```
Revisa el proyecto y ajústalo a la versión de Python que tengo instalada,
revisa dependencias faltantes o errores con el servidor de Python y Telegram.
Instala las dependencias necesarias y ejecuta automáticamente el servidor
en la terminal integrada para solucionar todos los errores posibles.
```

### Archivos de Ayuda

- 📄 **[INSTALACION_Y_EJECUCION.txt](INSTALACION_Y_EJECUCION.txt)** - Guía completa paso a paso
- 📄 **[Backend README](backend_django/README.md)** - Documentación del backend
- 📄 **[Bot README](backend_django/README_BOT_TELEGRAM.md)** - Guía del bot de Telegram

---

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/logout/` - Cerrar sesión
- `GET /api/auth/user/` - Obtener usuario actual

### Usuarios
- `GET /api/usuarios/` - Listar usuarios
- `POST /api/usuarios/` - Crear usuario
- `GET /api/usuarios/{id}/` - Detalle de usuario
- `PUT /api/usuarios/{id}/` - Actualizar usuario
- `DELETE /api/usuarios/{id}/` - Eliminar usuario

### Pandillas
- `GET /api/pandillas/` - Listar pandillas
- `POST /api/pandillas/` - Crear pandilla
- `GET /api/pandillas/{id}/` - Detalle de pandilla
- `PUT /api/pandillas/{id}/` - Actualizar pandilla
- `DELETE /api/pandillas/{id}/` - Eliminar pandilla

### Integrantes
- `GET /api/integrantes/` - Listar integrantes
- `POST /api/integrantes/` - Crear integrante
- `GET /api/integrantes/{id}/` - Detalle de integrante
- `PUT /api/integrantes/{id}/` - Actualizar integrante
- `DELETE /api/integrantes/{id}/` - Eliminar integrante

### Eventos
- `GET /api/eventos/` - Listar eventos
- `POST /api/eventos/` - Crear evento
- `GET /api/eventos/{id}/` - Detalle de evento
- `PUT /api/eventos/{id}/` - Actualizar evento
- `DELETE /api/eventos/{id}/` - Eliminar evento

### Utilidades
- `GET /api/health/` - Estado del servidor

---

## 💻 Tecnologías Utilizadas

### Frontend
```javascript
HTML5, CSS3 (Tailwind CSS), JavaScript ES6+
Google Maps API, jsPDF, jsPDF-AutoTable
```

### Backend
```python
Python 3.13, Django 5.0, Django REST Framework
PyMySQL, python-telegram-bot, python-dotenv
```

### Base de Datos
```sql
MySQL 8.0 (XAMPP)
```

### Herramientas
```
VS Code / Cursor, Live Server
XAMPP, phpMyAdmin
Telegram Bot API
```

---

## 📊 URLs del Proyecto

- **Frontend**: `http://localhost:5500` (Live Server)
- **Backend**: `http://localhost:8000`
- **Admin Django**: `http://localhost:8000/admin/`
- **phpMyAdmin**: `http://localhost/phpmyadmin`
- **API Base**: `http://localhost:8000/api/`

---

## 📄 Licencia

Este proyecto fue desarrollado como parte de un proyecto académico.

---

<div align="center">

### 🎓 Proyecto Académico - CNO II Programación Web II

**Desarrollado con ❤️ y mucho ☕ para la gestión eficiente de información**

---

### 📖 ¿Necesitas más ayuda?

Lee la **[Guía Completa de Instalación](INSTALACION_Y_EJECUCION.txt)** para instrucciones detalladas paso a paso

---

⭐ Si este proyecto te resulta útil, ¡dale una estrella!

**El proyecto corre en:**
- 🖥️ Backend: `http://localhost:8000`
- 🌐 Frontend: `http://localhost:5500`

Para detener el servidor: **Ctrl+C** en PowerShell

</div>
