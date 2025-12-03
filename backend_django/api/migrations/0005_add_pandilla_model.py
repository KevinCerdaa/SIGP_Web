# Generated migration to add Pandilla model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_direccion_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pandilla',
            fields=[
                ('id_pandilla', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('lider', models.CharField(blank=True, max_length=255, null=True)),
                ('numero_integrantes', models.IntegerField(blank=True, null=True)),
                ('edades_promedio', models.FloatField(blank=True, db_column='edades_promedio', null=True)),
                ('horario_reunion', models.CharField(blank=True, max_length=255, null=True)),
                ('peligrosidad', models.IntegerField()),
                ('id_zona', models.IntegerField()),
                ('id_direccion', models.ForeignKey(blank=True, db_column='id_direccion', null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.direccion')),
            ],
            options={
                'db_table': 'pandillas',
                'verbose_name': 'Pandilla',
                'verbose_name_plural': 'Pandillas',
            },
        ),
    ]

