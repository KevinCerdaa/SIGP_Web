"""
Manejadores de excepciones personalizados para la API.
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Manejador de excepciones personalizado para proporcionar
    respuestas más amigables a errores de autenticación.
    """
    # Llamar al manejador por defecto primero
    response = exception_handler(exc, context)
    
    # Si es un error de autenticación, personalizar el mensaje
    if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        custom_response_data = {
            'success': False,
            'message': 'Debes iniciar sesión para acceder a este recurso.',
            'detail': str(exc)
        }
        return Response(custom_response_data, status=status.HTTP_401_UNAUTHORIZED)
    
    return response



