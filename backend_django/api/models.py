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
    
    GENERO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('X', 'Sin definir'),
    ]
    
    id_usuario = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=255)
    correo = models.EmailField(unique=True, max_length=255)
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    cargo = models.CharField(max_length=255, blank=True, null=True)
    rol = models.CharField(max_length=50, choices=ROL_CHOICES)
    genero = models.CharField(max_length=1, choices=GENERO_CHOICES, default='X', blank=True, null=True)
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


class Direccion(models.Model):
    """Modelo para direcciones físicas"""
    id_direccion = models.AutoField(primary_key=True)
    calle = models.CharField(max_length=255)
    numero = models.CharField(max_length=50, blank=True, null=True)
    colonia = models.CharField(max_length=255, blank=True, null=True)
    codigo_postal = models.CharField(max_length=10, blank=True, null=True)
    latitud = models.DecimalField(max_digits=10, decimal_places=7)
    longitud = models.DecimalField(max_digits=10, decimal_places=7)
    
    class Meta:
        db_table = 'direcciones'
        verbose_name = 'Dirección'
        verbose_name_plural = 'Direcciones'
    
    def __str__(self):
        return f"{self.calle} {self.numero or ''}, {self.colonia or ''}"


class Pandilla(models.Model):
    """Modelo para pandillas"""
    id_pandilla = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    lider = models.CharField(max_length=255, blank=True, null=True)
    numero_integrantes = models.IntegerField(blank=True, null=True)
    edades_promedio = models.FloatField(blank=True, null=True, db_column='edades_promedio')
    horario_reunion = models.CharField(max_length=255, blank=True, null=True)
    peligrosidad = models.CharField(max_length=50)  # VARCHAR: "Bajo", "Medio", "Alto"
    id_zona = models.IntegerField()
    id_direccion = models.ForeignKey(Direccion, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_direccion')
    
    class Meta:
        db_table = 'pandillas'
        verbose_name = 'Pandilla'
        verbose_name_plural = 'Pandillas'
    
    def __str__(self):
        return self.nombre


class Integrante(models.Model):
    """Modelo para integrantes de pandillas"""
    id_integrante = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    apellido_paterno = models.CharField(max_length=255, blank=True, null=True)
    apellido_materno = models.CharField(max_length=255, blank=True, null=True)
    alias = models.CharField(max_length=255, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    id_pandilla = models.ForeignKey(Pandilla, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_pandilla')
    id_direccion = models.ForeignKey(Direccion, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_direccion')
    
    class Meta:
        db_table = 'integrantes'
        verbose_name = 'Integrante'
        verbose_name_plural = 'Integrantes'
    
    def __str__(self):
        nombre_completo = f"{self.nombre}"
        if self.apellido_paterno:
            nombre_completo += f" {self.apellido_paterno}"
        if self.apellido_materno:
            nombre_completo += f" {self.apellido_materno}"
        if self.alias:
            nombre_completo += f" ({self.alias})"
        return nombre_completo


class ImagenIntegrante(models.Model):
    """Modelo para almacenar múltiples imágenes de un integrante"""
    id_imagen = models.AutoField(primary_key=True)
    id_integrante = models.ForeignKey(Integrante, on_delete=models.CASCADE, db_column='id_integrante', related_name='imagenes')
    url_imagen = models.CharField(max_length=500)  # Ruta o URL de la imagen
    descripcion = models.CharField(max_length=255, blank=True, null=True)  # Descripción opcional de la imagen
    fecha_subida = models.DateTimeField(auto_now_add=True)  # Fecha de subida automática
    
    class Meta:
        db_table = 'imagenes_integrantes'
        verbose_name = 'Imagen de Integrante'
        verbose_name_plural = 'Imágenes de Integrantes'
        ordering = ['-fecha_subida']  # Ordenar por fecha más reciente primero
    
    def __str__(self):
        return f"Imagen de {self.id_integrante} - {self.fecha_subida.strftime('%Y-%m-%d') if self.fecha_subida else 'Sin fecha'}"


class Evento(models.Model):
    """Modelo para eventos (riñas/delitos/faltas)"""
    id_evento = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=50)  # Ej: "riña", "delito", "falta"
    id_delito = models.IntegerField(blank=True, null=True, db_column='id_delito')
    id_falta = models.IntegerField(blank=True, null=True, db_column='id_falta')
    fecha = models.DateField()
    hora = models.TimeField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    id_integrante = models.ForeignKey(Integrante, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_integrante')
    id_pandilla = models.ForeignKey(Pandilla, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_pandilla')
    id_direccion = models.ForeignKey(Direccion, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_direccion')
    
    class Meta:
        db_table = 'eventos'
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'
        ordering = ['-fecha', '-hora']
    
    def __str__(self):
        return f"Evento {self.tipo} - {self.fecha}"


class Delito(models.Model):
    """Modelo para catálogo de delitos"""
    id_delito = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'delitos'
        verbose_name = 'Delito'
        verbose_name_plural = 'Delitos'
    
    def __str__(self):
        return self.nombre


class Falta(models.Model):
    """Modelo para catálogo de faltas"""
    id_falta = models.AutoField(primary_key=True)
    falta = models.CharField(max_length=255, db_column='falta')
    
    class Meta:
        db_table = 'faltas'
        verbose_name = 'Falta'
        verbose_name_plural = 'Faltas'
    
    def __str__(self):
        return self.falta


class Rivalidad(models.Model):
    """Modelo para rivalidades entre pandillas"""
    id_rivalidad = models.AutoField(primary_key=True)
    id_pandilla = models.ForeignKey(Pandilla, on_delete=models.CASCADE, db_column='id_pandilla', related_name='rivalidades')
    id_pandilla_rival = models.ForeignKey(Pandilla, on_delete=models.CASCADE, db_column='id_pandilla_rival', related_name='rivales_de')
    
    class Meta:
        db_table = 'rivalidades'
        verbose_name = 'Rivalidad'
        verbose_name_plural = 'Rivalidades'
        unique_together = [['id_pandilla', 'id_pandilla_rival']]  # Evitar duplicados
    
    def __str__(self):
        return f"{self.id_pandilla} vs {self.id_pandilla_rival}"


class RedSocial(models.Model):
    """Modelo para catálogo de redes sociales"""
    id_red_social = models.AutoField(primary_key=True)
    plataforma = models.CharField(max_length=255)  # Ej: "Facebook", "Instagram", "Twitter", etc.
    handle = models.CharField(max_length=255, blank=True, null=True)  # Usuario/handle en la red social
    url = models.CharField(max_length=500, blank=True, null=True)  # URL completa del perfil
    
    class Meta:
        db_table = 'redes_sociales'
        verbose_name = 'Red Social'
        verbose_name_plural = 'Redes Sociales'
    
    def __str__(self):
        if self.handle:
            return f"{self.plataforma}: {self.handle}"
        return self.plataforma
