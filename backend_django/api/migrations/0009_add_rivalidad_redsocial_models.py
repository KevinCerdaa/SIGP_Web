# Generated migration to add Rivalidad and RedSocial models

from django.db import migrations, models
import django.db.models.deletion


def create_rivalidades_table_if_not_exists(apps, schema_editor):
    """Crear tabla de rivalidades solo si no existe"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Verificar si la tabla ya existe
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'rivalidades'
        """)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            # Crear la tabla de rivalidades
            cursor.execute("""
                CREATE TABLE rivalidades (
                    id_rivalidad INT AUTO_INCREMENT PRIMARY KEY,
                    id_pandilla INT NOT NULL,
                    id_pandilla_rival INT NOT NULL,
                    FOREIGN KEY (id_pandilla) REFERENCES pandillas(id_pandilla) ON DELETE CASCADE,
                    FOREIGN KEY (id_pandilla_rival) REFERENCES pandillas(id_pandilla) ON DELETE CASCADE,
                    UNIQUE KEY unique_rivalidad (id_pandilla, id_pandilla_rival),
                    INDEX idx_pandilla (id_pandilla),
                    INDEX idx_pandilla_rival (id_pandilla_rival)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)


def create_redes_sociales_table_if_not_exists(apps, schema_editor):
    """Crear tabla de redes sociales solo si no existe"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Verificar si la tabla ya existe
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'redes_sociales'
        """)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            # Crear la tabla de redes sociales
            cursor.execute("""
                CREATE TABLE redes_sociales (
                    id_red_social INT AUTO_INCREMENT PRIMARY KEY,
                    plataforma VARCHAR(255) NOT NULL,
                    handle VARCHAR(255) NULL,
                    url VARCHAR(500) NULL,
                    INDEX idx_plataforma (plataforma)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)


def reverse_create_rivalidades_table(apps, schema_editor):
    """Eliminar tabla de rivalidades"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS rivalidades")


def reverse_create_redes_sociales_table(apps, schema_editor):
    """Eliminar tabla de redes sociales"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS redes_sociales")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_add_evento_model'),
    ]

    operations = [
        migrations.RunPython(
            create_rivalidades_table_if_not_exists,
            reverse_create_rivalidades_table,
        ),
        migrations.RunPython(
            create_redes_sociales_table_if_not_exists,
            reverse_create_redes_sociales_table,
        ),
    ]

