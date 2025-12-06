"""
Clases de autenticación personalizadas para la API.
"""
from rest_framework.authentication import TokenAuthentication
from rest_framework import exceptions
import logging

logger = logging.getLogger(__name__)


class OptionalTokenAuthentication(TokenAuthentication):
    """
    Autenticación por token opcional que NO falla si el token es inválido.
    
    Esta clase permite que los endpoints con AllowAny funcionen correctamente
    incluso si el cliente envía un token inválido o mal formateado.
    
    Si el token es válido, autentica al usuario.
    Si el token es inválido o no existe, NO lanza excepción, simplemente devuelve None.
    """
    
    def authenticate(self, request):
        """
        Intenta autenticar usando el token.
        Si falla, devuelve None en lugar de lanzar excepción.
        """
        try:
            result = super().authenticate(request)
            if result:
                user, token = result
                logger.info(f"✅ Token válido para usuario: {user.correo}")
            return result
        except exceptions.AuthenticationFailed as e:
            # Si el token es inválido, devolver None en lugar de fallar
            # Esto permite que los endpoints con AllowAny funcionen
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            logger.warning(f"⚠️ Token inválido o expirado: {auth_header[:50]}... Error: {str(e)}")
            return None

