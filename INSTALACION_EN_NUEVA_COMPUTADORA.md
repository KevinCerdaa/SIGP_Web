# 📦 Guía de Instalación en Nueva Computadora

Esta guía te ayudará a instalar y configurar el proyecto SIGP en una computadora nueva.

## 📋 Requisitos Previos

Antes de comenzar, necesitas tener:
- Windows 10 o superior
- Acceso a internet para descargar las herramientas necesarias

---

## 🔧 Paso 1: Instalar XAMPP

### 1.1 Descargar XAMPP
1. Ve a [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
2. Descarga la versión para Windows (recomendado: última versión estable)
3. Ejecuta el instalador

### 1.2 Instalar XAMPP
1. Ejecuta el instalador descargado
2. Selecciona los componentes: **Apache** y **MySQL** (mínimo necesario)
3. Elige la carpeta de instalación (por defecto: `C:\xampp`)
4. Completa la instalación

### 1.3 Iniciar MySQL
1. Abre el **Panel de Control de XAMPP**
2. Haz clic en **Start** junto a **MySQL**
3. Debe aparecer "Running" en verde

---

## 💾 Paso 2: Copiar la Base de Datos

### 2.1 Exportar la Base de Datos desde la Computadora Original

**Opción A: Usando phpMyAdmin (Recomendado)**
1. En la computadora original, abre XAMPP y asegúrate de que MySQL esté corriendo
2. Abre tu navegador y ve a `http://localhost/phpmyadmin`
3. En el panel izquierdo, selecciona la base de datos `pandillas`
4. Haz clic en la pestaña **"Exportar"** (Export)
5. Selecciona:
   - Método: **Rápido**
   - Formato: **SQL**
6. Haz clic en **"Continuar"** o **"Ejecutar"**
7. Guarda el archivo `pandillas.sql` en una USB o carpeta compartida

**Opción B: Usando la línea de comandos**
```powershell
# En la computadora original, desde la carpeta de XAMPP
cd C:\xampp\mysql\bin
.\mysqldump.exe -u root -p pandillas > C:\ruta\donde\guardar\pandillas.sql
# (te pedirá la contraseña, si no tiene contraseña presiona Enter)
```

### 2.2 Importar la Base de Datos en la Nueva Computadora

**Opción A: Usando phpMyAdmin (Recomendado)**
1. En la nueva computadora, abre XAMPP y asegúrate de que MySQL esté corriendo
2. Abre tu navegador y ve a `http://localhost/phpmyadmin`
3. Haz clic en **"Nueva"** (New) en el panel izquierdo
4. En "Nombre de la base de datos", escribe: `pandillas`
5. Selecciona **"utf8mb4_general_ci"** como intercalación
6. Haz clic en **"Crear"**
7. Selecciona la base de datos `pandillas` que acabas de crear
8. Haz clic en la pestaña **"Importar"** (Import)
9. Haz clic en **"Elegir archivo"** y selecciona el archivo `pandillas.sql` que copiaste
10. Haz clic en **"Continuar"** o **"Ejecutar"**
11. Espera a que termine la importación (debe mostrar un mensaje de éxito)

**Opción B: Usando la línea de comandos**
```powershell
# En la nueva computadora, desde la carpeta de XAMPP
cd C:\xampp\mysql\bin
.\mysql.exe -u root -p pandillas < C:\ruta\del\archivo\pandillas.sql
# (te pedirá la contraseña, si no tiene contraseña presiona Enter)
```

---

## 🐍 Paso 3: Instalar Python

### 3.1 Descargar Python
1. Ve a [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Descarga la última versión de Python 3.8 o superior (recomendado: Python 3.11 o 3.12)
3. Ejecuta el instalador

### 3.2 Instalar Python
1. **IMPORTANTE**: Marca la casilla **"Add Python to PATH"** durante la instalación
2. Selecciona **"Install Now"** o **"Customize installation"**
3. Si eliges "Customize", asegúrate de marcar todas las opciones recomendadas
4. Completa la instalación

### 3.3 Verificar la Instalación
Abre PowerShell y ejecuta:
```powershell
python --version
```
Debe mostrar algo como: `Python 3.11.x` o similar

---

## 📁 Paso 4: Copiar el Proyecto

### 4.1 Copiar Archivos
1. Copia toda la carpeta del proyecto `SIGP_Web` a la nueva computadora
2. Puedes usar una USB, carpeta compartida, o servicio en la nube
3. Colócala en una ubicación accesible (ejemplo: `C:\Users\TuUsuario\SIGP_Web`)

### 4.2 Estructura de Carpetas
Asegúrate de que la estructura sea:
```
SIGP_Web/
├── backend_django/
│   ├── api/
│   ├── sigp_backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── components/
│   ├── javascript/
│   ├── pages/
│   ├── styles/
│   └── ...
├── index.html
└── ...
```

---

## 🔐 Paso 5: Configurar el Entorno Virtual

### 5.1 Crear el Entorno Virtual
Abre PowerShell en la carpeta del proyecto y ejecuta:
```powershell
cd C:\ruta\a\tu\proyecto\SIGP_Web\backend_django
python -m venv venv
```

### 5.2 Activar el Entorno Virtual
```powershell
.\venv\Scripts\Activate.ps1
```

Si aparece un error de política de ejecución, ejecuta primero:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Después de activar, deberías ver `(venv)` al inicio de la línea de comandos.

### 5.3 Instalar Dependencias
Con el entorno virtual activado, ejecuta:
```powershell
pip install -r requirements.txt
```

Esto instalará todas las dependencias necesarias (Django, Django REST Framework, PyMySQL, etc.)

---

## ⚙️ Paso 6: Configurar Variables de Entorno

### 6.1 Crear Archivo .env
1. En la carpeta `backend_django`, crea un archivo llamado `.env`
2. Abre el archivo con un editor de texto (Notepad, VS Code, etc.)

### 6.2 Agregar Configuración
Copia y pega el siguiente contenido en el archivo `.env`:

```env
SECRET_KEY=django-insecure-cambiar-en-produccion
DEBUG=True
DB_NAME=pandillas
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

**Notas importantes:**
- Si tu MySQL tiene contraseña, cambia `DB_PASSWORD=` por `DB_PASSWORD=tu_contraseña`
- Si cambiaste el puerto de MySQL, ajusta `DB_PORT=3306` al puerto correcto

---

## 🗄️ Paso 7: Aplicar Migraciones de Django

Con el entorno virtual activado, ejecuta:
```powershell
cd backend_django
python manage.py migrate
```

Esto creará las tablas necesarias en la base de datos (si no existen ya).

---

## ✅ Paso 8: Verificar la Instalación

### 8.1 Verificar Conexión a MySQL
Ejecuta:
```powershell
python manage.py check --database default
```

Debe mostrar: `System check identified no issues (0 silenced).`

### 8.2 Iniciar el Servidor
Ejecuta:
```powershell
python manage.py runserver
```

O usa el script proporcionado:
```powershell
.\iniciar_servidor.ps1
```

Deberías ver:
```
Starting development server at http://127.0.0.1:8000/
```

### 8.3 Probar el Frontend
1. Abre tu navegador
2. Ve a `http://localhost:5500` o la URL donde esté sirviendo tu frontend
3. Intenta iniciar sesión con las credenciales que tienes en la base de datos

---

## 🚀 Paso 9: Iniciar el Proyecto (Cada vez que trabajes)

### 9.1 Iniciar MySQL en XAMPP
1. Abre el Panel de Control de XAMPP
2. Haz clic en **Start** junto a **MySQL**

### 9.2 Activar Entorno Virtual e Iniciar Servidor
```powershell
cd C:\ruta\a\tu\proyecto\SIGP_Web\backend_django
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

O simplemente:
```powershell
cd backend_django
.\iniciar_servidor.ps1
```

---

## ❓ Solución de Problemas

### Error: "No se puede conectar a MySQL"
- Verifica que MySQL esté corriendo en XAMPP
- Verifica que el puerto 3306 esté disponible
- Revisa las credenciales en el archivo `.env`

### Error: "ModuleNotFoundError: No module named 'django'"
- Asegúrate de haber activado el entorno virtual
- Ejecuta `pip install -r requirements.txt` nuevamente

### Error: "Access denied for user 'root'@'localhost'"
- Verifica la contraseña en el archivo `.env`
- Si MySQL no tiene contraseña, deja `DB_PASSWORD=` vacío

### Error: "Unknown database 'pandillas'"
- Asegúrate de haber importado la base de datos correctamente
- Verifica que el nombre de la base de datos en `.env` sea correcto

### El frontend no se conecta al backend
- Verifica que el servidor Django esté corriendo en `http://localhost:8000`
- Revisa la consola del navegador para ver errores de CORS
- Asegúrate de que el frontend esté sirviendo desde un servidor (no solo abriendo el archivo HTML)

---

## 📝 Resumen Rápido

1. ✅ Instalar XAMPP y iniciar MySQL
2. ✅ Exportar base de datos de la computadora original
3. ✅ Importar base de datos en la nueva computadora
4. ✅ Instalar Python (con PATH)
5. ✅ Copiar proyecto a la nueva computadora
6. ✅ Crear entorno virtual: `python -m venv venv`
7. ✅ Activar entorno: `.\venv\Scripts\Activate.ps1`
8. ✅ Instalar dependencias: `pip install -r requirements.txt`
9. ✅ Crear archivo `.env` con la configuración
10. ✅ Aplicar migraciones: `python manage.py migrate`
11. ✅ Iniciar servidor: `python manage.py runserver`

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema que no está en esta guía, revisa:
- Los logs del servidor Django
- La consola del navegador (F12)
- Los logs de MySQL en XAMPP

¡Listo! Tu proyecto debería estar funcionando en la nueva computadora. 🎉

