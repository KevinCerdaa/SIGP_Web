from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario, Direccion, Pandilla


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario"""
    
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'user_name', 'correo', 'nombre', 'apellido', 'rol', 'genero']
        read_only_fields = ['id_usuario']


class LoginSerializer(serializers.Serializer):
    """Serializer para el login"""
    correo = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        correo = attrs.get('correo')
        password = attrs.get('password')
        
        if correo and password:
            # Intentar autenticar al usuario
            user = authenticate(request=self.context.get('request'), username=correo, password=password)
            
            if not user:
                # No revelar si el error es por correo o contraseña
                raise serializers.ValidationError(
                    'Correo o contraseña incorrecta',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'Usuario desactivado',
                    code='authorization'
                )
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError(
                'Debe incluir "correo" y "password"',
                code='authorization'
            )
        
        return attrs


class DireccionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Direccion"""
    
    class Meta:
        model = Direccion
        fields = ['id_direccion', 'calle', 'numero', 'colonia', 'codigo_postal', 'latitud', 'longitud']
        read_only_fields = ['id_direccion']


class PandillaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Pandilla"""
    
    class Meta:
        model = Pandilla
        fields = ['id_pandilla', 'nombre', 'descripcion', 'lider', 'numero_integrantes', 
                  'edades_promedio', 'horario_reunion', 'peligrosidad', 'id_zona', 'id_direccion']
        read_only_fields = ['id_pandilla']

