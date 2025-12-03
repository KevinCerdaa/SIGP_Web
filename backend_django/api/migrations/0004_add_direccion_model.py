# Generated migration to add Direccion model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_add_genero_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='Direccion',
            fields=[
                ('id_direccion', models.AutoField(primary_key=True, serialize=False)),
                ('calle', models.CharField(max_length=255)),
                ('numero', models.CharField(blank=True, max_length=50, null=True)),
                ('colonia', models.CharField(blank=True, max_length=255, null=True)),
                ('codigo_postal', models.CharField(blank=True, max_length=10, null=True)),
                ('latitud', models.DecimalField(decimal_places=7, max_digits=10)),
                ('longitud', models.DecimalField(decimal_places=7, max_digits=10)),
            ],
            options={
                'db_table': 'direcciones',
                'verbose_name': 'Dirección',
                'verbose_name_plural': 'Direcciones',
            },
        ),
    ]


