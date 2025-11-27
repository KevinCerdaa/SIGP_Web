from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario"""
    
    def create_user(self, correo, password=None, **extra_fields):
        """Crea y guarda un usuario con el correo y contraseña dados"""
        if not correo:
            raise ValueError('El correo electrónico es obligatorio')
        
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, **extra_fields)
        user.set_password(password)  # Django hashea automáticamente la contraseña
        user.save(using=self._db)
        return user
    
    def create_superuser(self, correo, password=None, **extra_fields):
        """Crea y guarda un superusuario"""
        extra_fields.setdefault('rol', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(correo, password, **extra_fields)


class Usuario(AbstractBaseUser):
    """Modelo de usuario personalizado"""
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('consultor', 'Consultor'),
    ]
    
    id_usuario = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=255)
    correo = models.EmailField(unique=True, max_length=255)
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    rol = models.CharField(max_length=50, choices=ROL_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'user_name', 'rol']
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.correo})"
    
    def has_perm(self, perm, obj=None):
        return self.is_superuser or (self.is_staff and self.is_active)
    
    def has_module_perms(self, app_label):
        return self.is_superuser or (self.is_staff and self.is_active)
