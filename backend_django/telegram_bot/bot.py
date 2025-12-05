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
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Configurar Django antes de importar modelos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigp_backend.settings')
django.setup()

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
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
            "/logout o /cerrar_sesion - Cerrar sesión\n"
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
                "/logout o /cerrar_sesion - Cerrar sesión\n"
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
            "`/logout` o `/cerrar_sesion` - Cerrar sesión\n"
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
    """
    Comando /pandillas - Listar todas las pandillas
    Usa la misma consulta SQL que consulta_pandillas_general del sitio web
    """
    # Verificar autenticación
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
        def obtener_pandillas():
            """Consulta SQL igual a consulta_pandillas_general del sitio web"""
            try:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            P.id_pandilla,
                            P.nombre,
                            P.descripcion,
                            P.lider,
                            P.numero_integrantes,
                            P.edades_promedio,
                            P.horario_reunion,
                            P.peligrosidad,
                            Z.nombre AS zona_nombre,
                            CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) AS direccion
                        FROM pandillas P
                        LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                        LEFT JOIN direcciones DIR ON P.id_direccion = DIR.id_direccion
                        ORDER BY P.nombre
                    """)
                    
                    pandillas_data = []
                    for row in cursor.fetchall():
                        pandillas_data.append({
                            'id_pandilla': row[0],
                            'nombre': row[1],
                            'descripcion': row[2] or '',
                            'lider': row[3] or '',
                            'numero_integrantes': row[4],
                            'edades_promedio': float(row[5]) if row[5] else None,
                            'horario_reunion': row[6] or '',
                            'peligrosidad': row[7],
                            'zona_nombre': row[8],
                            'direccion': row[9] or 'N/A'
                        })
                    return pandillas_data
            except Exception as e:
                logger.error(f"Error en obtener_pandillas: {e}", exc_info=True)
                raise
        
        pandillas = await sync_to_async(obtener_pandillas)()
        
        if not pandillas:
            await update.message.reply_text("No hay pandillas registradas en la base de datos.")
            return
        
        message = "📋 *Lista de Pandillas:*\n\n"
        for pandilla in pandillas:
            peligrosidad_emoji = {
                'Bajo': '🟢',
                'Medio': '🟡',
                'Alto': '🔴'
            }.get(pandilla['peligrosidad'], '⚪')
            
            message += f"{peligrosidad_emoji} *{pandilla['nombre']}*\n"
            if pandilla['numero_integrantes']:
                message += f"   👥 Integrantes: {pandilla['numero_integrantes']}\n"
            message += f"   ⚠️ Peligrosidad: {pandilla['peligrosidad']}\n"
            if pandilla['zona_nombre']:
                message += f"   📍 Zona: {pandilla['zona_nombre']}\n"
            message += "\n"
        
        # Telegram tiene límite de 4096 caracteres por mensaje
        if len(message) > 4000:
            message = message[:4000] + "\n\n... (mensaje truncado)"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    except Exception as e:
        logger.error(f"Error al listar pandillas: {e}", exc_info=True)
        await update.message.reply_text("❌ Error al consultar las pandillas. Intenta más tarde.")


async def buscar_pandilla(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Comando /pandilla <nombre> - Buscar información de una pandilla
    Usa la misma consulta SQL que consulta_pandillas del sitio web
    """
    # Verificar autenticación
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
        def obtener_pandilla(nombre):
            """Consulta SQL igual a consulta_pandillas del sitio web"""
            try:
                with connection.cursor() as cursor:
                    # Buscar pandillas que coincidan con el nombre (búsqueda parcial)
                    cursor.execute("""
                        SELECT 
                            P.id_pandilla,
                            P.nombre,
                            P.descripcion,
                            P.lider,
                            P.numero_integrantes,
                            P.edades_promedio,
                            P.horario_reunion,
                            P.peligrosidad,
                            Z.nombre AS zona_nombre,
                            CONCAT(DIR.calle, ' ', COALESCE(DIR.numero, ''), ', ', COALESCE(DIR.colonia, '')) AS direccion
                        FROM pandillas P
                        LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                        LEFT JOIN direcciones DIR ON P.id_direccion = DIR.id_direccion
                        WHERE P.nombre LIKE %s
                        ORDER BY P.nombre
                        LIMIT 1
                    """, [f'%{nombre}%'])
                    
                    row = cursor.fetchone()
                    if not row:
                        return None
                    
                    pandilla_id = row[0]
                    
                    # Obtener integrantes de esta pandilla
                    cursor.execute("""
                        SELECT 
                            I.id_integrante,
                            CONCAT(I.nombre, ' ', COALESCE(I.apellido_paterno, ''), ' ', COALESCE(I.apellido_materno, '')) AS nombre_completo,
                            I.alias
                        FROM integrantes I
                        WHERE I.id_pandilla = %s
                        ORDER BY I.nombre
                    """, [pandilla_id])
                    
                    integrantes = []
                    for int_row in cursor.fetchall():
                        integrantes.append({
                            'id_integrante': int_row[0],
                            'nombre_completo': int_row[1].strip() if int_row[1] else '',
                            'alias': int_row[2] or ''
                        })
                    
                    # Obtener delitos
                    delitos = []
                    try:
                        cursor.execute("""
                            SELECT D.nombre 
                            FROM pandillas_delitos PD
                            JOIN delitos D ON PD.id_delito = D.id_delito
                            WHERE PD.id_pandilla = %s
                        """, [pandilla_id])
                        delitos = [row[0] for row in cursor.fetchall()]
                    except Exception:
                        pass
                    
                    # Obtener faltas
                    faltas = []
                    try:
                        cursor.execute("""
                            SELECT F.falta 
                            FROM pandillas_faltas PF
                            JOIN faltas F ON PF.id_falta = F.id_falta
                            WHERE PF.id_pandilla = %s
                        """, [pandilla_id])
                        faltas = [row[0] for row in cursor.fetchall()]
                    except Exception:
                        try:
                            # Intentar con columna 'nombre' si 'falta' no existe
                            cursor.execute("""
                                SELECT F.nombre 
                                FROM pandillas_faltas PF
                                JOIN faltas F ON PF.id_falta = F.id_falta
                                WHERE PF.id_pandilla = %s
                            """, [pandilla_id])
                            faltas = [row[0] for row in cursor.fetchall()]
                        except Exception:
                            pass
                    
                    return {
                        'id_pandilla': pandilla_id,
                        'nombre': row[1],
                        'descripcion': row[2] or '',
                        'lider': row[3] or '',
                        'numero_integrantes': row[4],
                        'edades_promedio': float(row[5]) if row[5] else None,
                        'horario_reunion': row[6] or '',
                        'peligrosidad': row[7],
                        'zona_nombre': row[8],
                        'direccion': row[9] or 'N/A',
                        'integrantes': integrantes,
                        'delitos': delitos,
                        'faltas': faltas
                    }
            except Exception as e:
                logger.error(f"Error en obtener_pandilla: {e}", exc_info=True)
                raise
        
        pandilla = await sync_to_async(obtener_pandilla)(nombre_buscar)
        
        if not pandilla:
            await update.message.reply_text(
                f"❌ No se encontró ninguna pandilla con el nombre '{nombre_buscar}'"
            )
            return
        
        peligrosidad_emoji = {
            'Bajo': '🟢',
            'Medio': '🟡',
            'Alto': '🔴'
        }.get(pandilla['peligrosidad'], '⚪')
        
        message = f"📊 *Información de la Pandilla*\n\n"
        message += f"*Nombre:* {pandilla['nombre']}\n"
        message += f"*Peligrosidad:* {peligrosidad_emoji} {pandilla['peligrosidad']}\n"
        
        if pandilla['lider']:
            message += f"*Líder:* {pandilla['lider']}\n"
        if pandilla['numero_integrantes']:
            message += f"*Número de integrantes:* {pandilla['numero_integrantes']}\n"
        if pandilla['edades_promedio']:
            message += f"*Edad promedio:* {pandilla['edades_promedio']} años\n"
        if pandilla['horario_reunion']:
            message += f"*Horario de reunión:* {pandilla['horario_reunion']}\n"
        if pandilla['zona_nombre']:
            message += f"*Zona:* {pandilla['zona_nombre']}\n"
        # Crear botón de Google Maps si hay dirección
        reply_markup = None
        if pandilla['direccion'] and pandilla['direccion'] != 'N/A':
            message += f"*Dirección:* {pandilla['direccion']}\n"
            # Crear botón para ver en Google Maps
            direccion_codificada = quote_plus(pandilla['direccion'])
            google_maps_url = f"https://www.google.com/maps/search/?api=1&query={direccion_codificada}"
            keyboard = [[InlineKeyboardButton("📍 Ver en Google Maps", url=google_maps_url)]]
            reply_markup = InlineKeyboardMarkup(keyboard)
        elif pandilla['direccion']:
            message += f"*Dirección:* {pandilla['direccion']}\n"
        
        if pandilla['descripcion']:
            message += f"\n*Descripción:*\n{pandilla['descripcion']}\n"
        
        # Delitos asociados
        if pandilla['delitos']:
            message += f"\n*Delitos asociados:*\n"
            for delito in pandilla['delitos'][:10]:  # Limitar a 10
                message += f"  • {delito}\n"
        else:
            message += f"\n*Delitos asociados:* Ninguno registrado\n"
        
        # Faltas cometidas
        if pandilla['faltas']:
            message += f"\n*Faltas cometidas:*\n"
            for falta in pandilla['faltas'][:10]:  # Limitar a 10
                message += f"  • {falta}\n"
        else:
            message += f"\n*Faltas cometidas:* Ninguna registrada\n"
        
        # Integrantes
        if pandilla['integrantes']:
            message += f"\n*Integrantes registrados:* {len(pandilla['integrantes'])}\n"
            message += f"Usa `/integrantes {pandilla['nombre']}` para ver la lista completa"
        
        await update.message.reply_text(message, parse_mode='Markdown', reply_markup=reply_markup)
    except Exception as e:
        logger.error(f"Error al buscar pandilla: {e}", exc_info=True)
        error_msg = f"❌ Error al buscar la pandilla: {str(e)}"
        if len(error_msg) > 4000:
            error_msg = error_msg[:4000]
        await update.message.reply_text(error_msg)


