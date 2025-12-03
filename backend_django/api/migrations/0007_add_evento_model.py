# Generated migration to add Evento model

from django.db import migrations, models
import django.db.models.deletion


def create_eventos_table_if_not_exists(apps, schema_editor):
    """Crear tabla de eventos solo si no existe"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Verificar si la tabla ya existe
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'eventos'
        """)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            # Crear la tabla de eventos
            cursor.execute("""
                CREATE TABLE eventos (
                    id_evento INT AUTO_INCREMENT PRIMARY KEY,
                    tipo VARCHAR(50) NOT NULL,
                    id_delito INT NULL,
                    id_falta INT NULL,
                    fecha DATE NOT NULL,
                    hora TIME NULL,
                    descripcion TEXT NULL,
                    id_integrante INT NULL,
                    id_pandilla INT NULL,
                    id_direccion INT NULL,
                    FOREIGN KEY (id_integrante) REFERENCES integrantes(id_integrante) ON DELETE SET NULL,
                    FOREIGN KEY (id_pandilla) REFERENCES pandillas(id_pandilla) ON DELETE SET NULL,
                    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion) ON DELETE SET NULL,
                    INDEX idx_tipo (tipo),
                    INDEX idx_fecha (fecha),
                    INDEX idx_pandilla (id_pandilla),
                    INDEX idx_integrante (id_integrante)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)


def reverse_create_eventos_table(apps, schema_editor):
    """Eliminar tabla de eventos"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS eventos")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_add_integrante_and_imagenes'),
    ]

    operations = [
        migrations.RunPython(
            create_eventos_table_if_not_exists,
            reverse_create_eventos_table,
        ),
    ]

