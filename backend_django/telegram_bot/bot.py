#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bot de Telegram para SIGP - Sistema de Identificación de Grupos Pandilleriles
Conecta con la base de datos de Django para consultar información
"""
import os
import sys
import django
import logging
import asyncio
from dotenv import load_dotenv

# Configurar Django antes de importar modelos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigp_backend.settings')
django.setup()

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, ConversationHandler, MessageHandler, filters
from telegram import InputMediaPhoto
from django.contrib.auth import authenticate
from django.db import connection
from django.db.models import Q
from asgiref.sync import sync_to_async
from api.models import Pandilla, Integrante, Evento, Usuario, Delito, Falta

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Token del bot (debe estar en .env)
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

if not TELEGRAM_BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN no encontrado en .env")
    sys.exit(1)

# Estados de la conversación para autenticación
WAITING_EMAIL, WAITING_PASSWORD = range(2)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /start - Mensaje de bienvenida e inicio de autenticación"""
    logger.info(f"Comando /start recibido de usuario {update.effective_user.id}")
    
    # Verificar si el usuario ya está autenticado
    user = context.user_data.get('authenticated_user')
    
    if user:
        # Si ya está autenticado, mostrar mensaje de bienvenida con comandos
        welcome_message = (
            "🤖 *Bienvenido al Bot de SIGP*\n\n"
            "Sistema de Identificación de Grupos Pandilleriles\n\n"
            "Comandos disponibles:\n"
            "/start - Mostrar este mensaje\n"
            "/pandillas - Listar todas las pandillas\n"
            "/pandilla <nombre> - Buscar información completa de una pandilla\n"
            "/integrantes <pandilla> - Listar integrantes de una pandilla\n"
            "/integrante <nombre o alias> - Buscar información completa de un integrante\n"
            "/eventos - Ver eventos recientes\n"
            "/help - Mostrar ayuda\n"
        )
        await update.message.reply_text(welcome_message, parse_mode='Markdown')
        return ConversationHandler.END
    
    # Si no está autenticado, iniciar proceso de login
    welcome_message = (
        "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
        "Sistema de Identificación de Grupos Pandilleriles\n\n"
        "Para acceder a las consultas, necesito que te autentiques.\n\n"
        "Escribe tu correo y contraseña para iniciar sesión.\n\n"
        "📧 *Por favor, ingresa tu correo electrónico:*"
    )
    await update.message.reply_text(welcome_message, parse_mode='Markdown')
    logger.info(f"Usuario {update.effective_user.id} inició proceso de autenticación")
    # Retornar el estado para que el ConversationHandler sepa que estamos esperando el email
    return WAITING_EMAIL


