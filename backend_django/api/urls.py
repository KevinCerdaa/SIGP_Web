from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/user/', views.user_info_view, name='user-info'),
    path('health/', views.health_check, name='health'),
    path('zones/', views.get_zones, name='zones'),
    path('crimes/', views.get_crimes, name='crimes'),
    path('addresses/', views.get_addresses, name='addresses'),
]

