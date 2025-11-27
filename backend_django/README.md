# SIGP Backend - Django

Backend del Sistema de Identificación de Grupos Pandilleriles desarrollado con Django y Django REST Framework.

## 🚀 Características

- ✅ Autenticación segura con hash de contraseñas (Django tiene PBKDF2 integrado)
- ✅ Detección automática de roles (admin/consultor)
- ✅ API REST con Django REST Framework
- ✅ CORS configurado para desarrollo
- ✅ Sesiones con expiración de 30 minutos
- ✅ Tokens de autenticación para API
- ✅ Configurado para XAMPP/MySQL

## 📋 Requisitos

- Python 3.8 o superior
- XAMPP con MySQL activo
- Base de datos `pandillas` creada (ver `CREAR_BASE_DATOS_XAMPP.md`)

## 🔧 Instalación Rápida

### 1. Activar entorno virtual

```powershell
cd backend_django
.\venv\Scripts\Activate.ps1
```

### 2. Instalar dependencias (si no están instaladas)

```powershell
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia `env.example` a `.env` y configura tus credenciales de XAMPP:

```env
SECRET_KEY=django-insecure-cambiar-en-produccion
DEBUG=True
DB_NAME=pandillas
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

### 4. Asegúrate de que MySQL esté corriendo en XAMPP

- Abre el Panel de Control de XAMPP
- Inicia MySQL (debe mostrar "Running")

### 5. Aplicar migraciones

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear un usuario de prueba

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
```

### 7. Ejecutar el servidor

```powershell
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## 📡 Endpoints de la API

### Autenticación

- `POST /api/auth/login/` - Iniciar sesión
  - Body: `{"correo": "email@example.com", "password": "contraseña"}`
  - Retorna: token, datos del usuario y rol detectado automáticamente

- `POST /api/auth/logout/` - Cerrar sesión (requiere autenticación)
- `GET /api/auth/user/` - Obtener información del usuario actual (requiere autenticación)

### Otros

- `GET /api/health/` - Verificar estado del servidor

## 🔐 Seguridad

- Las contraseñas se hashean automáticamente usando el sistema de Django (PBKDF2)
- Tokens de autenticación para API REST
- Sesiones con expiración de 30 minutos de inactividad
- CORS configurado para desarrollo (ajustar en producción)

## 📁 Estructura del Proyecto

```
backend_django/
├── manage.py
├── requirements.txt
├── .env.example
├── sigp_backend/
│   ├── settings.py      # Configuración del proyecto
│   ├── urls.py          # URLs principales
│   └── __init__.py      # Configuración PyMySQL
└── api/
    ├── models.py        # Modelo Usuario personalizado
    ├── views.py         # Vistas de la API
    ├── serializers.py   # Serializers para REST
    ├── urls.py          # URLs de la API
    └── admin.py         # Configuración del admin
```

## 🎯 Detección Automática de Roles

El sistema detecta automáticamente el rol del usuario al iniciar sesión:
- Si el usuario tiene `rol='admin'` → retorna `"rol": "admin"`
- Si el usuario tiene `rol='consultor'` → retorna `"rol": "consultor"`

No necesitas especificar el rol manualmente, el sistema lo obtiene de la base de datos.

## 📝 Notas

- El modelo `Usuario` extiende `AbstractBaseUser` de Django para usar el correo como campo de autenticación
- Los roles disponibles son: 'admin' y 'consultor'
- La base de datos debe estar creada previamente usando el archivo `../backend/database.sql`

