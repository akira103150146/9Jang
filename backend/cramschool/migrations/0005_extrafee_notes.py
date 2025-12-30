# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cramschool', '0004_restaurant_grouporder_order_orderitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='extrafee',
            name='notes',
            field=models.TextField(blank=True, null=True, verbose_name='備註'),
        ),
    ]

