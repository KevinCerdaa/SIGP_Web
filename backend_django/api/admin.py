from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ('correo', 'nombre', 'apellido', 'rol', 'is_active', 'date_joined')
    list_filter = ('rol', 'is_active', 'date_joined')
    search_fields = ('correo', 'nombre', 'apellido', 'user_name')
    ordering = ('correo',)
    
    fieldsets = (
        (None, {'fields': ('correo', 'password')}),
        ('Información personal', {'fields': ('user_name', 'nombre', 'apellido', 'rol')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('correo', 'user_name', 'nombre', 'apellido', 'rol', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined')
    
    # Remover filter_horizontal ya que nuestro modelo no tiene groups ni user_permissions
    filter_horizontal = ()