async def receive_email(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Recibe el correo electrónico del usuario"""
    email = update.message.text.strip()
    
    # Validar formato básico de email
    if '@' not in email or '.' not in email.split('@')[1]:
        await update.message.reply_text(
            "❌ El formato del correo no es válido.\n\n"
            "Por favor, ingresa un correo electrónico válido:"
        )
        return WAITING_EMAIL
    
    # Normalizar el correo (igual que Django lo hace al guardarlo)
    # Django usa normalize_email del BaseUserManager
    try:
        # Normalizar el correo usando el manager de Usuario (sync_to_async)
        normalized_email = await sync_to_async(Usuario.objects.normalize_email)(email)
        logger.info(f"Correo original: {email}, normalizado: {normalized_email}")
    except Exception as e:
        logger.warning(f"No se pudo normalizar el correo: {e}, usando el original")
        normalized_email = email.lower().strip()
    
    # Guardar el correo normalizado en el contexto
    context.user_data['email'] = normalized_email
    
    # Verificar si el correo existe en la base de datos
    try:
        # Buscar con correo normalizado y case-insensitive (usar sync_to_async)
        # Usar __iexact para búsqueda case-insensitive
        usuario = await sync_to_async(lambda: Usuario.objects.filter(correo__iexact=normalized_email).first())()
        
        if not usuario:
            # Intentar también con el correo original por si acaso
            usuario = await sync_to_async(lambda: Usuario.objects.filter(correo__iexact=email).first())()
            if usuario:
                # Si se encuentra con el original, actualizar el contexto
                context.user_data['email'] = usuario.correo
                logger.info(f"Usuario encontrado con correo original: {email}")
        
        if not usuario:
            logger.warning(f"Usuario no encontrado con correo: {email} (normalizado: {normalized_email})")
            # Listar algunos correos de ejemplo para debugging (solo en desarrollo)
            if logger.level == logging.DEBUG:
                usuarios_ejemplo = await sync_to_async(list)(Usuario.objects.all()[:3])
                correos_ejemplo = [u.correo for u in usuarios_ejemplo]
                logger.debug(f"Correos en BD (ejemplos): {correos_ejemplo}")
            
            await update.message.reply_text(
                "❌ No se encontró un usuario con ese correo electrónico.\n\n"
                "Por favor, verifica tu correo e intenta nuevamente.\n\n"
                "O escribe /cancel para cancelar."
            )
            return WAITING_EMAIL
        
        if not usuario.is_active:
            await update.message.reply_text(
                "❌ Tu cuenta está desactivada.\n\n"
                "Contacta al administrador para más información.\n\n"
                "Escribe /cancel para cancelar."
            )
            return ConversationHandler.END
        
        # Asegurarse de usar el correo exacto de la BD para autenticación
        context.user_data['email'] = usuario.correo
        
        # Pedir la contraseña
        await update.message.reply_text(
            f"✅ Correo encontrado: *{usuario.correo}*\n\n"
            "🔒 *Ahora ingresa tu contraseña:*",
            parse_mode='Markdown'
        )
        return WAITING_PASSWORD
    except Exception as e:
        logger.error(f"Error al buscar usuario: {e}", exc_info=True)
        await update.message.reply_text(
            "❌ Error al verificar el correo. Intenta más tarde.\n\n"
            "Escribe /cancel para cancelar."
        )
        return WAITING_EMAIL


async def receive_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Recibe la contraseña del usuario y autentica"""
    password = update.message.text
    email = context.user_data.get('email')
    
    if not email:
        await update.message.reply_text(
            "❌ Error: No se encontró el correo. Por favor, inicia sesión nuevamente con /start"
        )
        return ConversationHandler.END
    
    try:
        # Asegurarse de usar el correo exacto de la BD (usar sync_to_async)
        # Primero intentar obtener el usuario directamente
        try:
            usuario_bd = await sync_to_async(lambda: Usuario.objects.get(correo=email))()
            email_exacto = usuario_bd.correo
        except Usuario.DoesNotExist:
            # Si no se encuentra, intentar con búsqueda case-insensitive
            usuario_bd = await sync_to_async(lambda: Usuario.objects.filter(correo__iexact=email).first())()
            if usuario_bd:
                email_exacto = usuario_bd.correo
            else:
                email_exacto = email
        
        logger.info(f"Intentando autenticar con correo: {email_exacto}")
        
        # Autenticar usando Django (usa check_password internamente con PBKDF2)
        # authenticate() usa el USERNAME_FIELD que es 'correo'
        # authenticate es síncrono, necesitamos sync_to_async
        user = await sync_to_async(authenticate)(username=email_exacto, password=password)
        
        if user:
            # Usuario autenticado correctamente
            context.user_data['authenticated_user'] = user
            context.user_data['email'] = None  # Limpiar el email del contexto
            
            # Mensaje de bienvenida después de autenticación (el mismo que se muestra en /start cuando ya está autenticado)
            welcome_message = (
                "🤖 *Bienvenido al Bot de SIGP*\n\n"
                "Sistema de Identificación de Grupos Pandilleriles\n\n"
                "Comandos disponibles:\n"
                "/start - Mostrar este mensaje\n"
                "/pandillas - Listar todas las pandillas\n"
                "/pandilla <nombre> - Buscar una pandilla específica\n"
                "/integrantes <pandilla> - Listar integrantes de una pandilla\n"
                "/eventos - Ver eventos recientes\n"
                "/help - Mostrar ayuda\n"
            )
            await update.message.reply_text(welcome_message, parse_mode='Markdown')
            return ConversationHandler.END
        else:
            # Contraseña incorrecta
            await update.message.reply_text(
                "❌ *Contraseña incorrecta*\n\n"
                "Por favor, intenta nuevamente:\n\n"
                "🔒 Ingresa tu contraseña:",
                parse_mode='Markdown'
            )
            return WAITING_PASSWORD
    except Exception as e:
        logger.error(f"Error al autenticar: {e}")
        await update.message.reply_text(
            "❌ Error al procesar la autenticación. Intenta más tarde.\n\n"
            "Escribe /cancel para cancelar."
        )
        return WAITING_PASSWORD


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancela el proceso de autenticación"""
    context.user_data.clear()
    await update.message.reply_text(
        "❌ Proceso de autenticación cancelado.\n\n"
        "Escribe /start para iniciar sesión nuevamente."
    )
    return ConversationHandler.END


async def logout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cierra la sesión del usuario"""
    user = context.user_data.get('authenticated_user')
    
    if user:
        nombre = user.nombre
        context.user_data.clear()
        await update.message.reply_text(
            f"👋 *Sesión cerrada*\n\n"
            f"Adiós, {nombre}.\n\n"
            "Escribe /start para iniciar sesión nuevamente.",
            parse_mode='Markdown'
        )
    else:
        await update.message.reply_text(
            "ℹ️ No hay una sesión activa.\n\n"
            "Escribe /start para iniciar sesión."
        )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /help - Mostrar ayuda"""
    user = context.user_data.get('authenticated_user')
    
    if user:
        help_text = (
            "📚 *Ayuda del Bot SIGPY*\n\n"
            "*Comandos disponibles:*\n\n"
            "`/start` - Reiniciar o ver estado de sesión\n"
            "`/pandillas` - Lista todas las pandillas registradas\n"
            "`/pandilla <nombre>` - Busca información completa de una pandilla\n"
            "`/integrantes <pandilla>` - Lista los integrantes de una pandilla\n"
            "`/integrante <nombre o alias>` - Busca información completa de un integrante\n"
            "`/eventos` - Muestra los últimos 10 eventos registrados\n"
            "`/logout` - Cerrar sesión\n"
            "`/help` - Muestra esta ayuda\n\n"
            "*Ejemplos:*\n"
            "`/pandilla Los Zetas`\n"
            "`/integrantes Los Zetas`\n"
            "`/integrante Juan Pérez`\n"
            "`/integrante El Chino`\n"
        )
    else:
        help_text = (
            "📚 *Ayuda del Bot SIGPY*\n\n"
            "Para usar este bot, primero debes autenticarte.\n\n"
            "*Comandos disponibles:*\n\n"
            "`/start` - Iniciar sesión (requiere correo y contraseña)\n"
            "`/help` - Muestra esta ayuda\n\n"
            "Una vez autenticado, tendrás acceso a más comandos para consultar información sobre pandillas, integrantes y eventos."
        )
    
    await update.message.reply_text(help_text, parse_mode='Markdown')


def require_auth(func):
    """Decorador para requerir autenticación en comandos"""
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = context.user_data.get('authenticated_user')
        if not user:
            await update.message.reply_text(
                "🔒 *Acceso restringido*\n\n"
                "Debes iniciar sesión para usar este comando.\n\n"
                "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
                "Escribe /start para autenticarte.",
                parse_mode='Markdown'
            )
            return None
        return await func(update, context)
    return wrapper


async def listar_pandillas(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /pandillas - Listar todas las pandillas"""
    # Verificar autenticación manualmente
    user = context.user_data.get('authenticated_user')
    if not user:
        await update.message.reply_text(
            "🔒 *Acceso restringido*\n\n"
            "Debes iniciar sesión para usar este comando.\n\n"
            "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
            "Escribe /start para autenticarte.",
            parse_mode='Markdown'
        )
        return
    
    try:
        pandillas = await sync_to_async(list)(Pandilla.objects.all().order_by('nombre'))
        
        if not pandillas:
            await update.message.reply_text("No hay pandillas registradas en la base de datos.")
            return
        
        message = "📋 *Lista de Pandillas:*\n\n"
        for pandilla in pandillas:
            peligrosidad_emoji = {
                'Bajo': '🟢',
                'Medio': '🟡',
                'Alto': '🔴'
            }.get(pandilla.peligrosidad, '⚪')
            
            message += f"{peligrosidad_emoji} *{pandilla.nombre}*\n"
            if pandilla.numero_integrantes:
                message += f"   👥 Integrantes: {pandilla.numero_integrantes}\n"
            message += f"   ⚠️ Peligrosidad: {pandilla.peligrosidad}\n\n"
        
        # Telegram tiene límite de 4096 caracteres por mensaje
        if len(message) > 4000:
            message = message[:4000] + "\n\n... (mensaje truncado)"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    except Exception as e:
        logger.error(f"Error al listar pandillas: {e}")
        await update.message.reply_text("❌ Error al consultar las pandillas. Intenta más tarde.")


async def buscar_pandilla(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /pandilla <nombre> - Buscar información de una pandilla"""
    # Verificar autenticación manualmente
    user = context.user_data.get('authenticated_user')
    if not user:
        await update.message.reply_text(
            "🔒 *Acceso restringido*\n\n"
            "Debes iniciar sesión para usar este comando.\n\n"
            "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
            "Escribe /start para autenticarte.",
            parse_mode='Markdown'
        )
        return
    
    if not context.args:
        await update.message.reply_text(
            "❌ Debes especificar el nombre de la pandilla.\n"
            "Ejemplo: `/pandilla Los Zetas`", 
            parse_mode='Markdown'
        )
        return
    
    nombre_buscar = ' '.join(context.args)
    
    try:
        pandilla = await sync_to_async(lambda: Pandilla.objects.filter(nombre__icontains=nombre_buscar).first())()
        
        if not pandilla:
            await update.message.reply_text(
                f"❌ No se encontró ninguna pandilla con el nombre '{nombre_buscar}'"
            )
            return
        
        peligrosidad_emoji = {
            'Bajo': '🟢',
            'Medio': '🟡',
            'Alto': '🔴'
        }.get(pandilla.peligrosidad, '⚪')
        
        message = f"📊 *Información de la Pandilla*\n\n"
        message += f"*Nombre:* {pandilla.nombre}\n"
        message += f"*Peligrosidad:* {peligrosidad_emoji} {pandilla.peligrosidad}\n"
        
        if pandilla.lider:
            message += f"*Líder:* {pandilla.lider}\n"
        if pandilla.numero_integrantes:
            message += f"*Número de integrantes:* {pandilla.numero_integrantes}\n"
        if pandilla.edades_promedio:
            message += f"*Edad promedio:* {pandilla.edades_promedio} años\n"
        if pandilla.horario_reunion:
            message += f"*Horario de reunión:* {pandilla.horario_reunion}\n"
        if pandilla.descripcion:
            message += f"\n*Descripción:*\n{pandilla.descripcion}\n"
        
        # Obtener delitos asociados
        def get_delitos_faltas(pandilla_id):
            with connection.cursor() as cursor:
                # Obtener delitos
                delitos_nombres = []
                try:
                    cursor.execute("""
                        SELECT D.nombre 
                        FROM pandillas_delitos PD
                        JOIN delitos D ON PD.id_delito = D.id_delito
                        WHERE PD.id_pandilla = %s
                    """, [pandilla_id])
                    delitos_nombres = [row[0] for row in cursor.fetchall()]
                except Exception:
                    pass
                
                # Obtener faltas
                faltas_nombres = []
                try:
                    cursor.execute("""
                        SELECT F.nombre 
                        FROM pandillas_faltas PF
                        JOIN faltas F ON PF.id_falta = F.id_falta
                        WHERE PF.id_pandilla = %s
                    """, [pandilla_id])
                    faltas_nombres = [row[0] for row in cursor.fetchall()]
                except Exception:
                    pass
                
                return delitos_nombres, faltas_nombres
        
        delitos, faltas = await sync_to_async(get_delitos_faltas)(pandilla.id_pandilla)
        
        if delitos:
            message += f"\n*Delitos asociados:*\n"
            for delito in delitos:
                message += f"  • {delito}\n"
        else:
            message += f"\n*Delitos asociados:* Ninguno registrado\n"
        
        if faltas:
            message += f"\n*Faltas cometidas:*\n"
            for falta in faltas:
                message += f"  • {falta}\n"
        else:
            message += f"\n*Faltas cometidas:* Ninguna registrada\n"
        
        # Lugar de reunión principal y enlace de Google Maps
        if pandilla.id_direccion:
            direccion = await sync_to_async(lambda: pandilla.id_direccion)()
            if direccion:
                lugar_reunion = f"{direccion.calle}"
                if direccion.numero:
                    lugar_reunion += f" {direccion.numero}"
                if direccion.colonia:
                    lugar_reunion += f", {direccion.colonia}"
                
                message += f"\n*Lugar de reunión principal:*\n{lugar_reunion}\n"
                
                # Generar enlace de Google Maps
                if direccion.latitud and direccion.longitud:
                    maps_url = f"https://www.google.com/maps?q={direccion.latitud},{direccion.longitud}"
                    message += f"📍 [Ver en Google Maps]({maps_url})\n"
        
        # Contar integrantes reales
        num_integrantes_real = await sync_to_async(lambda: Integrante.objects.filter(id_pandilla=pandilla).count())()
        if num_integrantes_real > 0:
            message += f"\n*Integrantes registrados:* {num_integrantes_real}\n"
            message += f"Usa `/integrantes {pandilla.nombre}` para ver la lista completa"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    except Exception as e:
        logger.error(f"Error al buscar pandilla: {e}")
        await update.message.reply_text("❌ Error al buscar la pandilla. Intenta más tarde.")


async def listar_integrantes(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /integrantes <pandilla> - Listar integrantes de una pandilla"""
    # Verificar autenticación manualmente
    user = context.user_data.get('authenticated_user')
    if not user:
        await update.message.reply_text(
            "🔒 *Acceso restringido*\n\n"
            "Debes iniciar sesión para usar este comando.\n\n"
            "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
            "Escribe /start para autenticarte.",
            parse_mode='Markdown'
        )
        return
    
    if not context.args:
        await update.message.reply_text(
            "❌ Debes especificar el nombre de la pandilla.\n"
            "Ejemplo: `/integrantes Los Zetas`", 
            parse_mode='Markdown'
        )
        return
    
    nombre_pandilla = ' '.join(context.args)
    
    try:
        pandilla = await sync_to_async(lambda: Pandilla.objects.filter(nombre__icontains=nombre_pandilla).first())()
        
        if not pandilla:
            await update.message.reply_text(
                f"❌ No se encontró ninguna pandilla con el nombre '{nombre_pandilla}'"
            )
            return
        
        # Obtener el ID de la pandilla para el filtro
        pandilla_id = pandilla.id_pandilla
        integrantes = await sync_to_async(lambda: list(Integrante.objects.filter(id_pandilla=pandilla).order_by('nombre')))()
        
        if not integrantes:
            await update.message.reply_text(
                f"ℹ️ No hay integrantes registrados para la pandilla '{pandilla.nombre}'"
            )
            return
        
        message = f"👥 *Integrantes de {pandilla.nombre}:*\n\n"
        
        for integrante in integrantes[:20]:  # Limitar a 20 para no exceder límite
            nombre_completo = integrante.nombre
            if integrante.apellido_paterno:
                nombre_completo += f" {integrante.apellido_paterno}"
            if integrante.apellido_materno:
                nombre_completo += f" {integrante.apellido_materno}"
            
            message += f"• *{nombre_completo}*"
            if integrante.alias:
                message += f" (Alias: {integrante.alias})"
            if integrante.fecha_nacimiento:
                message += f"\n  📅 Nacimiento: {integrante.fecha_nacimiento}"
            message += "\n\n"
        
        if len(integrantes) > 20:
            message += f"\n... y {len(integrantes) - 20} más"
        
        if len(message) > 4000:
            message = message[:4000] + "\n\n... (mensaje truncado)"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    except Exception as e:
        logger.error(f"Error al listar integrantes: {e}", exc_info=True)
        await update.message.reply_text("❌ Error al consultar los integrantes. Intenta más tarde.")


async def listar_eventos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /eventos - Listar eventos recientes"""
    # Verificar autenticación manualmente
    user = context.user_data.get('authenticated_user')
    if not user:
        await update.message.reply_text(
            "🔒 *Acceso restringido*\n\n"
            "Debes iniciar sesión para usar este comando.\n\n"
            "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
            "Escribe /start para autenticarte.",
            parse_mode='Markdown'
        )
        return
    
    try:
        # Usar select_related para cargar las relaciones de una vez y evitar consultas adicionales
        eventos = await sync_to_async(lambda: list(
            Evento.objects.select_related('id_integrante', 'id_pandilla')
            .all()
            .order_by('-fecha', '-hora')[:10]
        ))()
        
        if not eventos:
            await update.message.reply_text("No hay eventos registrados en la base de datos.")
            return
        
        message = "📅 *Eventos Recientes:*\n\n"
        
        for evento in eventos:
            tipo_emoji = {
                'riña': '⚔️',
                'delito': '🚨',
                'falta': '⚠️'
            }.get(evento.tipo.lower() if evento.tipo else 'riña', '📌')
            
            message += f"{tipo_emoji} *{evento.tipo.upper() if evento.tipo else 'EVENTO'}*\n"
            message += f"📅 Fecha: {evento.fecha}"
            if evento.hora:
                message += f" 🕐 {evento.hora}"
            message += "\n"
            
            # Acceder a los campos relacionados de forma segura
            if evento.id_integrante:
                integrante_nombre = str(evento.id_integrante)
                message += f"👤 Integrante: {integrante_nombre}\n"
            if evento.id_pandilla:
                pandilla_nombre = evento.id_pandilla.nombre if evento.id_pandilla else "Sin nombre"
                message += f"🏴 Pandilla: {pandilla_nombre}\n"
            if evento.descripcion:
                desc = evento.descripcion[:100] if evento.descripcion else ""
                if len(evento.descripcion) > 100:
                    desc += "..."
                message += f"📝 {desc}\n"
            
            message += "\n"
        
        if len(message) > 4000:
            message = message[:4000] + "\n\n... (mensaje truncado)"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    except Exception as e:
        logger.error(f"Error al listar eventos: {e}", exc_info=True)
        await update.message.reply_text("❌ Error al consultar los eventos. Intenta más tarde.")


async def buscar_integrante(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Comando /integrante <nombre o alias> - Buscar información de un integrante"""
    # Verificar autenticación manualmente
    user = context.user_data.get('authenticated_user')
    if not user:
        await update.message.reply_text(
            "🔒 *Acceso restringido*\n\n"
            "Debes iniciar sesión para usar este comando.\n\n"
            "👋 *Hola, soy SIGPY, tu bot de consultas*\n\n"
            "Escribe /start para autenticarte.",
            parse_mode='Markdown'
        )
        return
    
    if not context.args:
        await update.message.reply_text(
            "❌ Debes especificar el nombre o alias del integrante.\n"
            "Ejemplo: `/integrante Juan Pérez` o `/integrante El Chino`", 
            parse_mode='Markdown'
        )
        return
    
    criterio_busqueda = ' '.join(context.args)
    
    try:
        # Buscar por nombre o alias
        def buscar_integrante_db(criterio):
            return list(Integrante.objects.filter(
                Q(nombre__icontains=criterio) |
                Q(apellido_paterno__icontains=criterio) |
                Q(apellido_materno__icontains=criterio) |
                Q(alias__icontains=criterio)
            )[:10])  # Limitar a 10 resultados
        
        integrantes = await sync_to_async(buscar_integrante_db)(criterio_busqueda)
        
        if not integrantes:
            await update.message.reply_text(
                f"❌ No se encontró ningún integrante con el criterio '{criterio_busqueda}'"
            )
            return
        
        # Si hay múltiples resultados, mostrar lista
        if len(integrantes) > 1:
            message = f"🔍 *Se encontraron {len(integrantes)} integrantes:*\n\n"
            for i, integrante in enumerate(integrantes, 1):
                nombre_completo = integrante.nombre
                if integrante.apellido_paterno:
                    nombre_completo += f" {integrante.apellido_paterno}"
                if integrante.apellido_materno:
                    nombre_completo += f" {integrante.apellido_materno}"
                alias_text = f" ({integrante.alias})" if integrante.alias else ""
                message += f"{i}. *{nombre_completo}*{alias_text}\n"
            message += "\nEspecifica más el nombre o alias para obtener información detallada."
            await update.message.reply_text(message, parse_mode='Markdown')
            return
        
        # Un solo resultado, mostrar información completa
        integrante = integrantes[0]
        
        # Obtener información completa del integrante
        def get_integrante_info(integrante_id):
            with connection.cursor() as cursor:
                # Obtener delitos
                delitos_nombres = []
                try:
                    cursor.execute("""
                        SELECT D.nombre 
                        FROM integrantes_delitos ID
                        JOIN delitos D ON ID.id_delito = D.id_delito
                        WHERE ID.id_integrante = %s
                    """, [integrante_id])
                    delitos_nombres = [row[0] for row in cursor.fetchall()]
                except Exception:
                    pass
                
                # Obtener faltas
                faltas_nombres = []
                try:
                    cursor.execute("""
                        SELECT F.nombre 
                        FROM integrantes_faltas IF
                        JOIN faltas F ON IF.id_falta = F.id_falta
                        WHERE IF.id_integrante = %s
                    """, [integrante_id])
                    faltas_nombres = [row[0] for row in cursor.fetchall()]
                except Exception:
                    pass
                
                # Obtener URL de imagen (primera imagen disponible)
                imagen_url = None
                try:
                    cursor.execute("""
                        SELECT url_imagen 
                        FROM imagenes_integrantes 
                        WHERE id_integrante = %s 
                        ORDER BY fecha_subida DESC 
                        LIMIT 1
                    """, [integrante_id])
                    result = cursor.fetchone()
                    if result and result[0]:
                        imagen_url = result[0]
                except Exception:
                    pass
                
                return delitos_nombres, faltas_nombres, imagen_url
        
        delitos, faltas, imagen_url = await sync_to_async(get_integrante_info)(integrante.id_integrante)
        
        # Construir mensaje con información del integrante
        nombre_completo = integrante.nombre
        if integrante.apellido_paterno:
            nombre_completo += f" {integrante.apellido_paterno}"
        if integrante.apellido_materno:
            nombre_completo += f" {integrante.apellido_materno}"
        
        message = f"👤 *Información del Integrante*\n\n"
        message += f"*Nombre completo:* {nombre_completo}\n"
        
        if integrante.alias:
            message += f"*Alias:* {integrante.alias}\n"
        
        if integrante.fecha_nacimiento:
            message += f"*Fecha de nacimiento:* {integrante.fecha_nacimiento}\n"
        
        # Pandilla a la que pertenece
        if integrante.id_pandilla:
            pandilla = await sync_to_async(lambda: integrante.id_pandilla)()
            if pandilla:
                message += f"*Pandilla:* {pandilla.nombre}\n"
        
        # Delitos asociados
        if delitos:
            message += f"\n*Delitos asociados:*\n"
            for delito in delitos:
                message += f"  • {delito}\n"
        else:
            message += f"\n*Delitos asociados:* Ninguno registrado\n"
        
        # Faltas asociadas
        if faltas:
            message += f"\n*Faltas asociadas:*\n"
            for falta in faltas:
                message += f"  • {falta}\n"
        else:
            message += f"\n*Faltas asociadas:* Ninguna registrada\n"
        
        # Dirección
        if integrante.id_direccion:
            direccion = await sync_to_async(lambda: integrante.id_direccion)()
            if direccion:
                dir_text = f"{direccion.calle}"
                if direccion.numero:
                    dir_text += f" {direccion.numero}"
                if direccion.colonia:
                    dir_text += f", {direccion.colonia}"
                message += f"\n*Dirección:* {dir_text}\n"
        
        # Enviar mensaje de texto primero
        await update.message.reply_text(message, parse_mode='Markdown')
        
        # Enviar fotografía si existe
        if imagen_url:
            try:
                await update.message.reply_photo(photo=imagen_url, caption=f"📷 Fotografía de {nombre_completo}")
            except Exception as e:
                logger.warning(f"No se pudo enviar la imagen desde URL {imagen_url}: {e}")
                await update.message.reply_text(f"⚠️ No se pudo cargar la fotografía desde: {imagen_url}")
        else:
            await update.message.reply_text("ℹ️ No hay fotografía registrada para este integrante.")
        
    except Exception as e:
        logger.error(f"Error al buscar integrante: {e}", exc_info=True)
        await update.message.reply_text("❌ Error al buscar el integrante. Intenta más tarde.")


async def main_async():
    """Función asíncrona principal para iniciar el bot"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("Token del bot no configurado. Agrega TELEGRAM_BOT_TOKEN al archivo .env")
        return
    
    # Verificar conexión a la base de datos (usar sync_to_async para operaciones síncronas)
    try:
        logger.info("Verificando conexión a la base de datos...")
        total_usuarios = await sync_to_async(Usuario.objects.count)()
        logger.info(f"✅ Conexión a BD exitosa. Total de usuarios: {total_usuarios}")
        
        if total_usuarios > 0:
            # Mostrar algunos correos de ejemplo para debugging
            usuarios_ejemplo = await sync_to_async(list)(Usuario.objects.all()[:3])
            correos_ejemplo = [u.correo for u in usuarios_ejemplo]
            logger.info(f"Correos de ejemplo en BD: {correos_ejemplo}")
        else:
            logger.warning("⚠️ No hay usuarios en la base de datos")
    except Exception as e:
        logger.error(f"❌ Error al conectar con la base de datos: {e}", exc_info=True)
        logger.error("Asegúrate de que MySQL esté corriendo y la base de datos esté configurada correctamente")
    
    # Crear aplicación del bot
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Crear ConversationHandler para autenticación
    # IMPORTANTE: No incluir /start en fallbacks para evitar que se reinicie el proceso
    auth_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            WAITING_EMAIL: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, receive_email),
                # Permitir que /start cancele y reinicie si están en medio de autenticación
            ],
            WAITING_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, receive_password)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
        # No permitir que otros comandos interrumpan la conversación
        per_chat=True,
        per_user=True,
    )
    
    # Registrar handlers - IMPORTANTE: ConversationHandler debe ir primero
    # para que capture /start antes que otros handlers
    application.add_handler(auth_handler)
    
    # Luego los demás comandos (estos se ejecutarán solo si no están en una conversación)
    application.add_handler(CommandHandler("logout", logout))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("pandillas", listar_pandillas))
    application.add_handler(CommandHandler("pandilla", buscar_pandilla))
    application.add_handler(CommandHandler("integrantes", listar_integrantes))
    application.add_handler(CommandHandler("integrante", buscar_integrante))
    application.add_handler(CommandHandler("eventos", listar_eventos))
    
    logger.info("Bot iniciado. Presiona Ctrl+C para detener.")
    
    # Iniciar el bot usando el context manager (versión 21.x)
    async with application:
        await application.start()
        await application.updater.start_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True
        )
        # Mantener el bot corriendo indefinidamente
        # Usar un bucle infinito con sleep para mantener el bot activo
        # Ctrl+C se capturará en el nivel superior (en main())
        try:
            while True:
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            pass
        finally:
            await application.updater.stop()
            await application.stop()


def main():
    """Función principal para iniciar el bot con asyncio"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("Token del bot no configurado. Agrega TELEGRAM_BOT_TOKEN al archivo .env")
        sys.exit(1)
    
    try:
        asyncio.run(main_async())
    except KeyboardInterrupt:
        logger.info("Bot detenido por el usuario.")
    except Exception as e:
        logger.error(f"Error fatal: {e}")
        raise


if __name__ == '__main__':
    main()

