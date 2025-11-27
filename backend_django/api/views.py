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
