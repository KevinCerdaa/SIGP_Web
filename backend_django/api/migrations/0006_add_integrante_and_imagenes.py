# Generated migration to add Integrante and ImagenIntegrante models

from django.db import migrations, models
import django.db.models.deletion


def create_imagenes_table_if_not_exists(apps, schema_editor):
    """Crear tabla de imágenes solo si no existe"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Verificar si la tabla ya existe
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'imagenes_integrantes'
        """)
        table_exists = cursor.fetchone()[0] > 0
        
        if not table_exists:
            # Crear la tabla de imágenes
            cursor.execute("""
                CREATE TABLE imagenes_integrantes (
                    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
                    id_integrante INT NOT NULL,
                    url_imagen VARCHAR(500) NOT NULL,
                    descripcion VARCHAR(255) NULL,
                    fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_integrante) REFERENCES integrantes(id_integrante) ON DELETE CASCADE,
                    INDEX idx_integrante (id_integrante)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)


def reverse_create_imagenes_table(apps, schema_editor):
    """Eliminar tabla de imágenes"""
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS imagenes_integrantes")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_add_pandilla_model'),
    ]

    operations = [
        # Cambiar peligrosidad de IntegerField a CharField (VARCHAR) solo si es necesario
        migrations.RunSQL(
            sql="ALTER TABLE pandillas MODIFY COLUMN peligrosidad VARCHAR(50)",
            reverse_sql="ALTER TABLE pandillas MODIFY COLUMN peligrosidad INT",
        ),
        # Crear tabla de imágenes de integrantes
        migrations.RunPython(
            create_imagenes_table_if_not_exists,
            reverse_create_imagenes_table,
        ),
    ]

