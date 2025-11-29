# Generated migration to add genero field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_add_django_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='genero',
            field=models.CharField(blank=True, choices=[('M', 'Masculino'), ('F', 'Femenino'), ('X', 'Sin definir')], default='X', max_length=1, null=True),
        ),
    ]

