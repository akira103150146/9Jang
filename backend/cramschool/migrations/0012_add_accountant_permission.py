# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cramschool', '0011_questionbank_created_at_questionbank_created_by_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teacher',
            name='permission_level',
            field=models.CharField(
                choices=[('Teacher', 'Teacher'), ('Admin', 'Admin'), ('Accountant', 'Accountant')],
                default='Teacher',
                max_length=10,
                verbose_name='權限等級'
            ),
        ),
    ]
