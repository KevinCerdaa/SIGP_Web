#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para verificar la conexión a MySQL
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigp_backend.settings')
django.setup()

from django.db import connection
from django.conf import settings

# Mostrar información de configuración
db_config = settings.DATABASES['default']
print(f"Intentando conectar a MySQL...")
print(f"  Host: {db_config['HOST']}")
print(f"  Puerto: {db_config['PORT']}")
print(f"  Base de datos: {db_config['NAME']}")
print(f"  Usuario: {db_config['USER']}")

try:
    # Intentar conectar a la base de datos
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        if result:
            print("MySQL conectado correctamente")
            sys.exit(0)
        else:
            print("Error: No se pudo verificar MySQL")
            sys.exit(1)
except Exception as e:
    error_msg = str(e)
    print(f"Error de conexion: {error_msg}")
    
    # Mensajes de ayuda según el tipo de error
    if "Access denied" in error_msg or "1045" in error_msg:
        print("  -> Verifica el usuario y contrasena de MySQL")
    elif "Unknown database" in error_msg or "1049" in error_msg:
        print(f"  -> La base de datos '{db_config['NAME']}' no existe")
        print("  -> Crea la base de datos o verifica el nombre en settings.py")
    elif "Can't connect" in error_msg or "2003" in error_msg or "10061" in error_msg:
        print("  -> MySQL no esta corriendo o no esta accesible")
        print("  -> Verifica que XAMPP tenga MySQL iniciado")
    elif "2002" in error_msg:
        print("  -> No se puede conectar al servidor MySQL")
        print("  -> Verifica que MySQL este corriendo en XAMPP")
    
    sys.exit(1)

