from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.utils import timezone
from .serializers import LoginSerializer, UsuarioSerializer


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
        # Crear el usuario
        user = Usuario.objects.create_user(
            correo=correo,
            password=password,
            nombre=nombre,
            apellido=apellido,
            user_name=user_name,
            rol=rol
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
    """
    from django.db import connection
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    P.id_pandilla AS id,
                    P.nombre AS nombre_pandilla,
                    P.peligrosidad AS grado_peligro,
                    D.latitud, 
                    D.longitud, 
                    D.calle, 
                    D.colonia, 
                    D.id_zona
                FROM 
                    pandillas P
                INNER JOIN 
                    direcciones D ON P.id_direccion = D.id_direccion
            """)
            
            locations = []
            for row in cursor.fetchall():
                locations.append({
                    'id': row[0],
                    'nombre_pandilla': row[1],
                    'grado_peligro': row[2] if row[2] is not None else 0,
                    'lat': float(row[3]) if row[3] else None,
                    'lng': float(row[4]) if row[4] else None,
                    'calle': row[5] or '',
                    'colonia': row[6] or '',
                    'id_zona': row[7] if row[7] else None
                })
            
            return Response(locations, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)