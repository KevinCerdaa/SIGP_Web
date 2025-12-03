from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import login
from django.utils import timezone
from .serializers import LoginSerializer, UsuarioSerializer, DireccionSerializer, PandillaSerializer
from .models import Direccion, Pandilla
from django.db import connection
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.template.loader import render_to_string
import uuid


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint para iniciar sesión.
    Detecta automáticamente el rol del usuario (admin o consultor).
    """
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Crear o obtener token de autenticación
        token, created = Token.objects.get_or_create(user=user)
        
        # Iniciar sesión en Django (para sesiones)
        login(request, user)
        
        # Serializar datos del usuario
        user_serializer = UsuarioSerializer(user)
        
        return Response({
            'success': True,
            'message': 'Login exitoso',
            'token': token.key,
            'user': user_serializer.data,
            'rol': user.rol,  # Rol detectado automáticamente
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': serializer.errors.get('non_field_errors', ['Error al procesar el login'])[0],
        'errors': serializer.errors
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Endpoint para cerrar sesión.
    """
    try:
        # Eliminar token de autenticación
        request.user.auth_token.delete()
    except:
        pass
    
    # Cerrar sesión en Django
    from django.contrib.auth import logout
    logout(request)
    
    return Response({
        'success': True,
        'message': 'Sesión cerrada exitosamente'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info_view(request):
    """
    Endpoint para obtener información del usuario actual.
    """
    serializer = UsuarioSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data,
        'rol': request.user.rol
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """
    Endpoint para actualizar el nombre y apellido del usuario.
    """
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    
    if not nombre or not apellido:
        return Response({
            'success': False,
            'message': 'El nombre y apellido son requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = request.user
        user.nombre = nombre
        user.apellido = apellido
        user.save()
        
        serializer = UsuarioSerializer(user)
        return Response({
            'success': True,
            'message': 'Perfil actualizado exitosamente',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar el perfil: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Endpoint para cambiar la contraseña del usuario.
    Requiere la contraseña actual para verificación.
    """
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({
            'success': False,
            'message': 'La contraseña actual y la nueva contraseña son requeridas'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 6:
        return Response({
            'success': False,
            'message': 'La nueva contraseña debe tener al menos 6 caracteres'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = request.user
        
        # Verificar que la contraseña actual sea correcta
        if not user.check_password(current_password):
            return Response({
                'success': False,
                'message': 'La contraseña actual es incorrecta'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Cambiar la contraseña
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Contraseña actualizada exitosamente'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al cambiar la contraseña: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint para verificar el estado del servidor.
    """
    from django.db import connection
    
    db_status = False
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = True
    except:
        pass
    
    return Response({
        'status': 'OK',
        'message': 'SIGP API está funcionando',
        'database': 'Conectado' if db_status else 'Desconectado',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_zones(request):
    """
    Endpoint para obtener todas las zonas.
    """
    from django.db import connection
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_zona, nombre FROM zonas ORDER BY nombre")
            zones = []
            for row in cursor.fetchall():
                zones.append({
                    'id': row[0],
                    'nombre': row[1]
                })
            return Response(zones, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_crimes(request):
    """
    Endpoint para obtener todos los delitos.
    """
    from django.db import connection
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_delito, nombre FROM delitos ORDER BY nombre")
            crimes = []
            for row in cursor.fetchall():
                crimes.append({
                    'id': row[0],
                    'nombre': row[1]
                })
            return Response(crimes, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_user(request):
    """
    Endpoint para registrar un nuevo usuario.
    Solo disponible para administradores.
    """
    # Verificar que el usuario sea administrador
    if request.user.rol != 'admin':
        return Response({
            'success': False,
            'message': 'No tienes permisos para registrar usuarios'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener datos del request
    nombre = request.data.get('nombre')
    apellido = request.data.get('apellido')
    correo = request.data.get('correo')
    password = request.data.get('password')
    rol = request.data.get('rol')
    genero = request.data.get('genero', 'X')  # Por defecto 'X' si no se proporciona
    user_name = request.data.get('user_name', correo.split('@')[0] if correo else '')
    
    # Validar campos requeridos
    if not all([nombre, apellido, correo, password, rol]):
        return Response({
            'success': False,
            'message': 'Todos los campos son requeridos',
            'errors': {
                'nombre': 'Requerido' if not nombre else None,
                'apellido': 'Requerido' if not apellido else None,
                'correo': 'Requerido' if not correo else None,
                'password': 'Requerido' if not password else None,
                'rol': 'Requerido' if not rol else None
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar que el rol sea válido
    if rol not in ['admin', 'consultor']:
        return Response({
            'success': False,
            'message': 'El rol debe ser "admin" o "consultor"'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar que el correo no exista
    from .models import Usuario
    if Usuario.objects.filter(correo=correo).exists():
        return Response({
            'success': False,
            'message': 'El correo electrónico ya está registrado'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validar que el género sea válido
        if genero not in ['M', 'F', 'X']:
            genero = 'X'  # Si no es válido, usar el valor por defecto
        
        # Crear el usuario
        user = Usuario.objects.create_user(
            correo=correo,
            password=password,
            nombre=nombre,
            apellido=apellido,
            user_name=user_name,
            rol=rol,
            genero=genero
        )
        
        # Serializar datos del usuario creado
        user_serializer = UsuarioSerializer(user)
        
        return Response({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al registrar usuario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_addresses(request):
    """
    Endpoint para obtener todas las direcciones con pandillas.
    Devuelve las pandillas con sus direcciones para mostrar en el mapa.
    """
    from django.db import connection
    
    try:
        with connection.cursor() as cursor:
            # Obtener todas las pandillas con sus direcciones
            # Usar LEFT JOIN para incluir pandillas aunque no tengan dirección asignada
            cursor.execute("""
                SELECT 
                    P.id_pandilla AS id,
                    P.nombre AS nombre_pandilla,
                    P.peligrosidad AS grado_peligro,
                    P.id_zona,
                    D.latitud, 
                    D.longitud, 
                    D.calle, 
                    D.numero,
                    D.colonia,
                    D.id_direccion
                FROM 
                    pandillas P
                LEFT JOIN 
                    direcciones D ON P.id_direccion = D.id_direccion
                WHERE 
                    D.latitud IS NOT NULL 
                    AND D.longitud IS NOT NULL
                    AND P.id_zona IS NOT NULL
                ORDER BY P.id_pandilla DESC
            """)
            
            locations = []
            for row in cursor.fetchall():
                # Verificar que tenga coordenadas válidas
                if row[4] and row[5]:  # latitud y longitud
                    try:
                        lat = float(row[4])
                        lng = float(row[5])
                        
                        print(f"Procesando pandilla {row[0]} ({row[1]}): lat={lat}, lng={lng}")
                        
                        # Validar que las coordenadas estén en un rango razonable para San Luis Potosí
                        # Ajustado para incluir coordenadas más amplias del área metropolitana
                        if 22.0 <= lat <= 22.5 and -101.5 <= lng <= -100.0:
                            locations.append({
                                'id': row[0],
                                'nombre_pandilla': row[1] or 'Sin nombre',
                                'grado_peligro': row[2] if row[2] is not None else 0,
                                'lat': lat,
                                'lng': lng,
                                'calle': row[6] or '',
                                'numero': row[7] or '',
                                'colonia': row[8] or '',
                                'id_zona': row[3] if row[3] else None
                            })
                            print(f"  ✅ Pandilla {row[0]} agregada a locations")
                        else:
                            print(f"  ⚠️ Pandilla {row[0]} fuera del rango válido (lat: 22.0-22.5, lng: -101.5 a -100.0)")
                    except (ValueError, TypeError) as e:
                        print(f"❌ Error al procesar coordenadas para pandilla {row[0]}: {e}")
                        continue
                else:
                    print(f"⚠️ Pandilla {row[0]} no tiene coordenadas válidas")
            
            print(f"Total de pandillas encontradas con coordenadas: {len(locations)}")
            return Response(locations, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en get_addresses: {error_trace}")
        return Response({
            'error': str(e),
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_direccion(request):
    """
    Endpoint para crear una nueva dirección.
    Solo disponible para usuarios autenticados.
    """
    serializer = DireccionSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            direccion = serializer.save()
            return Response({
                'success': True,
                'message': 'Dirección creada exitosamente',
                'direccion': DireccionSerializer(direccion).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error al crear la dirección: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'message': 'Error de validación',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_direcciones(request):
    """
    Endpoint para obtener todas las direcciones.
    Solo disponible para usuarios autenticados.
    """
    try:
        direcciones = Direccion.objects.all()
        serializer = DireccionSerializer(direcciones, many=True)
        return Response({
            'success': True,
            'direcciones': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener direcciones: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pandilla(request):
    """
    Endpoint para crear una nueva pandilla.
    Solo disponible para usuarios autenticados.
    """
    try:
        # Obtener datos del request
        nombre = request.data.get('nombre')
        descripcion = request.data.get('descripcion', '')
        lider = request.data.get('lider', '')
        numero_integrantes = request.data.get('numero_integrantes')
        edades_promedio = request.data.get('edades_aproximadas')  # Frontend envía 'edades_aproximadas', pero BD tiene 'edades_promedio'
        # Convertir a float si viene como string
        if edades_promedio:
            try:
                edades_promedio = float(edades_promedio)
            except (ValueError, TypeError):
                edades_promedio = None
        horario_reunion = request.data.get('horario_reunion', '')
        peligrosidad = request.data.get('peligrosidad')
        id_zona = request.data.get('id_zona')
        id_direccion = request.data.get('id_direccion')
        
        # Obtener relaciones
        delitos = request.data.get('delitos', [])
        faltas = request.data.get('faltas', [])
        rivalidades = request.data.get('rivalidades', [])
        redes_sociales = request.data.get('redes_sociales', [])
        
        # Validaciones básicas
        if not nombre:
            return Response({
                'success': False,
                'message': 'El nombre es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not peligrosidad:
            return Response({
                'success': False,
                'message': 'El nivel de peligrosidad es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not id_zona:
            return Response({
                'success': False,
                'message': 'La zona es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear la pandilla usando SQL directo (ya que la tabla existe)
        with connection.cursor() as cursor:
            # Primero, obtener las columnas que existen en la tabla
            cursor.execute("SHOW COLUMNS FROM pandillas")
            columnas_existentes = [row[0] for row in cursor.fetchall()]
            
            # Construir el INSERT dinámicamente solo con las columnas que existen
            columnas = []
            valores = []
            placeholders = []
            
            # Campos básicos que siempre deben existir
            if 'nombre' in columnas_existentes:
                columnas.append('nombre')
                valores.append(nombre)
                placeholders.append('%s')
            
            if 'descripcion' in columnas_existentes:
                columnas.append('descripcion')
                valores.append(descripcion if descripcion else None)
                placeholders.append('%s')
            
            if 'lider' in columnas_existentes:
                columnas.append('lider')
                valores.append(lider if lider else None)
                placeholders.append('%s')
            
            if 'numero_integrantes' in columnas_existentes:
                columnas.append('numero_integrantes')
                valores.append(numero_integrantes if numero_integrantes else None)
                placeholders.append('%s')
            
            # Intentar con diferentes nombres posibles para edades
            if 'edades_promedio' in columnas_existentes:
                columnas.append('edades_promedio')
                valores.append(edades_promedio)  # Ya viene como entero o None
                placeholders.append('%s')
            elif 'edades_aproximadas' in columnas_existentes:
                columnas.append('edades_aproximadas')
                valores.append(edades_promedio)
                placeholders.append('%s')
            elif 'edades' in columnas_existentes:
                columnas.append('edades')
                valores.append(edades_promedio)
                placeholders.append('%s')
            
            if 'horario_reunion' in columnas_existentes:
                columnas.append('horario_reunion')
                valores.append(horario_reunion if horario_reunion else None)
                placeholders.append('%s')
            elif 'horario' in columnas_existentes:
                columnas.append('horario')
                valores.append(horario_reunion if horario_reunion else None)
                placeholders.append('%s')
            
            if 'peligrosidad' in columnas_existentes:
                columnas.append('peligrosidad')
                valores.append(peligrosidad)
                placeholders.append('%s')
            
            if 'id_zona' in columnas_existentes:
                columnas.append('id_zona')
                valores.append(id_zona)
                placeholders.append('%s')
            
            if 'id_direccion' in columnas_existentes:
                columnas.append('id_direccion')
                valores.append(id_direccion if id_direccion else None)
                placeholders.append('%s')
            
            # Construir y ejecutar el INSERT
            if not columnas:
                return Response({
                    'success': False,
                    'message': 'No se encontraron columnas válidas en la tabla pandillas'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            sql = f"INSERT INTO pandillas ({', '.join(columnas)}) VALUES ({', '.join(placeholders)})"
            cursor.execute(sql, valores)
            
            id_pandilla = cursor.lastrowid
            
            # Insertar relaciones con delitos (solo si la tabla existe y hay delitos)
            if delitos:
                try:
                    # Verificar si la tabla existe
                    cursor.execute("SHOW TABLES LIKE 'pandillas_delitos'")
                    if cursor.fetchone():
                        for delito_id in delitos:
                            try:
                                cursor.execute("""
                                    INSERT INTO pandillas_delitos (id_pandilla, id_delito)
                                    VALUES (%s, %s)
                                    ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                                """, [id_pandilla, delito_id])
                            except Exception as e:
                                print(f"Error al insertar delito {delito_id}: {str(e)}")
                                continue
                except Exception as e:
                    print(f"Tabla pandillas_delitos no disponible: {str(e)}")
            
            # Insertar relaciones con faltas (solo si la tabla existe y hay faltas)
            if faltas:
                try:
                    cursor.execute("SHOW TABLES LIKE 'pandillas_faltas'")
                    if cursor.fetchone():
                        for falta_id in faltas:
                            try:
                                cursor.execute("""
                                    INSERT INTO pandillas_faltas (id_pandilla, id_falta)
                                    VALUES (%s, %s)
                                    ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                                """, [id_pandilla, falta_id])
                            except Exception as e:
                                print(f"Error al insertar falta {falta_id}: {str(e)}")
                                continue
                except Exception as e:
                    print(f"Tabla pandillas_faltas no disponible: {str(e)}")
            
            # Insertar rivalidades (solo si la tabla existe y hay rivalidades)
            if rivalidades:
                try:
                    cursor.execute("SHOW TABLES LIKE 'rivalidades'")
                    if cursor.fetchone():
                        for rival_id in rivalidades:
                            try:
                                cursor.execute("""
                                    INSERT INTO rivalidades (id_pandilla, id_pandilla_rival)
                                    VALUES (%s, %s)
                                    ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                                """, [id_pandilla, rival_id])
                            except Exception as e:
                                print(f"Error al insertar rivalidad {rival_id}: {str(e)}")
                                continue
                except Exception as e:
                    print(f"Tabla rivalidades no disponible: {str(e)}")
            
            # Insertar redes sociales (solo si la tabla existe y hay redes)
            if redes_sociales:
                try:
                    cursor.execute("SHOW TABLES LIKE 'redes_pandillas'")
                    if cursor.fetchone():
                        for red_id in redes_sociales:
                            try:
                                cursor.execute("""
                                    INSERT INTO redes_pandillas (id_pandilla, id_red_social)
                                    VALUES (%s, %s)
                                    ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                                """, [id_pandilla, red_id])
                            except Exception as e:
                                print(f"Error al insertar red social {red_id}: {str(e)}")
                                continue
                except Exception as e:
                    print(f"Tabla redes_pandillas no disponible: {str(e)}")
        
        # Obtener la pandilla creada
        pandilla = Pandilla.objects.get(id_pandilla=id_pandilla)
        serializer = PandillaSerializer(pandilla)
        
        return Response({
            'success': True,
            'message': 'Pandilla creada exitosamente',
            'pandilla': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al crear la pandilla: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_pandillas(request):
    """
    Endpoint para obtener todas las pandillas.
    Solo disponible para usuarios autenticados.
    """
    try:
        pandillas = Pandilla.objects.all()
        serializer = PandillaSerializer(pandillas, many=True)
        return Response({
            'success': True,
            'pandillas': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener pandillas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def create_integrante(request):
    """
    Endpoint para crear un nuevo integrante con múltiples imágenes.
    Solo disponible para usuarios autenticados.
    """
    try:
        # Obtener datos del request (puede venir como FormData)
        # Intentar obtener de request.data primero, luego de request.POST
        nombre = request.data.get('nombre') or request.POST.get('nombre')
        apellido_paterno = request.data.get('apellido_paterno') or request.POST.get('apellido_paterno', '')
        apellido_materno = request.data.get('apellido_materno') or request.POST.get('apellido_materno', '')
        alias = request.data.get('alias') or request.POST.get('alias', '')
        fecha_nacimiento = request.data.get('fecha_nacimiento') or request.POST.get('fecha_nacimiento', '')
        id_pandilla = request.data.get('id_pandilla') or request.POST.get('id_pandilla')
        id_direccion = request.data.get('id_direccion') or request.POST.get('id_direccion')
        
        # Obtener imágenes (pueden venir múltiples con el mismo nombre 'imagenes')
        imagenes = request.FILES.getlist('imagenes') if hasattr(request, 'FILES') and request.FILES else []
        
        # Validaciones básicas
        if not nombre:
            return Response({
                'success': False,
                'message': 'El nombre es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not id_pandilla:
            return Response({
                'success': False,
                'message': 'La pandilla es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el integrante usando SQL directo
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'integrantes'")
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La tabla de integrantes no existe en la base de datos'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Obtener las columnas que existen en la tabla
            cursor.execute("SHOW COLUMNS FROM integrantes")
            columnas_existentes = [row[0] for row in cursor.fetchall()]
            
            # Construir el INSERT dinámicamente
            columnas = []
            valores = []
            placeholders = []
            
            if 'nombre' in columnas_existentes:
                columnas.append('nombre')
                valores.append(nombre)
                placeholders.append('%s')
            
            if 'apellido_paterno' in columnas_existentes:
                columnas.append('apellido_paterno')
                valores.append(apellido_paterno if apellido_paterno else None)
                placeholders.append('%s')
            
            if 'apellido_materno' in columnas_existentes:
                columnas.append('apellido_materno')
                valores.append(apellido_materno if apellido_materno else None)
                placeholders.append('%s')
            
            if 'alias' in columnas_existentes:
                columnas.append('alias')
                valores.append(alias if alias else None)
                placeholders.append('%s')
            
            if 'fecha_nacimiento' in columnas_existentes:
                columnas.append('fecha_nacimiento')
                valores.append(fecha_nacimiento if fecha_nacimiento else None)
                placeholders.append('%s')
            
            if 'id_pandilla' in columnas_existentes:
                columnas.append('id_pandilla')
                valores.append(int(id_pandilla))
                placeholders.append('%s')
            
            if 'id_direccion' in columnas_existentes and id_direccion:
                columnas.append('id_direccion')
                valores.append(int(id_direccion))
                placeholders.append('%s')
            
            # Insertar el integrante
            sql = f"INSERT INTO integrantes ({', '.join(columnas)}) VALUES ({', '.join(placeholders)})"
            cursor.execute(sql, valores)
            
            id_integrante = cursor.lastrowid
            
            # Guardar las imágenes
            imagenes_guardadas = []
            if imagenes:
                # Crear directorio de media si no existe
                media_dir = settings.MEDIA_ROOT / 'integrantes'
                media_dir.mkdir(parents=True, exist_ok=True)
                
                for imagen in imagenes:
                    try:
                        # Generar nombre único para la imagen
                        ext = os.path.splitext(imagen.name)[1] or '.jpg'
                        nombre_archivo = f"{uuid.uuid4()}{ext}"
                        ruta_archivo = media_dir / nombre_archivo
                        
                        # Guardar el archivo
                        with open(ruta_archivo, 'wb+') as destino:
                            for chunk in imagen.chunks():
                                destino.write(chunk)
                        
                        # Guardar la ruta relativa en la base de datos
                        url_imagen = f"media/integrantes/{nombre_archivo}"
                        
                        # Insertar en la tabla imagenes_integrantes
                        cursor.execute("""
                            INSERT INTO imagenes_integrantes (id_integrante, url_imagen, descripcion, fecha_subida)
                            VALUES (%s, %s, %s, NOW())
                        """, [id_integrante, url_imagen, None])
                        
                        imagenes_guardadas.append(url_imagen)
                    except Exception as e:
                        print(f"Error al guardar imagen {imagen.name}: {str(e)}")
                        import traceback
                        traceback.print_exc()
                        continue
            
            return Response({
                'success': True,
                'message': 'Integrante creado correctamente',
                'id_integrante': id_integrante,
                'imagenes_guardadas': len(imagenes_guardadas)
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en create_integrante: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al crear el integrante: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_evento(request):
    """
    Endpoint para crear un nuevo evento.
    Solo disponible para usuarios autenticados.
    """
    try:
        # Obtener datos del request
        tipo = request.data.get('tipo')
        fecha = request.data.get('fecha')
        hora = request.data.get('hora')
        descripcion = request.data.get('descripcion', '')
        id_delito = request.data.get('id_delito')
        id_falta = request.data.get('id_falta')
        id_integrante = request.data.get('id_integrante')
        id_pandilla = request.data.get('id_pandilla')
        id_direccion = request.data.get('id_direccion')
        
        # Validaciones básicas
        if not tipo:
            return Response({
                'success': False,
                'message': 'El tipo de evento es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not fecha:
            return Response({
                'success': False,
                'message': 'La fecha es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que el tipo sea válido
        if tipo not in ['riña', 'delito', 'falta']:
            return Response({
                'success': False,
                'message': 'El tipo de evento debe ser: riña, delito o falta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el evento usando SQL directo
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'eventos'")
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La tabla de eventos no existe en la base de datos'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Obtener las columnas que existen en la tabla
            cursor.execute("SHOW COLUMNS FROM eventos")
            columnas_existentes = [row[0] for row in cursor.fetchall()]
            
            # Construir el INSERT dinámicamente
            columnas = []
            valores = []
            placeholders = []
            
            if 'tipo' in columnas_existentes:
                columnas.append('tipo')
                valores.append(tipo)
                placeholders.append('%s')
            
            if 'fecha' in columnas_existentes:
                columnas.append('fecha')
                valores.append(fecha)
                placeholders.append('%s')
            
            if 'hora' in columnas_existentes and hora:
                columnas.append('hora')
                valores.append(hora)
                placeholders.append('%s')
            
            if 'descripcion' in columnas_existentes:
                columnas.append('descripcion')
                valores.append(descripcion if descripcion else None)
                placeholders.append('%s')
            
            if 'id_delito' in columnas_existentes and id_delito:
                columnas.append('id_delito')
                valores.append(int(id_delito))
                placeholders.append('%s')
            
            if 'id_falta' in columnas_existentes and id_falta:
                columnas.append('id_falta')
                valores.append(int(id_falta))
                placeholders.append('%s')
            
            if 'id_integrante' in columnas_existentes and id_integrante:
                columnas.append('id_integrante')
                valores.append(int(id_integrante))
                placeholders.append('%s')
            
            if 'id_pandilla' in columnas_existentes and id_pandilla:
                columnas.append('id_pandilla')
                valores.append(int(id_pandilla))
                placeholders.append('%s')
            
            if 'id_direccion' in columnas_existentes and id_direccion:
                columnas.append('id_direccion')
                valores.append(int(id_direccion))
                placeholders.append('%s')
            
            # Si existe id_zona en la tabla, obtenerlo de la pandilla
            if 'id_zona' in columnas_existentes:
                id_zona = None
                if id_pandilla:
                    # Obtener id_zona de la pandilla
                    cursor.execute("SELECT id_zona FROM pandillas WHERE id_pandilla = %s", [int(id_pandilla)])
                    result = cursor.fetchone()
                    if result and result[0]:
                        id_zona = result[0]
                
                # Si no se encontró zona de la pandilla, intentar obtenerla de la dirección
                if not id_zona and id_direccion:
                    # Las direcciones no tienen zona directamente, pero podemos intentar obtenerla de la pandilla asociada
                    # Por ahora, si no hay pandilla, dejamos id_zona como None si es nullable
                    pass
                
                # Solo agregar id_zona si tiene valor o si la columna permite NULL
                if id_zona:
                    columnas.append('id_zona')
                    valores.append(int(id_zona))
                    placeholders.append('%s')
                else:
                    # Verificar si la columna permite NULL
                    cursor.execute("""
                        SELECT IS_NULLABLE 
                        FROM information_schema.COLUMNS 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'eventos' 
                        AND COLUMN_NAME = 'id_zona'
                    """)
                    result = cursor.fetchone()
                    if result and result[0] == 'YES':
                        # La columna permite NULL, no la agregamos
                        pass
                    else:
                        # La columna NO permite NULL, necesitamos un valor por defecto o obtenerlo de otra forma
                        # Intentar obtener una zona por defecto (por ejemplo, la primera zona)
                        cursor.execute("SELECT id_zona FROM zonas LIMIT 1")
                        result = cursor.fetchone()
                        if result and result[0]:
                            columnas.append('id_zona')
                            valores.append(int(result[0]))
                            placeholders.append('%s')
            
            # Insertar el evento
            sql = f"INSERT INTO eventos ({', '.join(columnas)}) VALUES ({', '.join(placeholders)})"
            cursor.execute(sql, valores)
            
            id_evento = cursor.lastrowid
            
            # Registrar en tablas de relación según el tipo de evento
            if tipo == 'delito' and id_delito:
                # Registrar delito en integrante o pandilla
                if id_integrante:
                    try:
                        cursor.execute("SHOW TABLES LIKE 'integrantes_delitos'")
                        if cursor.fetchone():
                            cursor.execute("""
                                INSERT INTO integrantes_delitos (id_integrante, id_delito)
                                VALUES (%s, %s)
                                ON DUPLICATE KEY UPDATE id_integrante=id_integrante
                            """, [int(id_integrante), int(id_delito)])
                    except Exception as e:
                        print(f"Error al insertar en integrantes_delitos: {str(e)}")
                
                if id_pandilla:
                    try:
                        cursor.execute("SHOW TABLES LIKE 'pandillas_delitos'")
                        if cursor.fetchone():
                            cursor.execute("""
                                INSERT INTO pandillas_delitos (id_pandilla, id_delito)
                                VALUES (%s, %s)
                                ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                            """, [int(id_pandilla), int(id_delito)])
                    except Exception as e:
                        print(f"Error al insertar en pandillas_delitos: {str(e)}")
            
            elif tipo == 'falta' and id_falta:
                # Registrar falta en integrante o pandilla
                if id_integrante:
                    try:
                        cursor.execute("SHOW TABLES LIKE 'integrantes_faltas'")
                        if cursor.fetchone():
                            cursor.execute("""
                                INSERT INTO integrantes_faltas (id_integrante, id_falta)
                                VALUES (%s, %s)
                                ON DUPLICATE KEY UPDATE id_integrante=id_integrante
                            """, [int(id_integrante), int(id_falta)])
                    except Exception as e:
                        print(f"Error al insertar en integrantes_faltas: {str(e)}")
                
                if id_pandilla:
                    try:
                        cursor.execute("SHOW TABLES LIKE 'pandillas_faltas'")
                        if cursor.fetchone():
                            cursor.execute("""
                                INSERT INTO pandillas_faltas (id_pandilla, id_falta)
                                VALUES (%s, %s)
                                ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                            """, [int(id_pandilla), int(id_falta)])
                    except Exception as e:
                        print(f"Error al insertar en pandillas_faltas: {str(e)}")
            
            # Para riñas, no hay tabla específica de relación, pero el evento ya está registrado
            
            return Response({
                'success': True,
                'message': 'Evento creado correctamente',
                'id_evento': id_evento
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en create_evento: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al crear el evento: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_integrantes(request):
    """
    Endpoint para obtener todos los integrantes.
    Solo disponible para usuarios autenticados.
    """
    try:
        from .models import Integrante
        integrantes = Integrante.objects.all()
        
        # Serializar manualmente ya que no tenemos serializer
        integrantes_data = []
        for integrante in integrantes:
            integrantes_data.append({
                'id_integrante': integrante.id_integrante,
                'nombre': integrante.nombre,
                'apellido_paterno': integrante.apellido_paterno or '',
                'apellido_materno': integrante.apellido_materno or '',
                'alias': integrante.alias or '',
                'fecha_nacimiento': str(integrante.fecha_nacimiento) if integrante.fecha_nacimiento else None,
                'id_pandilla': integrante.id_pandilla.id_pandilla if integrante.id_pandilla else None,
                'id_direccion': integrante.id_direccion.id_direccion if integrante.id_direccion else None
            })
        
        return Response({
            'success': True,
            'integrantes': integrantes_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener integrantes: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_delito(request):
    """
    Endpoint para crear un nuevo delito en el catálogo.
    Solo disponible para usuarios autenticados.
    """
    try:
        nombre = request.data.get('nombre')
        
        if not nombre:
            return Response({
                'success': False,
                'message': 'El nombre es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el delito usando SQL directo
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'delitos'")
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La tabla de delitos no existe en la base de datos'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Verificar si el delito ya existe
            cursor.execute("SELECT id_delito FROM delitos WHERE nombre = %s", [nombre])
            if cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Este delito ya existe en el catálogo'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Insertar el delito
            cursor.execute("INSERT INTO delitos (nombre) VALUES (%s)", [nombre])
            id_delito = cursor.lastrowid
            
            return Response({
                'success': True,
                'message': 'Delito creado correctamente',
                'id_delito': id_delito,
                'nombre': nombre
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en create_delito: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al crear el delito: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_falta(request):
    """
    Endpoint para crear una nueva falta en el catálogo.
    Solo disponible para usuarios autenticados.
    """
    try:
        nombre = request.data.get('nombre')
        
        if not nombre:
            return Response({
                'success': False,
                'message': 'El nombre es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear la falta usando SQL directo
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'faltas'")
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La tabla de faltas no existe en la base de datos'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Verificar si la falta ya existe
            cursor.execute("SELECT id_falta FROM faltas WHERE nombre = %s", [nombre])
            if cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Esta falta ya existe en el catálogo'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Insertar la falta
            cursor.execute("INSERT INTO faltas (nombre) VALUES (%s)", [nombre])
            id_falta = cursor.lastrowid
            
            return Response({
                'success': True,
                'message': 'Falta creada correctamente',
                'id_falta': id_falta,
                'nombre': nombre
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en create_falta: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al crear la falta: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_rivalidad(request):
    """
    Endpoint para crear una nueva rivalidad entre dos pandillas.
    Solo disponible para usuarios autenticados.
    """
    try:
        id_pandilla = request.data.get('id_pandilla')
        id_pandilla_rival = request.data.get('id_pandilla_rival')
        
        if not id_pandilla or not id_pandilla_rival:
            return Response({
                'success': False,
                'message': 'Ambas pandillas son requeridas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convertir a enteros
        try:
            id_pandilla = int(id_pandilla)
            id_pandilla_rival = int(id_pandilla_rival)
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'message': 'Los IDs de pandilla deben ser números válidos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que no sean la misma pandilla
        if id_pandilla == id_pandilla_rival:
            return Response({
                'success': False,
                'message': 'Una pandilla no puede ser rival de sí misma'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear la rivalidad usando SQL directo
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'rivalidades'")
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La tabla de rivalidades no existe en la base de datos'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Verificar que ambas pandillas existen
            cursor.execute("SELECT id_pandilla FROM pandillas WHERE id_pandilla = %s", [id_pandilla])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La primera pandilla no existe'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cursor.execute("SELECT id_pandilla FROM pandillas WHERE id_pandilla = %s", [id_pandilla_rival])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La pandilla rival no existe'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar si la rivalidad ya existe (en cualquier dirección)
            cursor.execute("""
                SELECT id_rivalidad FROM rivalidades 
                WHERE (id_pandilla = %s AND id_pandilla_rival = %s)
                   OR (id_pandilla = %s AND id_pandilla_rival = %s)
            """, [id_pandilla, id_pandilla_rival, id_pandilla_rival, id_pandilla])
            if cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Esta rivalidad ya existe'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Insertar la rivalidad
            cursor.execute("""
                INSERT INTO rivalidades (id_pandilla, id_pandilla_rival)
                VALUES (%s, %s)
            """, [id_pandilla, id_pandilla_rival])
            id_rivalidad = cursor.lastrowid
            
            return Response({
                'success': True,
                'message': 'Rivalidad creada correctamente',
                'id_rivalidad': id_rivalidad,
                'id_pandilla': id_pandilla,
                'id_pandilla_rival': id_pandilla_rival
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en create_rivalidad: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al crear la rivalidad: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_red_social(request):
    """
    Endpoint para crear una nueva red social en el catálogo.
    Solo disponible para usuarios autenticados.
    """
    try:
        plataforma = request.data.get('plataforma')
        handle = request.data.get('handle')
        url = request.data.get('url')
        
        if not plataforma:
            return Response({
                'success': False,
                'message': 'La plataforma es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que al menos uno de handle o url esté presente
        if not handle and not url:
            return Response({
                'success': False,
                'message': 'Debes proporcionar al menos un handle o una URL'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear la red social usando SQL directo
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'redes_sociales'")
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'La tabla de redes sociales no existe en la base de datos'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Insertar la red social
            cursor.execute("""
                INSERT INTO redes_sociales (plataforma, handle, url)
                VALUES (%s, %s, %s)
            """, [plataforma, handle or None, url or None])
            id_red_social = cursor.lastrowid
            
            return Response({
                'success': True,
                'message': 'Red social creada correctamente',
                'id_red_social': id_red_social,
                'plataforma': plataforma,
                'handle': handle,
                'url': url
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en create_red_social: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al crear la red social: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENDPOINTS GET PARA OBTENER REGISTROS INDIVIDUALES ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pandilla(request, id_pandilla):
    """Obtener una pandilla específica por ID"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_pandilla, nombre, descripcion, lider, numero_integrantes, 
                       edades_promedio, horario_reunion, peligrosidad, id_zona, id_direccion
                FROM pandillas WHERE id_pandilla = %s
            """, [id_pandilla])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Pandilla no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            pandilla = {
                'id_pandilla': row[0],
                'nombre': row[1],
                'descripcion': row[2] or '',
                'lider': row[3] or '',
                'numero_integrantes': row[4],
                'edades_promedio': float(row[5]) if row[5] else None,
                'horario_reunion': row[6] or '',
                'peligrosidad': row[7],
                'id_zona': row[8],
                'id_direccion': row[9]
            }
            
            # Obtener delitos asociados
            cursor.execute("SELECT id_delito FROM pandillas_delitos WHERE id_pandilla = %s", [id_pandilla])
            pandilla['delitos'] = [row[0] for row in cursor.fetchall()]
            
            # Obtener faltas asociadas
            cursor.execute("SELECT id_falta FROM pandillas_faltas WHERE id_pandilla = %s", [id_pandilla])
            pandilla['faltas'] = [row[0] for row in cursor.fetchall()]
            
            # Obtener rivalidades
            cursor.execute("SELECT id_pandilla_rival FROM rivalidades WHERE id_pandilla = %s", [id_pandilla])
            pandilla['rivalidades'] = [row[0] for row in cursor.fetchall()]
            
            # Obtener redes sociales
            cursor.execute("SELECT id_red_social FROM redes_pandillas WHERE id_pandilla = %s", [id_pandilla])
            pandilla['redes_sociales'] = [row[0] for row in cursor.fetchall()]
            
            return Response({
                'success': True,
                'pandilla': pandilla
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener la pandilla: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_integrante(request, id_integrante):
    """Obtener un integrante específico por ID"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_integrante, nombre, apellido_paterno, apellido_materno, 
                       alias, fecha_nacimiento, id_pandilla, id_direccion
                FROM integrantes WHERE id_integrante = %s
            """, [id_integrante])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Integrante no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            integrante = {
                'id_integrante': row[0],
                'nombre': row[1],
                'apellido_paterno': row[2] or '',
                'apellido_materno': row[3] or '',
                'alias': row[4] or '',
                'fecha_nacimiento': str(row[5]) if row[5] else None,
                'id_pandilla': row[6],
                'id_direccion': row[7]
            }
            
            # Obtener imágenes
            cursor.execute("SELECT id_imagen, url_imagen, descripcion FROM imagenes_integrantes WHERE id_integrante = %s", [id_integrante])
            integrante['imagenes'] = [{'id_imagen': row[0], 'url_imagen': row[1], 'descripcion': row[2]} for row in cursor.fetchall()]
            
            return Response({
                'success': True,
                'integrante': integrante
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener el integrante: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_evento(request, id_evento):
    """Obtener un evento específico por ID"""
    try:
        with connection.cursor() as cursor:
            # La tabla eventos NO tiene columna 'tipo', se determina por id_delito o id_falta
            cursor.execute("""
                SELECT id_evento, id_delito, id_falta, fecha, hora, descripcion,
                       id_integrante, id_pandilla, id_direccion
                FROM eventos WHERE id_evento = %s
            """, [id_evento])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Evento no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Determinar el tipo basándose en id_delito o id_falta
            tipo_evento = 'riña'  # Por defecto
            if row[1]:  # id_delito
                tipo_evento = 'delito'
            elif row[2]:  # id_falta
                tipo_evento = 'falta'
            
            evento = {
                'id_evento': row[0],
                'tipo': tipo_evento,
                'id_delito': row[1],
                'id_falta': row[2],
                'fecha': str(row[3]) if len(row) > 3 and row[3] else None,
                'hora': str(row[4]) if len(row) > 4 and row[4] else None,
                'descripcion': row[5] or '' if len(row) > 5 else '',
                'id_integrante': row[6] if len(row) > 6 else None,
                'id_pandilla': row[7] if len(row) > 7 else None,
                'id_direccion': row[8] if len(row) > 8 else None
            }
            
            return Response({
                'success': True,
                'evento': evento
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener el evento: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_delito(request, id_delito):
    """Obtener un delito específico por ID"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_delito, nombre FROM delitos WHERE id_delito = %s", [id_delito])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Delito no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'delito': {'id_delito': row[0], 'nombre': row[1]}
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener el delito: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_falta(request, id_falta):
    """Obtener una falta específica por ID"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_falta, nombre FROM faltas WHERE id_falta = %s", [id_falta])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Falta no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'falta': {'id_falta': row[0], 'nombre': row[1]}
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener la falta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_direccion(request, id_direccion):
    """Obtener una dirección específica por ID"""
    try:
        direccion = Direccion.objects.get(id_direccion=id_direccion)
        serializer = DireccionSerializer(direccion)
        return Response({
            'success': True,
            'direccion': serializer.data
        }, status=status.HTTP_200_OK)
    except Direccion.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Dirección no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener la dirección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_rivalidad(request, id_rivalidad):
    """Obtener una rivalidad específica por ID"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_rivalidad, id_pandilla, id_pandilla_rival 
                FROM rivalidades WHERE id_rivalidad = %s
            """, [id_rivalidad])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Rivalidad no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'rivalidad': {
                    'id_rivalidad': row[0],
                    'id_pandilla': row[1],
                    'id_pandilla_rival': row[2]
                }
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener la rivalidad: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_red_social(request, id_red_social):
    """Obtener una red social específica por ID"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_red_social, plataforma, handle, url 
                FROM redes_sociales WHERE id_red_social = %s
            """, [id_red_social])
            row = cursor.fetchone()
            
            if not row:
                return Response({
                    'success': False,
                    'message': 'Red social no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'red_social': {
                    'id_red_social': row[0],
                    'plataforma': row[1],
                    'handle': row[2] or '',
                    'url': row[3] or ''
                }
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener la red social: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENDPOINTS GET PARA OBTENER TODOS LOS REGISTROS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_eventos(request):
    """Obtener todos los eventos"""
    try:
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'eventos'")
            if not cursor.fetchone():
                print("DEBUG: La tabla eventos no existe")
                return Response({
                    'success': True,
                    'eventos': [],
                    'message': 'La tabla de eventos no existe aún'
                }, status=status.HTTP_200_OK)
            
            # Primero contar cuántos eventos hay
            cursor.execute("SELECT COUNT(*) FROM eventos")
            count = cursor.fetchone()[0]
            print(f"DEBUG: Total de eventos en la tabla: {count}")
            
            # Obtener todos los eventos, ordenando por fecha (manejando NULLs)
            # MySQL no soporta NULLS LAST, así que usamos ISNULL para poner NULLs al final
            # La tabla eventos NO tiene columna 'tipo', se determina por id_delito o id_falta
            cursor.execute("""
                SELECT id_evento, id_delito, id_falta, fecha, hora, descripcion, id_pandilla, id_integrante
                FROM eventos 
                ORDER BY ISNULL(fecha), fecha DESC, ISNULL(hora), hora DESC, id_evento DESC
            """)
            
            rows = cursor.fetchall()
            print(f"DEBUG: Filas obtenidas: {len(rows)}")
            
            eventos = []
            for row in rows:
                # Determinar el tipo basándose en id_delito o id_falta
                tipo_evento = 'riña'  # Por defecto
                if row[1]:  # id_delito
                    tipo_evento = 'delito'
                elif row[2]:  # id_falta
                    tipo_evento = 'falta'
                
                evento = {
                    'id_evento': row[0],
                    'tipo': tipo_evento,
                    'fecha': str(row[3]) if len(row) > 3 and row[3] else None,
                    'hora': str(row[4]) if len(row) > 4 and row[4] else None,
                    'descripcion': row[5] or '' if len(row) > 5 else '',
                    'id_pandilla': row[6] if len(row) > 6 and row[6] else None,
                    'id_integrante': row[7] if len(row) > 7 and row[7] else None
                }
                print(f"DEBUG: Evento procesado: {evento}")
                eventos.append(evento)
            
            print(f"DEBUG: Total de eventos en respuesta: {len(eventos)}")
            return Response({
                'success': True,
                'eventos': eventos
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en get_all_eventos: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al obtener eventos: {str(e)}',
            'trace': error_trace
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_delitos(request):
    """Obtener todos los delitos"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_delito, nombre FROM delitos ORDER BY nombre")
            delitos = []
            for row in cursor.fetchall():
                delitos.append({
                    'id_delito': row[0],
                    'nombre': row[1]
                })
            return Response({
                'success': True,
                'delitos': delitos
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener delitos: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_faltas(request):
    """Obtener todas las faltas"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_falta, nombre FROM faltas ORDER BY nombre")
            faltas = []
            for row in cursor.fetchall():
                faltas.append({
                    'id_falta': row[0],
                    'nombre': row[1]
                })
            return Response({
                'success': True,
                'faltas': faltas
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener faltas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_rivalidades(request):
    """Obtener todas las rivalidades"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT R.id_rivalidad, R.id_pandilla, P1.nombre as pandilla_nombre,
                       R.id_pandilla_rival, P2.nombre as pandilla_rival_nombre
                FROM rivalidades R
                LEFT JOIN pandillas P1 ON R.id_pandilla = P1.id_pandilla
                LEFT JOIN pandillas P2 ON R.id_pandilla_rival = P2.id_pandilla
                ORDER BY R.id_rivalidad DESC
            """)
            rivalidades = []
            for row in cursor.fetchall():
                rivalidades.append({
                    'id_rivalidad': row[0],
                    'id_pandilla': row[1],
                    'pandilla_nombre': row[2] or f'ID: {row[1]}',
                    'id_pandilla_rival': row[3],
                    'pandilla_rival_nombre': row[4] or f'ID: {row[3]}'
                })
            return Response({
                'success': True,
                'rivalidades': rivalidades
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener rivalidades: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_redes_sociales(request):
    """Obtener todas las redes sociales"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_red_social, plataforma, handle, url 
                FROM redes_sociales ORDER BY plataforma, handle
            """)
            redes = []
            for row in cursor.fetchall():
                redes.append({
                    'id_red_social': row[0],
                    'plataforma': row[1],
                    'handle': row[2] or '',
                    'url': row[3] or ''
                })
            return Response({
                'success': True,
                'redes_sociales': redes
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al obtener redes sociales: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENDPOINTS PUT/PATCH PARA ACTUALIZAR REGISTROS ====================

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_pandilla(request, id_pandilla):
    """Actualizar una pandilla"""
    try:
        with connection.cursor() as cursor:
            # Verificar que la pandilla existe
            cursor.execute("SELECT id_pandilla FROM pandillas WHERE id_pandilla = %s", [id_pandilla])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Pandilla no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Obtener datos del request
            nombre = request.data.get('nombre')
            descripcion = request.data.get('descripcion', '')
            lider = request.data.get('lider', '')
            numero_integrantes = request.data.get('numero_integrantes')
            edades_promedio = request.data.get('edades_aproximadas') or request.data.get('edades_promedio')
            horario_reunion = request.data.get('horario_reunion', '')
            peligrosidad = request.data.get('peligrosidad')
            id_zona = request.data.get('id_zona')
            id_direccion = request.data.get('id_direccion')
            
            # Validaciones
            if not nombre or not peligrosidad or not id_zona:
                return Response({
                    'success': False,
                    'message': 'Nombre, peligrosidad y zona son requeridos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Convertir edades_promedio a float si existe
            if edades_promedio:
                try:
                    edades_promedio = float(edades_promedio)
                except (ValueError, TypeError):
                    edades_promedio = None
            
            # Actualizar la pandilla
            cursor.execute("""
                UPDATE pandillas 
                SET nombre = %s, descripcion = %s, lider = %s, numero_integrantes = %s,
                    edades_promedio = %s, horario_reunion = %s, peligrosidad = %s,
                    id_zona = %s, id_direccion = %s
                WHERE id_pandilla = %s
            """, [nombre, descripcion, lider, numero_integrantes, edades_promedio,
                  horario_reunion, peligrosidad, id_zona, id_direccion, id_pandilla])
            
            # Actualizar relaciones (delitos, faltas, rivalidades, redes sociales)
            delitos = request.data.get('delitos', [])
            faltas = request.data.get('faltas', [])
            rivalidades = request.data.get('rivalidades', [])
            redes_sociales = request.data.get('redes_sociales', [])
            
            # Eliminar relaciones existentes y crear nuevas
            if delitos is not None:
                cursor.execute("DELETE FROM pandillas_delitos WHERE id_pandilla = %s", [id_pandilla])
                for delito_id in delitos:
                    cursor.execute("""
                        INSERT INTO pandillas_delitos (id_pandilla, id_delito)
                        VALUES (%s, %s) ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                    """, [id_pandilla, delito_id])
            
            if faltas is not None:
                cursor.execute("DELETE FROM pandillas_faltas WHERE id_pandilla = %s", [id_pandilla])
                for falta_id in faltas:
                    cursor.execute("""
                        INSERT INTO pandillas_faltas (id_pandilla, id_falta)
                        VALUES (%s, %s) ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                    """, [id_pandilla, falta_id])
            
            if rivalidades is not None:
                cursor.execute("DELETE FROM rivalidades WHERE id_pandilla = %s", [id_pandilla])
                for rival_id in rivalidades:
                    cursor.execute("""
                        INSERT INTO rivalidades (id_pandilla, id_pandilla_rival)
                        VALUES (%s, %s) ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                    """, [id_pandilla, rival_id])
            
            if redes_sociales is not None:
                cursor.execute("DELETE FROM redes_pandillas WHERE id_pandilla = %s", [id_pandilla])
                for red_id in redes_sociales:
                    cursor.execute("""
                        INSERT INTO redes_pandillas (id_pandilla, id_red_social)
                        VALUES (%s, %s) ON DUPLICATE KEY UPDATE id_pandilla=id_pandilla
                    """, [id_pandilla, red_id])
            
            return Response({
                'success': True,
                'message': 'Pandilla actualizada correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en update_pandilla: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al actualizar la pandilla: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_integrante(request, id_integrante):
    """Actualizar un integrante"""
    try:
        with connection.cursor() as cursor:
            # Verificar que el integrante existe
            cursor.execute("SELECT id_integrante FROM integrantes WHERE id_integrante = %s", [id_integrante])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Integrante no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Obtener datos
            nombre = request.data.get('nombre') or request.POST.get('nombre')
            apellido_paterno = request.data.get('apellido_paterno') or request.POST.get('apellido_paterno', '')
            apellido_materno = request.data.get('apellido_materno') or request.POST.get('apellido_materno', '')
            alias = request.data.get('alias') or request.POST.get('alias', '')
            fecha_nacimiento = request.data.get('fecha_nacimiento') or request.POST.get('fecha_nacimiento', '')
            id_pandilla = request.data.get('id_pandilla') or request.POST.get('id_pandilla')
            id_direccion = request.data.get('id_direccion') or request.POST.get('id_direccion')
            
            if not nombre:
                return Response({
                    'success': False,
                    'message': 'El nombre es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Actualizar el integrante
            cursor.execute("""
                UPDATE integrantes 
                SET nombre = %s, apellido_paterno = %s, apellido_materno = %s,
                    alias = %s, fecha_nacimiento = %s, id_pandilla = %s, id_direccion = %s
                WHERE id_integrante = %s
            """, [nombre, apellido_paterno, apellido_materno, alias, 
                  fecha_nacimiento or None, id_pandilla or None, id_direccion or None, id_integrante])
            
            # Manejar nuevas imágenes si se proporcionan
            imagenes = request.FILES.getlist('imagenes') if hasattr(request, 'FILES') and request.FILES else []
            if imagenes:
                from django.conf import settings
                import os
                import uuid
                
                media_dir = settings.MEDIA_ROOT / 'integrantes'
                media_dir.mkdir(parents=True, exist_ok=True)
                
                for imagen in imagenes:
                    try:
                        ext = os.path.splitext(imagen.name)[1] or '.jpg'
                        nombre_archivo = f"{uuid.uuid4()}{ext}"
                        ruta_archivo = media_dir / nombre_archivo
                        
                        with open(ruta_archivo, 'wb+') as destino:
                            for chunk in imagen.chunks():
                                destino.write(chunk)
                        
                        url_imagen = f"media/integrantes/{nombre_archivo}"
                        cursor.execute("""
                            INSERT INTO imagenes_integrantes (id_integrante, url_imagen, descripcion, fecha_subida)
                            VALUES (%s, %s, %s, NOW())
                        """, [id_integrante, url_imagen, None])
                    except Exception as e:
                        print(f"Error al guardar imagen: {str(e)}")
                        continue
            
            return Response({
                'success': True,
                'message': 'Integrante actualizado correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en update_integrante: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al actualizar el integrante: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_evento(request, id_evento):
    """Actualizar un evento"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_evento FROM eventos WHERE id_evento = %s", [id_evento])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Evento no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            tipo = request.data.get('tipo')
            fecha = request.data.get('fecha')
            hora = request.data.get('hora')
            descripcion = request.data.get('descripcion', '')
            id_delito = request.data.get('id_delito')
            id_falta = request.data.get('id_falta')
            id_integrante = request.data.get('id_integrante')
            id_pandilla = request.data.get('id_pandilla')
            id_direccion = request.data.get('id_direccion')
            
            if not tipo or not fecha:
                return Response({
                    'success': False,
                    'message': 'Tipo y fecha son requeridos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cursor.execute("""
                UPDATE eventos 
                SET tipo = %s, id_delito = %s, id_falta = %s, fecha = %s, hora = %s,
                    descripcion = %s, id_integrante = %s, id_pandilla = %s, id_direccion = %s
                WHERE id_evento = %s
            """, [tipo, id_delito or None, id_falta or None, fecha, hora or None,
                  descripcion, id_integrante or None, id_pandilla or None, id_direccion or None, id_evento])
            
            return Response({
                'success': True,
                'message': 'Evento actualizado correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar el evento: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_delito(request, id_delito):
    """Actualizar un delito"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_delito FROM delitos WHERE id_delito = %s", [id_delito])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Delito no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            nombre = request.data.get('nombre')
            if not nombre:
                return Response({
                    'success': False,
                    'message': 'El nombre es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cursor.execute("UPDATE delitos SET nombre = %s WHERE id_delito = %s", [nombre, id_delito])
            
            return Response({
                'success': True,
                'message': 'Delito actualizado correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar el delito: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_falta(request, id_falta):
    """Actualizar una falta"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_falta FROM faltas WHERE id_falta = %s", [id_falta])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Falta no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            nombre = request.data.get('nombre')
            if not nombre:
                return Response({
                    'success': False,
                    'message': 'El nombre es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cursor.execute("UPDATE faltas SET nombre = %s WHERE id_falta = %s", [nombre, id_falta])
            
            return Response({
                'success': True,
                'message': 'Falta actualizada correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar la falta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_direccion(request, id_direccion):
    """Actualizar una dirección"""
    try:
        direccion = Direccion.objects.get(id_direccion=id_direccion)
        serializer = DireccionSerializer(direccion, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Dirección actualizada correctamente',
                'direccion': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Error de validación',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Direccion.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Dirección no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar la dirección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_rivalidad(request, id_rivalidad):
    """Actualizar una rivalidad"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_rivalidad FROM rivalidades WHERE id_rivalidad = %s", [id_rivalidad])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Rivalidad no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            id_pandilla = request.data.get('id_pandilla')
            id_pandilla_rival = request.data.get('id_pandilla_rival')
            
            if not id_pandilla or not id_pandilla_rival:
                return Response({
                    'success': False,
                    'message': 'Ambas pandillas son requeridas'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if id_pandilla == id_pandilla_rival:
                return Response({
                    'success': False,
                    'message': 'Una pandilla no puede ser rival de sí misma'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cursor.execute("""
                UPDATE rivalidades 
                SET id_pandilla = %s, id_pandilla_rival = %s
                WHERE id_rivalidad = %s
            """, [id_pandilla, id_pandilla_rival, id_rivalidad])
            
            return Response({
                'success': True,
                'message': 'Rivalidad actualizada correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar la rivalidad: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_red_social(request, id_red_social):
    """Actualizar una red social"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id_red_social FROM redes_sociales WHERE id_red_social = %s", [id_red_social])
            if not cursor.fetchone():
                return Response({
                    'success': False,
                    'message': 'Red social no encontrada'
                }, status=status.HTTP_404_NOT_FOUND)
            
            plataforma = request.data.get('plataforma')
            handle = request.data.get('handle')
            url = request.data.get('url')
            
            if not plataforma:
                return Response({
                    'success': False,
                    'message': 'La plataforma es requerida'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not handle and not url:
                return Response({
                    'success': False,
                    'message': 'Debes proporcionar al menos un handle o una URL'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cursor.execute("""
                UPDATE redes_sociales 
                SET plataforma = %s, handle = %s, url = %s
                WHERE id_red_social = %s
            """, [plataforma, handle or None, url or None, id_red_social])
            
            return Response({
                'success': True,
                'message': 'Red social actualizada correctamente'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error al actualizar la red social: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENDPOINTS PARA CONSULTAS Y REPORTES ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulta_eventos(request):
    """
    Consulta de eventos por rango de fechas.
    Retorna eventos con información completa: fecha, hora, tipo, delito/falta, pandilla(s), zona, dirección.
    Ordenados por fecha ASC (más antiguos primero) y hora ASC.
    """
    try:
        fecha_inicial = request.GET.get('fecha_inicial')
        fecha_final = request.GET.get('fecha_final')
        
        if not fecha_inicial or not fecha_final:
            return Response({
                'success': False,
                'message': 'Las fechas inicial y final son requeridas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que fecha_inicial <= fecha_final
        if fecha_inicial > fecha_final:
            return Response({
                'success': False,
                'message': 'La fecha inicial debe ser anterior o igual a la fecha final'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'eventos'")
            if not cursor.fetchone():
                return Response({
                    'success': True,
                    'eventos': [],
                    'message': 'La tabla de eventos no existe aún'
                }, status=status.HTTP_200_OK)
            
            # Verificar qué columnas existen en la tabla
            cursor.execute("SHOW COLUMNS FROM eventos")
            columnas_existentes = [row[0] for row in cursor.fetchall()]
            tiene_id_zona = 'id_zona' in columnas_existentes
            tiene_id_integrante = 'id_integrante' in columnas_existentes
            
            # Construir la consulta base según las columnas disponibles
            if tiene_id_zona:
                # Si tiene id_zona, usar todas las columnas
                query_base = """
                    SELECT 
                        E.id_evento,
                        E.id_delito,
                        E.id_falta,
                        E.id_integrante,
                        E.id_pandilla,
                        E.id_zona,
                        E.id_direccion,
                        E.fecha,
                        E.hora,
                        E.descripcion
                    FROM eventos E
                    WHERE E.fecha IS NOT NULL 
                      AND DATE(E.fecha) >= DATE(%s)
                      AND DATE(E.fecha) <= DATE(%s)
                    ORDER BY E.fecha ASC, E.hora ASC, E.id_evento ASC
                """
            else:
                # Si no tiene id_zona, omitirla
                query_base = """
                    SELECT 
                        E.id_evento,
                        E.id_delito,
                        E.id_falta,
                        E.id_integrante,
                        E.id_pandilla,
                        E.id_direccion,
                        E.fecha,
                        E.hora,
                        E.descripcion
                    FROM eventos E
                    WHERE E.fecha IS NOT NULL 
                      AND DATE(E.fecha) >= DATE(%s)
                      AND DATE(E.fecha) <= DATE(%s)
                    ORDER BY E.fecha ASC, E.hora ASC, E.id_evento ASC
                """
            
            cursor.execute(query_base, [fecha_inicial, fecha_final])
            eventos_raw = cursor.fetchall()
            eventos = []
            
            for evento_row in eventos_raw:
                # Mapear índices según si tiene id_zona o no
                if tiene_id_zona:
                    evento_id = evento_row[0]
                    id_delito = evento_row[1]
                    id_falta = evento_row[2]
                    id_integrante = evento_row[3]
                    id_pandilla = evento_row[4]
                    id_zona = evento_row[5]
                    id_direccion = evento_row[6]
                    fecha = evento_row[7]
                    hora = evento_row[8]
                    descripcion = evento_row[9]
                else:
                    evento_id = evento_row[0]
                    id_delito = evento_row[1]
                    id_falta = evento_row[2]
                    id_integrante = evento_row[3]
                    id_pandilla = evento_row[4]
                    id_direccion = evento_row[5]
                    fecha = evento_row[6]
                    hora = evento_row[7]
                    descripcion = evento_row[8]
                    id_zona = None
                
                # Determinar el tipo
                tipo_evento = 'riña'
                if id_delito:
                    tipo_evento = 'delito'
                elif id_falta:
                    tipo_evento = 'falta'
                
                # Obtener delito
                delito_nombre = ''
                if id_delito:
                    try:
                        cursor.execute("SELECT nombre FROM delitos WHERE id_delito = %s", [id_delito])
                        delito_result = cursor.fetchone()
                        if delito_result:
                            delito_nombre = delito_result[0] or ''
                    except Exception as e:
                        print(f"Error al obtener delito {id_delito}: {e}")
                
                # Obtener falta
                falta_nombre = ''
                if id_falta:
                    try:
                        cursor.execute("SELECT nombre FROM faltas WHERE id_falta = %s", [id_falta])
                        falta_result = cursor.fetchone()
                        if falta_result:
                            falta_nombre = falta_result[0] or ''
                    except Exception as e:
                        print(f"Error al obtener falta {id_falta}: {e}")
                
                # Obtener integrante
                integrante_nombre = ''
                if id_integrante and tiene_id_integrante:
                    try:
                        cursor.execute("""
                            SELECT CONCAT(
                                COALESCE(nombre, ''), ' ',
                                COALESCE(apellido_paterno, ''), ' ',
                                COALESCE(apellido_materno, '')
                            )
                            FROM integrantes WHERE id_integrante = %s
                        """, [id_integrante])
                        integrante_result = cursor.fetchone()
                        if integrante_result and integrante_result[0]:
                            integrante_nombre = integrante_result[0].strip()
                    except Exception as e:
                        print(f"Error al obtener integrante {id_integrante}: {e}")
                
                # Obtener pandilla
                pandilla_nombre = ''
                if id_pandilla:
                    try:
                        cursor.execute("SELECT nombre FROM pandillas WHERE id_pandilla = %s", [id_pandilla])
                        pandilla_result = cursor.fetchone()
                        if pandilla_result:
                            pandilla_nombre = pandilla_result[0] or ''
                    except Exception as e:
                        print(f"Error al obtener pandilla {id_pandilla}: {e}")
                
                # Obtener zona
                zona_nombre = ''
                if id_zona:
                    try:
                        cursor.execute("SELECT nombre FROM zonas WHERE id_zona = %s", [id_zona])
                        zona_result = cursor.fetchone()
                        if zona_result:
                            zona_nombre = zona_result[0] or ''
                    except Exception as e:
                        print(f"Error al obtener zona {id_zona}: {e}")
                elif id_pandilla:
                    # Si no hay id_zona en eventos, intentar obtenerlo de la pandilla
                    try:
                        cursor.execute("""
                            SELECT Z.nombre 
                            FROM pandillas P
                            LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                            WHERE P.id_pandilla = %s
                        """, [id_pandilla])
                        zona_result = cursor.fetchone()
                        if zona_result and zona_result[0]:
                            zona_nombre = zona_result[0]
                    except Exception as e:
                        print(f"Error al obtener zona de pandilla {id_pandilla}: {e}")
                
                # Obtener dirección
                direccion = ''
                if id_direccion:
                    try:
                        cursor.execute("""
                            SELECT CONCAT(
                                COALESCE(calle, ''), ' ',
                                COALESCE(numero, ''), ', ',
                                COALESCE(colonia, '')
                            )
                            FROM direcciones WHERE id_direccion = %s
                        """, [id_direccion])
                        dir_result = cursor.fetchone()
                        if dir_result and dir_result[0]:
                            direccion = dir_result[0].strip()
                    except Exception as e:
                        print(f"Error al obtener dirección {id_direccion}: {e}")
                
                eventos.append({
                    'id_evento': evento_id,
                    'tipo': tipo_evento,
                    'fecha': str(fecha) if fecha else None,
                    'hora': str(hora) if hora else None,
                    'descripcion': descripcion or '',
                    'delito_nombre': delito_nombre,
                    'falta_nombre': falta_nombre,
                    'integrante_nombre': integrante_nombre,
                    'pandilla_nombre': pandilla_nombre,
                    'zona_nombre': zona_nombre,
                    'direccion': direccion
                })
            
            print(f"Eventos encontrados en el rango {fecha_inicial} a {fecha_final}: {len(eventos)}")
            return Response({
                'success': True,
                'eventos': eventos
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en consulta_eventos: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al consultar eventos: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulta_pandillas(request):
    """
    Consulta de pandillas por nombre (búsqueda parcial).
    Retorna pandillas con información completa e integrantes.
    """
    try:
        nombre = request.GET.get('nombre', '').strip()
        
        if not nombre:
            return Response({
                'success': False,
                'message': 'El nombre de la pandilla es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            # Buscar pandillas que coincidan con el nombre (búsqueda parcial)
            cursor.execute("""
                SELECT 
                    P.id_pandilla,
                    P.nombre,
                    P.descripcion,
                    P.lider,
                    P.numero_integrantes,
                    P.edades_promedio,
                    P.horario_reunion,
                    P.peligrosidad,
                    Z.nombre as zona_nombre,
                    CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) as direccion
                FROM pandillas P
                LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                LEFT JOIN direcciones DIR ON P.id_direccion = DIR.id_direccion
                WHERE P.nombre LIKE %s
                ORDER BY P.nombre
            """, [f'%{nombre}%'])
            
            pandillas_data = []
            for row in cursor.fetchall():
                pandilla = {
                    'id_pandilla': row[0],
                    'nombre': row[1],
                    'descripcion': row[2] or '',
                    'lider': row[3] or '',
                    'numero_integrantes': row[4],
                    'edades_promedio': float(row[5]) if row[5] else None,
                    'horario_reunion': row[6] or '',
                    'peligrosidad': row[7],
                    'zona_nombre': row[8],
                    'direccion': row[9] or '',
                    'integrantes': []
                }
                
                # Obtener integrantes de esta pandilla
                cursor.execute("""
                    SELECT 
                        I.id_integrante,
                        I.nombre,
                        I.apellido_paterno,
                        I.apellido_materno,
                        I.alias,
                        CONCAT(
                            I.nombre,
                            COALESCE(CONCAT(' ', I.apellido_paterno), ''),
                            COALESCE(CONCAT(' ', I.apellido_materno), '')
                        ) as nombre_completo
                    FROM integrantes I
                    WHERE I.id_pandilla = %s
                    ORDER BY I.nombre
                """, [pandilla['id_pandilla']])
                
                for int_row in cursor.fetchall():
                    pandilla['integrantes'].append({
                        'id_integrante': int_row[0],
                        'nombre': int_row[1],
                        'apellido_paterno': int_row[2] or '',
                        'apellido_materno': int_row[3] or '',
                        'alias': int_row[4] or '',
                        'nombre_completo': int_row[5] or int_row[1]
                    })
                
                pandillas_data.append(pandilla)
            
            return Response({
                'success': True,
                'pandillas': pandillas_data
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en consulta_pandillas: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al consultar pandillas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulta_integrantes(request):
    """
    Consulta de integrantes por nombre, apellido o alias con búsqueda inteligente.
    - Busca simultáneamente en nombre, apellido paterno, apellido materno y alias
    - Si la búsqueda tiene múltiples palabras, prioriza coincidencias exactas
    - Ordena por relevancia: coincidencias exactas primero, luego parciales
    Retorna integrantes con información completa: nombre, alias, fecha nacimiento, pandilla, dirección, delitos y faltas.
    """
    try:
        busqueda = request.GET.get('busqueda', '').strip()
        
        if not busqueda:
            return Response({
                'success': False,
                'message': 'El criterio de búsqueda es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'integrantes'")
            if not cursor.fetchone():
                return Response({
                    'success': True,
                    'integrantes': [],
                    'message': 'La tabla de integrantes no existe aún'
                }, status=status.HTTP_200_OK)
            
            # Limpiar y preparar la búsqueda
            busqueda_limpia = busqueda.strip()
            busqueda_like = f'%{busqueda_limpia}%'
            
            # Construir la consulta con búsqueda simplificada y ordenamiento por relevancia
            # Buscar en: nombre, apellido_paterno, apellido_materno, alias
            # Priorizar: 1) Coincidencias exactas del nombre completo, 2) Coincidencias en nombre, 3) Coincidencias en apellidos, 4) Coincidencias en alias
            query = """
                SELECT 
                    I.id_integrante,
                    I.nombre,
                    I.apellido_paterno,
                    I.apellido_materno,
                    I.alias,
                    I.fecha_nacimiento,
                    CONCAT(
                        COALESCE(I.nombre, ''),
                        COALESCE(CONCAT(' ', I.apellido_paterno), ''),
                        COALESCE(CONCAT(' ', I.apellido_materno), '')
                    ) as nombre_completo,
                    P.nombre as pandilla_nombre,
                    CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) as direccion,
                    CASE 
                        WHEN CONCAT(
                            COALESCE(I.nombre, ''),
                            COALESCE(CONCAT(' ', I.apellido_paterno), ''),
                            COALESCE(CONCAT(' ', I.apellido_materno), '')
                        ) LIKE %s THEN 1
                        WHEN I.nombre LIKE %s THEN 2
                        WHEN I.apellido_paterno LIKE %s OR I.apellido_materno LIKE %s THEN 3
                        WHEN I.alias LIKE %s THEN 4
                        ELSE 5
                    END as relevancia
                FROM integrantes I
                LEFT JOIN pandillas P ON I.id_pandilla = P.id_pandilla
                LEFT JOIN direcciones DIR ON I.id_direccion = DIR.id_direccion
                WHERE (
                    I.nombre LIKE %s 
                    OR I.apellido_paterno LIKE %s 
                    OR I.apellido_materno LIKE %s 
                    OR I.alias LIKE %s
                    OR CONCAT(
                        COALESCE(I.nombre, ''),
                        COALESCE(CONCAT(' ', I.apellido_paterno), ''),
                        COALESCE(CONCAT(' ', I.apellido_materno), '')
                    ) LIKE %s
                )
                ORDER BY relevancia ASC, I.nombre ASC, I.apellido_paterno ASC, I.apellido_materno ASC
            """
            
            # Parámetros: primero los del CASE (relevancia), luego los del WHERE
            todos_parametros = [
                busqueda_like,  # CASE: nombre completo
                busqueda_like,  # CASE: nombre
                busqueda_like,  # CASE: apellido paterno
                busqueda_like,  # CASE: apellido materno
                busqueda_like,  # CASE: alias
                busqueda_like,  # WHERE: nombre
                busqueda_like,  # WHERE: apellido_paterno
                busqueda_like,  # WHERE: apellido_materno
                busqueda_like,  # WHERE: alias
                busqueda_like   # WHERE: nombre completo
            ]
            
            cursor.execute(query, todos_parametros)
            
            integrantes_data = []
            rows = cursor.fetchall()
            
            for row in rows:
                integrante = {
                    'id_integrante': row[0],
                    'nombre': row[1] or '',
                    'apellido_paterno': row[2] or '',
                    'apellido_materno': row[3] or '',
                    'alias': row[4] or '',
                    'fecha_nacimiento': str(row[5]) if row[5] else None,
                    'nombre_completo': row[6] or row[1] or 'Sin nombre',
                    'pandilla_nombre': row[7] if len(row) > 7 else None,
                    'direccion': row[8] if len(row) > 8 else '',
                    'delitos': [],
                    'faltas': []
                }
                
                # Obtener delitos del integrante
                cursor.execute("""
                    SELECT D.id_delito, D.nombre
                    FROM integrantes_delitos ID
                    JOIN delitos D ON ID.id_delito = D.id_delito
                    WHERE ID.id_integrante = %s
                """, [integrante['id_integrante']])
                
                for delito_row in cursor.fetchall():
                    integrante['delitos'].append({
                        'id_delito': delito_row[0],
                        'nombre': delito_row[1]
                    })
                
                # Obtener faltas del integrante
                try:
                    # Usar LEFT JOIN para evitar errores si no hay faltas asociadas
                    # Verificar primero si las tablas existen
                    cursor.execute("SHOW TABLES LIKE 'integrantes_faltas'")
                    tabla_if_existe = cursor.fetchone()
                    
                    cursor.execute("SHOW TABLES LIKE 'faltas'")
                    tabla_faltas_existe = cursor.fetchone()
                    
                    if tabla_if_existe and tabla_faltas_existe:
                        # Verificar las columnas de la tabla faltas
                        cursor.execute("SHOW COLUMNS FROM faltas")
                        columnas_faltas = [col[0] for col in cursor.fetchall()]
                        
                        if 'nombre' in columnas_faltas:
                            # La tabla tiene la columna nombre, hacer la consulta normal
                            cursor.execute("""
                                SELECT faltas.id_falta, faltas.nombre
                                FROM integrantes_faltas
                                JOIN faltas ON integrantes_faltas.id_falta = faltas.id_falta
                                WHERE integrantes_faltas.id_integrante = %s
                            """, [integrante['id_integrante']])
                        else:
                            # La tabla no tiene columna nombre, intentar obtener solo el id
                            print(f"Advertencia: La tabla faltas no tiene columna 'nombre', columnas disponibles: {columnas_faltas}")
                            cursor.execute("""
                                SELECT integrantes_faltas.id_falta
                                FROM integrantes_faltas
                                WHERE integrantes_faltas.id_integrante = %s
                            """, [integrante['id_integrante']])
                            for falta_row in cursor.fetchall():
                                integrante['faltas'].append({
                                    'id_falta': falta_row[0],
                                    'nombre': f'Falta {falta_row[0]}'
                                })
                            continue  # Saltar el procesamiento normal
                        
                        for falta_row in cursor.fetchall():
                            integrante['faltas'].append({
                                'id_falta': falta_row[0],
                                'nombre': falta_row[1] if len(falta_row) > 1 else f'Falta {falta_row[0]}'
                            })
                    else:
                        print(f"Advertencia: Tablas de faltas no existen. integrantes_faltas: {tabla_if_existe}, faltas: {tabla_faltas_existe}")
                except Exception as e:
                    import traceback
                    error_trace = traceback.format_exc()
                    print(f"Error al obtener faltas del integrante {integrante['id_integrante']}: {error_trace}")
                    # Continuar sin las faltas si hay error
                
                integrantes_data.append(integrante)
            
            return Response({
                'success': True,
                'integrantes': integrantes_data
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en consulta_integrantes: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al consultar integrantes: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulta_pandillas_general(request):
    """
    Consulta general de todas las pandillas.
    Retorna solo los datos de la tabla pandillas, sin integrantes.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    P.id_pandilla,
                    P.nombre,
                    P.descripcion,
                    P.lider,
                    P.numero_integrantes,
                    P.edades_promedio,
                    P.horario_reunion,
                    P.peligrosidad,
                    Z.nombre as zona_nombre,
                    CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) as direccion
                FROM pandillas P
                LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                LEFT JOIN direcciones DIR ON P.id_direccion = DIR.id_direccion
                ORDER BY P.nombre
            """)
            
            pandillas = []
            for row in cursor.fetchall():
                pandillas.append({
                    'id_pandilla': row[0],
                    'nombre': row[1],
                    'descripcion': row[2] or '',
                    'lider': row[3] or '',
                    'numero_integrantes': row[4],
                    'edades_promedio': float(row[5]) if row[5] else None,
                    'horario_reunion': row[6] or '',
                    'peligrosidad': row[7],
                    'zona_nombre': row[8],
                    'direccion': row[9] or ''
                })
            
            return Response({
                'success': True,
                'pandillas': pandillas
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en consulta_pandillas_general: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al consultar pandillas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== ENDPOINTS PARA CONSULTAS Y REPORTES ====================
# Nota: La función consulta_eventos está definida arriba (línea 2277), esta era una duplicada que se eliminó

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulta_pandillas(request):
    """
    Consulta de pandillas por nombre (búsqueda parcial).
    Retorna pandillas con información completa y lista de integrantes.
    """
    try:
        nombre = request.GET.get('nombre', '').strip()
        
        if not nombre:
            return Response({
                'success': False,
                'message': 'El nombre de la pandilla es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            # Buscar pandillas que coincidan con el nombre (búsqueda parcial)
            cursor.execute("""
                SELECT 
                    P.id_pandilla,
                    P.nombre,
                    P.descripcion,
                    P.lider,
                    P.numero_integrantes,
                    P.edades_promedio,
                    P.horario_reunion,
                    P.peligrosidad,
                    Z.nombre AS zona_nombre,
                    CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) AS direccion
                FROM pandillas P
                LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                LEFT JOIN direcciones DIR ON P.id_direccion = DIR.id_direccion
                WHERE P.nombre LIKE %s
                ORDER BY P.nombre
            """, [f'%{nombre}%'])
            
            pandillas = []
            for row in cursor.fetchall():
                pandilla_id = row[0]
                
                # Obtener integrantes de esta pandilla
                cursor.execute("""
                    SELECT 
                        I.id_integrante,
                        CONCAT(I.nombre, ' ', COALESCE(I.apellido_paterno, ''), ' ', COALESCE(I.apellido_materno, '')) AS nombre_completo,
                        I.alias
                    FROM integrantes I
                    WHERE I.id_pandilla = %s
                    ORDER BY I.nombre
                """, [pandilla_id])
                
                integrantes = []
                for int_row in cursor.fetchall():
                    integrantes.append({
                        'id_integrante': int_row[0],
                        'nombre_completo': int_row[1].strip(),
                        'alias': int_row[2] or ''
                    })
                
                pandillas.append({
                    'id_pandilla': pandilla_id,
                    'nombre': row[1],
                    'descripcion': row[2] or '',
                    'lider': row[3] or '',
                    'numero_integrantes': row[4],
                    'edades_promedio': float(row[5]) if row[5] else None,
                    'horario_reunion': row[6] or '',
                    'peligrosidad': row[7],
                    'zona_nombre': row[8],
                    'direccion': row[9] or 'N/A',
                    'integrantes': integrantes
                })
            
            return Response({
                'success': True,
                'pandillas': pandillas
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en consulta_pandillas: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al realizar la consulta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consulta_pandillas_general(request):
    """
    Consulta general de todas las pandillas.
    Retorna solo los datos de la tabla pandillas, sin listar integrantes.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    P.id_pandilla,
                    P.nombre,
                    P.descripcion,
                    P.lider,
                    P.numero_integrantes,
                    P.edades_promedio,
                    P.horario_reunion,
                    P.peligrosidad,
                    Z.nombre AS zona_nombre,
                    CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) AS direccion
                FROM pandillas P
                LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                LEFT JOIN direcciones DIR ON P.id_direccion = DIR.id_direccion
                ORDER BY P.nombre
            """)
            
            pandillas = []
            for row in cursor.fetchall():
                pandillas.append({
                    'id_pandilla': row[0],
                    'nombre': row[1],
                    'descripcion': row[2] or '',
                    'lider': row[3] or '',
                    'numero_integrantes': row[4],
                    'edades_promedio': float(row[5]) if row[5] else None,
                    'horario_reunion': row[6] or '',
                    'peligrosidad': row[7],
                    'zona_nombre': row[8],
                    'direccion': row[9] or 'N/A'
                })
            
            return Response({
                'success': True,
                'pandillas': pandillas
            }, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en consulta_pandillas_general: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al realizar la consulta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_email(request):
    """
    Endpoint para enviar correos de contacto desde el formulario de ayuda.
    """
    try:
        nombre = request.data.get('nombre', '').strip()
        email = request.data.get('email', '').strip()
        asunto = request.data.get('asunto', '').strip()
        mensaje = request.data.get('mensaje', '').strip()
        
        # Validar campos requeridos
        if not nombre or not email or not asunto or not mensaje:
            return Response({
                'success': False,
                'message': 'Todos los campos son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar formato de email
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError
        try:
            validate_email(email)
        except ValidationError:
            return Response({
                'success': False,
                'message': 'El formato del correo electrónico no es válido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener el correo de destino desde settings
        contact_email = getattr(settings, 'CONTACT_EMAIL', 'kevcerdaa@gmail.com')
        
        # Crear el contenido del correo
        subject = f'[SIGP] Contacto: {asunto}'
        message_body = f"""
Has recibido un nuevo mensaje de contacto desde SIGP:

Nombre: {nombre}
Correo: {email}
Asunto: {asunto}

Mensaje:
{mensaje}

---
Este mensaje fue enviado desde el formulario de contacto de SIGP.
"""
        
        # Verificar configuración de correo antes de enviar
        email_host_user = getattr(settings, 'EMAIL_HOST_USER', '')
        if not email_host_user:
            return Response({
                'success': False,
                'message': 'El servidor de correo no está configurado. Por favor, contacta al administrador del sistema.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Enviar el correo
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', email_host_user)
            send_mail(
                subject=subject,
                message=message_body,
                from_email=from_email,
                recipient_list=[contact_email],
                fail_silently=False,
            )
            
            return Response({
                'success': True,
                'message': 'Correo enviado exitosamente. Nos pondremos en contacto contigo pronto.'
            }, status=status.HTTP_200_OK)
            
        except Exception as email_error:
            import traceback
            error_trace = traceback.format_exc()
            error_message = str(email_error)
            print(f"Error al enviar correo: {error_message}")
            print(f"Traceback: {error_trace}")
            
            # Mensajes más específicos según el tipo de error
            if 'authentication failed' in error_message.lower() or '535' in error_message:
                user_message = 'Error de autenticación. Verifica las credenciales de correo en la configuración del servidor.'
            elif 'connection' in error_message.lower() or 'timeout' in error_message.lower():
                user_message = 'Error de conexión con el servidor de correo. Verifica la configuración de red.'
            elif 'smtp' in error_message.lower():
                user_message = 'Error en el servidor SMTP. Verifica la configuración del servidor de correo.'
            else:
                user_message = f'Error al enviar el correo: {error_message}'
            
            return Response({
                'success': False,
                'message': user_message,
                'error_detail': error_message if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en send_contact_email: {error_trace}")
        return Response({
            'success': False,
            'message': f'Error al procesar la solicitud: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)