# 🚀 SIGP - Sistema de Identificación de Grupos Pandilleriles

<div align="center">

![SIGP](https://img.shields.io/badge/SIGP-Web-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.0-green?style=for-the-badge&logo=django)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)

**Sistema web completo para la gestión, consulta y visualización de información sobre grupos pandilleriles en San Luis Potosí**

[Características](#-características) • [Tecnologías](#-tecnologías) • [Inicio Rápido](#-inicio-rápido) • [Documentación](#-documentación)

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

### Prerrequisitos

- Windows 10 o superior
- [XAMPP](https://www.apachefriends.org/) instalado y MySQL activo
- [Python 3.8+](https://www.python.org/downloads/) instalado
- Navegador web moderno (Chrome, Firefox, Edge)

### Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <repository-url>
   cd SIGP_Web
   ```

2. **Configurar la base de datos**
   - Abre XAMPP y asegúrate de que MySQL esté corriendo
   - Crea la base de datos `pandillas` en phpMyAdmin
   - Importa el esquema de la base de datos (si está disponible)

3. **Configurar el backend**
   ```powershell
   cd backend_django
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
   
   Copia `.env.example` a `.env` y configura tus credenciales:
   ```env
   DB_NAME=pandillas
   DB_USER=root
   DB_PASSWORD=
   DB_HOST=localhost
   DB_PORT=3306
   ```

4. **Aplicar migraciones**
   ```powershell
   python manage.py migrate
   ```

5. **Iniciar el servidor**
   ```powershell
   python manage.py runserver
   # O usa el script:
   .\iniciar_servidor.ps1
   ```

6. **Abrir en el navegador**
   - Abre `index.html` en tu navegador
   - O accede a `http://localhost:8000` si configuraste Django para servir archivos estáticos

### Bot de Telegram (Opcional)

1. **Obtener token del bot**
   - Crea un bot con [@BotFather](https://t.me/botfather) en Telegram
   - Guarda el token proporcionado

2. **Configurar el bot**
   ```powershell
   # En backend_django/.env
   TELEGRAM_BOT_TOKEN=tu_token_aqui
   ```

3. **Iniciar el bot**
   ```powershell
   cd backend_django
   .\iniciar_bot.ps1
   ```

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

- **[Backend README](backend_django/README.md)** - Documentación completa del backend
- **[Bot de Telegram](backend_django/README_BOT_TELEGRAM.md)** - Guía del bot de Telegram
- **[Guía de Instalación](Legacy/INSTALACION_EN_NUEVA_COMPUTADORA.md)** - Instalación en nueva computadora
- **[Documento de Requerimientos](Legacy/documento_de_requerimientos.txt)** - Especificaciones del proyecto

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

## 🔧 Scripts Útiles

```powershell
# Iniciar servidor Django
cd backend_django
.\iniciar_servidor.ps1

# Iniciar bot de Telegram
cd backend_django
.\iniciar_bot.ps1

# Verificar conexión MySQL
cd backend_django
python verificar_mysql.py
```

---

## 📝 Notas Importantes

- ⚠️ Este es un proyecto de desarrollo. Para producción, configura adecuadamente las variables de entorno y seguridad
- 🔒 Las contraseñas se hashean automáticamente usando PBKDF2
- 🌐 CORS está configurado para desarrollo local. Ajusta para producción
- 📧 El sistema de correos requiere configuración SMTP válida

---

## 🤝 Contribuidores

- **Kevin Francisco Cerda Esparza**
- **Eric Yael Hernández Hernández**
- **Fernando Jesús Sanches Flores**

**Equipo T15D - CNO II Programación Web II**

---

## 📄 Licencia

Este proyecto fue desarrollado como parte de un proyecto académico.

---

<div align="center">

**Desarrollado con ❤️ para la gestión eficiente de información**

⭐ Si este proyecto te resulta útil, ¡dale una estrella!

</div>