async def listar_integrantes(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Comando /integrantes <pandilla> - Listar integrantes de una pandilla
    Usa la misma consulta SQL que consulta_pandillas del sitio web (sección de integrantes)
    """
    # Verificar autenticación
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
        def obtener_integrantes_pandilla(nombre):
            """Consulta SQL igual a la sección de integrantes en consulta_pandillas del sitio web"""
            try:
                with connection.cursor() as cursor:
                    # Primero buscar la pandilla
                    cursor.execute("""
                        SELECT id_pandilla, nombre
                        FROM pandillas
                        WHERE nombre LIKE %s
                        LIMIT 1
                    """, [f'%{nombre}%'])
                    
                    pandilla_row = cursor.fetchone()
                    if not pandilla_row:
                        return None, []
                    
                    pandilla_id = pandilla_row[0]
                    pandilla_nombre = pandilla_row[1]
                    
                    # Obtener integrantes de esta pandilla (misma consulta que el sitio web)
                    cursor.execute("""
                        SELECT 
                            I.id_integrante,
                            CONCAT(I.nombre, ' ', COALESCE(I.apellido_paterno, ''), ' ', COALESCE(I.apellido_materno, '')) AS nombre_completo,
                            I.alias
                        FROM integrantes I
                        WHERE I.id_pandilla = %s
                        ORDER BY I.nombre
                    """, [pandilla_id])
                    
                    integrantes = []
                    for int_row in cursor.fetchall():
                        integrantes.append({
                            'id_integrante': int_row[0],
                            'nombre_completo': int_row[1].strip() if int_row[1] else '',
                            'alias': int_row[2] or ''
                        })
                    
                    return pandilla_nombre, integrantes
            except Exception as e:
                logger.error(f"Error en obtener_integrantes_pandilla: {e}", exc_info=True)
                raise
        
        pandilla_nombre, integrantes = await sync_to_async(obtener_integrantes_pandilla)(nombre_pandilla)
        
        if not pandilla_nombre:
            await update.message.reply_text(
                f"❌ No se encontró ninguna pandilla con el nombre '{nombre_pandilla}'"
            )
            return
        
        if not integrantes:
            await update.message.reply_text(
                f"ℹ️ No hay integrantes registrados para la pandilla '{pandilla_nombre}'"
            )
            return
        
        message = f"👥 *Integrantes de {pandilla_nombre}:*\n\n"
        
        for integrante in integrantes[:20]:  # Limitar a 20 para no exceder límite
            nombre_completo = integrante['nombre_completo'] or 'Sin nombre'
            message += f"• *{nombre_completo}*"
            if integrante['alias']:
                message += f" (Alias: {integrante['alias']})"
            message += "\n"
        
        if len(integrantes) > 20:
            message += f"\n... y {len(integrantes) - 20} más"
        
        if len(message) > 4000:
            message = message[:4000] + "\n\n... (mensaje truncado)"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    except Exception as e:
        logger.error(f"Error al listar integrantes: {e}", exc_info=True)
        await update.message.reply_text("❌ Error al consultar los integrantes. Intenta más tarde.")


async def listar_eventos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Comando /eventos - Listar eventos recientes
    Usa la misma consulta SQL que consulta_eventos del sitio web (adaptada para últimos eventos)
    """
    # Verificar autenticación
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
        def obtener_eventos():
            """Consulta SQL basada en consulta_eventos del sitio web"""
            try:
                with connection.cursor() as cursor:
                    # Verificar que la tabla existe
                    cursor.execute("SHOW TABLES LIKE 'eventos'")
                    if not cursor.fetchone():
                        return []
                    
                    # Verificar qué columnas existen en la tabla
                    cursor.execute("SHOW COLUMNS FROM eventos")
                    columnas_existentes = [row[0] for row in cursor.fetchall()]
                    tiene_id_zona = 'id_zona' in columnas_existentes
                    tiene_id_integrante = 'id_integrante' in columnas_existentes
                    
                    # Construir la consulta base según las columnas disponibles (igual que el sitio web)
                    if tiene_id_zona:
                        query_base = """
                            SELECT 
                                E.id_evento,
                                E.id_delito,
                                E.id_falta,
                                E.id_integrante,
                                E.id_pandilla,
                                E.id_zona,
                                E.id_direccion,
                                E.fecha,
                                E.hora,
                                E.descripcion
                            FROM eventos E
                            WHERE E.fecha IS NOT NULL 
                            ORDER BY E.fecha DESC, E.hora DESC, E.id_evento DESC
                            LIMIT 10
                        """
                    else:
                        query_base = """
                            SELECT 
                                E.id_evento,
                                E.id_delito,
                                E.id_falta,
                                E.id_integrante,
                                E.id_pandilla,
                                E.id_direccion,
                                E.fecha,
                                E.hora,
                                E.descripcion
                            FROM eventos E
                            WHERE E.fecha IS NOT NULL 
                            ORDER BY E.fecha DESC, E.hora DESC, E.id_evento DESC
                            LIMIT 10
                        """
                    
                    cursor.execute(query_base)
                    eventos_raw = cursor.fetchall()
                    eventos = []
                    
                    for evento_row in eventos_raw:
                        # Mapear índices según si tiene id_zona o no (igual que el sitio web)
                        if tiene_id_zona:
                            evento_id = evento_row[0]
                            id_delito = evento_row[1]
                            id_falta = evento_row[2]
                            id_integrante = evento_row[3]
                            id_pandilla = evento_row[4]
                            id_zona = evento_row[5]
                            id_direccion = evento_row[6]
                            fecha = evento_row[7]
                            hora = evento_row[8]
                            descripcion = evento_row[9]
                        else:
                            evento_id = evento_row[0]
                            id_delito = evento_row[1]
                            id_falta = evento_row[2]
                            id_integrante = evento_row[3]
                            id_pandilla = evento_row[4]
                            id_direccion = evento_row[5]
                            fecha = evento_row[6]
                            hora = evento_row[7]
                            descripcion = evento_row[8]
                            id_zona = None
                        
                        # Determinar el tipo (igual que el sitio web)
                        tipo_evento = 'riña'
                        if id_delito:
                            tipo_evento = 'delito'
                        elif id_falta:
                            tipo_evento = 'falta'
                        
                        # Obtener delito
                        delito_nombre = ''
                        if id_delito:
                            try:
                                cursor.execute("SELECT nombre FROM delitos WHERE id_delito = %s", [id_delito])
                                delito_result = cursor.fetchone()
                                if delito_result:
                                    delito_nombre = delito_result[0] or ''
                            except Exception:
                                pass
                        
                        # Obtener falta
                        falta_nombre = ''
                        if id_falta:
                            try:
                                cursor.execute("SELECT nombre FROM faltas WHERE id_falta = %s", [id_falta])
                                falta_result = cursor.fetchone()
                                if falta_result:
                                    falta_nombre = falta_result[0] or ''
                            except Exception:
                                try:
                                    # Intentar con columna 'falta' si 'nombre' no existe
                                    cursor.execute("SELECT falta FROM faltas WHERE id_falta = %s", [id_falta])
                                    falta_result = cursor.fetchone()
                                    if falta_result:
                                        falta_nombre = falta_result[0] or ''
                                except Exception:
                                    pass
                        
                        # Obtener integrante
                        integrante_nombre = ''
                        if id_integrante and tiene_id_integrante:
                            try:
                                cursor.execute("""
                                    SELECT CONCAT(
                                        COALESCE(nombre, ''), ' ',
                                        COALESCE(apellido_paterno, ''), ' ',
                                        COALESCE(apellido_materno, '')
                                    )
                                    FROM integrantes WHERE id_integrante = %s
                                """, [id_integrante])
                                integrante_result = cursor.fetchone()
                                if integrante_result and integrante_result[0]:
                                    integrante_nombre = integrante_result[0].strip()
                            except Exception:
                                pass
                        
                        # Obtener pandilla
                        pandilla_nombre = ''
                        if id_pandilla:
                            try:
                                cursor.execute("SELECT nombre FROM pandillas WHERE id_pandilla = %s", [id_pandilla])
                                pandilla_result = cursor.fetchone()
                                if pandilla_result:
                                    pandilla_nombre = pandilla_result[0] or ''
                            except Exception:
                                pass
                        
                        # Obtener zona
                        zona_nombre = ''
                        if id_zona:
                            try:
                                cursor.execute("SELECT nombre FROM zonas WHERE id_zona = %s", [id_zona])
                                zona_result = cursor.fetchone()
                                if zona_result:
                                    zona_nombre = zona_result[0] or ''
                            except Exception:
                                pass
                        elif id_pandilla:
                            # Si no hay id_zona en eventos, intentar obtenerlo de la pandilla
                            try:
                                cursor.execute("""
                                    SELECT Z.nombre 
                                    FROM pandillas P
                                    LEFT JOIN zonas Z ON P.id_zona = Z.id_zona
                                    WHERE P.id_pandilla = %s
                                """, [id_pandilla])
                                zona_result = cursor.fetchone()
                                if zona_result and zona_result[0]:
                                    zona_nombre = zona_result[0]
                            except Exception:
                                pass
                        
                        # Obtener dirección
                        direccion = ''
                        if id_direccion:
                            try:
                                cursor.execute("""
                                    SELECT CONCAT(
                                        COALESCE(calle, ''), ' ',
                                        COALESCE(numero, ''), ', ',
                                        COALESCE(colonia, '')
                                    )
                                    FROM direcciones WHERE id_direccion = %s
                                """, [id_direccion])
                                dir_result = cursor.fetchone()
                                if dir_result and dir_result[0]:
                                    direccion = dir_result[0].strip()
                            except Exception:
                                pass
                        
                        eventos.append({
                            'tipo': tipo_evento,
                            'fecha': str(fecha) if fecha else None,
                            'hora': str(hora) if hora else None,
                            'descripcion': descripcion or '',
                            'delito_nombre': delito_nombre,
                            'falta_nombre': falta_nombre,
                            'integrante_nombre': integrante_nombre,
                            'pandilla_nombre': pandilla_nombre,
                            'zona_nombre': zona_nombre,
                            'direccion': direccion
                        })
                    
                    return eventos
            except Exception as e:
                logger.error(f"Error en obtener_eventos: {e}", exc_info=True)
                raise
        
        eventos = await sync_to_async(obtener_eventos)()
        
        if not eventos:
            await update.message.reply_text("No hay eventos registrados en la base de datos.")
            return
        
        # Enviar cada evento como mensaje separado para poder agregar botones individuales
        for evento in eventos:
            try:
                tipo = evento.get('tipo', 'evento') or 'evento'
                tipo_emoji = {
                    'riña': '⚔️',
                    'delito': '🚨',
                    'falta': '⚠️'
                }.get(tipo.lower(), '📌')
                
                message = f"{tipo_emoji} *{tipo.upper()}*\n"
                
                fecha = evento.get('fecha')
                if fecha:
                    message += f"📅 Fecha: {fecha}"
                
                hora = evento.get('hora')
                if hora:
                    message += f" 🕐 {hora}"
                
                message += "\n"
                
                if evento.get('delito_nombre'):
                    message += f"🚨 Delito: {evento['delito_nombre']}\n"
                elif evento.get('falta_nombre'):
                    message += f"⚠️ Falta: {evento['falta_nombre']}\n"
                
                if evento.get('integrante_nombre'):
                    message += f"👤 Integrante: {evento['integrante_nombre']}\n"
                
                if evento.get('pandilla_nombre'):
                    message += f"🏴 Pandilla: {evento['pandilla_nombre']}\n"
                
                if evento.get('zona_nombre'):
                    message += f"📍 Zona: {evento['zona_nombre']}\n"
                
                # Crear botón de Google Maps si hay dirección
                reply_markup = None
                if evento.get('direccion'):
                    message += f"🏠 Dirección: {evento['direccion']}\n"
                    # Crear botón para ver en Google Maps
                    direccion_codificada = quote_plus(evento['direccion'])
                    google_maps_url = f"https://www.google.com/maps/search/?api=1&query={direccion_codificada}"
                    keyboard = [[InlineKeyboardButton("📍 Ver en Google Maps", url=google_maps_url)]]
                    reply_markup = InlineKeyboardMarkup(keyboard)
                
                if evento.get('descripcion'):
                    desc = str(evento['descripcion'])[:100]
                    if len(str(evento['descripcion'])) > 100:
                        desc += "..."
                    message += f"📝 {desc}\n"
                
                # Limitar tamaño del mensaje
                if len(message) > 4000:
                    message = message[:4000] + "\n\n... (mensaje truncado)"
                
                await update.message.reply_text(message, parse_mode='Markdown', reply_markup=reply_markup)
            except Exception as e:
                logger.error(f"Error al formatear evento: {e}")
                continue
    except Exception as e:
        logger.error(f"Error al listar eventos: {e}", exc_info=True)
        error_msg = f"❌ Error al consultar los eventos: {str(e)}"
        if len(error_msg) > 4000:
            error_msg = error_msg[:4000]
        await update.message.reply_text(error_msg)


async def buscar_integrante(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Comando /integrante <nombre o alias> - Buscar información de un integrante
    Usa la misma consulta SQL que consulta_integrantes del sitio web
    """
    # Verificar autenticación
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
        def buscar_integrantes(busqueda):
            """Consulta SQL igual a consulta_integrantes del sitio web"""
            try:
                with connection.cursor() as cursor:
                    # Verificar que la tabla existe
                    cursor.execute("SHOW TABLES LIKE 'integrantes'")
                    if not cursor.fetchone():
                        return []
                    
                    # Preparar búsqueda
                    busqueda_like = f'%{busqueda}%'
                    
                    # Consulta SQL - IMPORTANTE: FROM integrantes (NO faltas)
                    sql_query = """
                    SELECT 
                        integrantes.id_integrante,
                        integrantes.nombre,
                        integrantes.apellido_paterno,
                        integrantes.apellido_materno,
                        integrantes.alias,
                        integrantes.fecha_nacimiento,
                        CONCAT(
                            COALESCE(integrantes.nombre, ''),
                            COALESCE(CONCAT(' ', integrantes.apellido_paterno), ''),
                            COALESCE(CONCAT(' ', integrantes.apellido_materno), '')
                        ) as nombre_completo,
                        pandillas.nombre as pandilla_nombre,
                        CONCAT(
                            COALESCE(direcciones.calle, ''),
                            COALESCE(CONCAT(' ', direcciones.numero), ''),
                            COALESCE(CONCAT(', ', direcciones.colonia), '')
                        ) as direccion
                    FROM integrantes
                    LEFT JOIN pandillas ON integrantes.id_pandilla = pandillas.id_pandilla
                    LEFT JOIN direcciones ON integrantes.id_direccion = direcciones.id_direccion
                    WHERE 
                        integrantes.nombre LIKE %s 
                        OR integrantes.apellido_paterno LIKE %s 
                        OR integrantes.apellido_materno LIKE %s 
                        OR integrantes.alias LIKE %s
                        OR CONCAT(
                            COALESCE(integrantes.nombre, ''),
                            COALESCE(CONCAT(' ', integrantes.apellido_paterno), ''),
                            COALESCE(CONCAT(' ', integrantes.apellido_materno), '')
                        ) LIKE %s
                    ORDER BY integrantes.nombre ASC, integrantes.apellido_paterno ASC
                    LIMIT 10
                    """
                    
                    # Ejecutar consulta en tabla INTEGRANTES
                    cursor.execute(sql_query, [
                        busqueda_like,  # nombre
                        busqueda_like,  # apellido_paterno
                        busqueda_like,  # apellido_materno
                        busqueda_like,  # alias
                        busqueda_like   # nombre completo
                    ])
                    
                    rows = cursor.fetchall()
                    integrantes_data = []
                    
                    # Procesar resultados
                    for row in rows:
                        id_integrante = row[0]
                        
                        integrante = {
                            'id_integrante': id_integrante,
                            'nombre': row[1] or '',
                            'apellido_paterno': row[2] or '',
                            'apellido_materno': row[3] or '',
                            'alias': row[4] or '',
                            'fecha_nacimiento': str(row[5]) if row[5] else None,
                            'nombre_completo': row[6] or row[1] or 'Sin nombre',
                            'pandilla_nombre': row[7] if len(row) > 7 and row[7] else None,
                            'direccion': row[8] if len(row) > 8 and row[8] else '',
                            'delitos': [],
                            'faltas': []
                        }
                        
                        # Obtener delitos del integrante
                        try:
                            cursor.execute("""
                                SELECT delitos.id_delito, delitos.nombre
                                FROM integrantes_delitos
                                JOIN delitos ON integrantes_delitos.id_delito = delitos.id_delito
                                WHERE integrantes_delitos.id_integrante = %s
                            """, [id_integrante])
                            
                            for delito_row in cursor.fetchall():
                                integrante['delitos'].append({
                                    'id_delito': delito_row[0],
                                    'nombre': delito_row[1]
                                })
                        except Exception:
                            pass
                        
                        # Obtener faltas del integrante
                        try:
                            cursor.execute("""
                                SELECT faltas.id_falta, faltas.falta
                                FROM integrantes_faltas
                                JOIN faltas ON integrantes_faltas.id_falta = faltas.id_falta
                                WHERE integrantes_faltas.id_integrante = %s
                            """, [id_integrante])
                            
                            for falta_row in cursor.fetchall():
                                integrante['faltas'].append({
                                    'id_falta': falta_row[0],
                                    'nombre': falta_row[1] if len(falta_row) > 1 else f'Falta {falta_row[0]}'
                                })
                        except Exception:
                            try:
                                # Intentar con columna 'nombre' si 'falta' no existe
                                cursor.execute("""
                                    SELECT faltas.id_falta, faltas.nombre
                                    FROM integrantes_faltas
                                    JOIN faltas ON integrantes_faltas.id_falta = faltas.id_falta
                                    WHERE integrantes_faltas.id_integrante = %s
                                """, [id_integrante])
                                
                                for falta_row in cursor.fetchall():
                                    integrante['faltas'].append({
                                        'id_falta': falta_row[0],
                                        'nombre': falta_row[1] if len(falta_row) > 1 else f'Falta {falta_row[0]}'
                                    })
                            except Exception:
                                pass
                        
                        integrantes_data.append(integrante)
                    
                    return integrantes_data
            except Exception as e:
                logger.error(f"Error en buscar_integrantes: {e}", exc_info=True)
                raise
        
        integrantes = await sync_to_async(buscar_integrantes)(criterio_busqueda)
        
        if not integrantes:
            await update.message.reply_text(
                f"❌ No se encontró ningún integrante con el criterio '{criterio_busqueda}'"
            )
            return
        
        # Si hay múltiples resultados, mostrar lista
        if len(integrantes) > 1:
            message = f"🔍 *Se encontraron {len(integrantes)} integrantes:*\n\n"
            for i, integrante in enumerate(integrantes, 1):
                nombre_completo = integrante['nombre_completo']
                alias_text = f" ({integrante['alias']})" if integrante['alias'] else ""
                message += f"{i}. *{nombre_completo}*{alias_text}\n"
            message += "\nEspecifica más el nombre o alias para obtener información detallada."
            await update.message.reply_text(message, parse_mode='Markdown')
            return
        
        # Un solo resultado, mostrar información completa
        integrante = integrantes[0]
        
        # Obtener URL de imagen (primera imagen disponible)
        imagen_url = None
        try:
            def get_imagen(integrante_id):
                with connection.cursor() as cursor:
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
                            return result[0]
                    except Exception:
                        pass
                    return None
            
            imagen_url = await sync_to_async(get_imagen)(integrante['id_integrante'])
        except Exception:
            pass
        
        # Construir mensaje con información del integrante
        nombre_completo = integrante['nombre_completo']
        
        message = f"👤 *Información del Integrante*\n\n"
        message += f"*Nombre completo:* {nombre_completo}\n"
        
        if integrante['alias']:
            message += f"*Alias:* {integrante['alias']}\n"
        
        if integrante['fecha_nacimiento']:
            message += f"*Fecha de nacimiento:* {integrante['fecha_nacimiento']}\n"
        
        if integrante['pandilla_nombre']:
            message += f"*Pandilla:* {integrante['pandilla_nombre']}\n"
        
        # Crear botón de Google Maps si hay dirección
        reply_markup = None
        if integrante['direccion']:
            message += f"*Dirección:* {integrante['direccion']}\n"
            # Crear botón para ver en Google Maps
            direccion_codificada = quote_plus(integrante['direccion'])
            google_maps_url = f"https://www.google.com/maps/search/?api=1&query={direccion_codificada}"
            keyboard = [[InlineKeyboardButton("📍 Ver en Google Maps", url=google_maps_url)]]
            reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Delitos asociados
        if integrante['delitos']:
            message += f"\n*Delitos asociados:*\n"
            for delito in integrante['delitos'][:10]:  # Limitar a 10
                message += f"  • {delito['nombre']}\n"
        else:
            message += f"\n*Delitos asociados:* Ninguno registrado\n"
        
        # Faltas asociadas
        if integrante['faltas']:
            message += f"\n*Faltas asociadas:*\n"
            for falta in integrante['faltas'][:10]:  # Limitar a 10
                message += f"  • {falta['nombre']}\n"
        else:
            message += f"\n*Faltas asociadas:* Ninguna registrada\n"
        
        # Enviar mensaje de texto primero
        await update.message.reply_text(message, parse_mode='Markdown', reply_markup=reply_markup)
        
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
        error_msg = f"❌ Error al buscar el integrante: {str(e)}"
        if len(error_msg) > 4000:
            error_msg = error_msg[:4000]
        await update.message.reply_text(error_msg)


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
    application.add_handler(CommandHandler("cerrar_sesion", logout))
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

