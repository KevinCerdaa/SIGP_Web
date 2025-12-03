from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/user/', views.user_info_view, name='user-info'),
    path('auth/update-profile/', views.update_profile_view, name='update-profile'),
    path('auth/change-password/', views.change_password_view, name='change-password'),
    path('health/', views.health_check, name='health'),
    path('zones/', views.get_zones, name='zones'),
    path('crimes/', views.get_crimes, name='crimes'),
    path('addresses/', views.get_addresses, name='addresses'),
    path('direcciones/', views.get_all_direcciones, name='get-all-direcciones'),
    path('direcciones/create/', views.create_direccion, name='create-direccion'),
    # Pandillas
    path('pandillas/', views.get_all_pandillas, name='get-all-pandillas'),
    path('pandillas/<int:id_pandilla>/', views.get_pandilla, name='get-pandilla'),
    path('pandillas/create/', views.create_pandilla, name='create-pandilla'),
    path('pandillas/<int:id_pandilla>/update/', views.update_pandilla, name='update-pandilla'),
    
    # Integrantes
    path('integrantes/', views.get_all_integrantes, name='get-all-integrantes'),
    path('integrantes/<int:id_integrante>/', views.get_integrante, name='get-integrante'),
    path('integrantes/create/', views.create_integrante, name='create-integrante'),
    path('integrantes/<int:id_integrante>/update/', views.update_integrante, name='update-integrante'),
    
    # Eventos
    path('eventos/', views.get_all_eventos, name='get-all-eventos'),
    path('eventos/<int:id_evento>/', views.get_evento, name='get-evento'),
    path('eventos/create/', views.create_evento, name='create-evento'),
    path('eventos/<int:id_evento>/update/', views.update_evento, name='update-evento'),
    
    # Delitos
    path('delitos/', views.get_all_delitos, name='get-all-delitos'),
    path('delitos/<int:id_delito>/', views.get_delito, name='get-delito'),
    path('delitos/create/', views.create_delito, name='create-delito'),
    path('delitos/<int:id_delito>/update/', views.update_delito, name='update-delito'),
    
    # Faltas
    path('faltas/', views.get_all_faltas, name='get-all-faltas'),
    path('faltas/<int:id_falta>/', views.get_falta, name='get-falta'),
    path('faltas/create/', views.create_falta, name='create-falta'),
    path('faltas/<int:id_falta>/update/', views.update_falta, name='update-falta'),
    
    # Direcciones
    path('direcciones/<int:id_direccion>/', views.get_direccion, name='get-direccion'),
    path('direcciones/<int:id_direccion>/update/', views.update_direccion, name='update-direccion'),
    
    # Rivalidades
    path('rivalidades/', views.get_all_rivalidades, name='get-all-rivalidades'),
    path('rivalidades/<int:id_rivalidad>/', views.get_rivalidad, name='get-rivalidad'),
    path('rivalidades/create/', views.create_rivalidad, name='create-rivalidad'),
    path('rivalidades/<int:id_rivalidad>/update/', views.update_rivalidad, name='update-rivalidad'),
    
    # Redes sociales
    path('redes-sociales/', views.get_all_redes_sociales, name='get-all-redes-sociales'),
    path('redes-sociales/<int:id_red_social>/', views.get_red_social, name='get-red-social'),
    path('redes-sociales/create/', views.create_red_social, name='create-red-social'),
    path('redes-sociales/<int:id_red_social>/update/', views.update_red_social, name='update-red-social'),
    
    # Consultas y reportes
    path('consultas/eventos/', views.consulta_eventos, name='consulta-eventos'),
    path('consultas/pandillas/', views.consulta_pandillas, name='consulta-pandillas'),
    path('consultas/integrantes/', views.consulta_integrantes, name='consulta-integrantes'),
    path('consultas/pandillas/general/', views.consulta_pandillas_general, name='consulta-pandillas-general'),
    
    # Contacto
    path('contacto/', views.send_contact_email, name='send-contact-email'),
]

