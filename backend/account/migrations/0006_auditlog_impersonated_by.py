# Generated manually for impersonated_by field

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0005_role_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='auditlog',
            name='impersonated_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='impersonated_audit_logs', to=settings.AUTH_USER_MODEL, verbose_name='代理操作的管理員'),
        ),
    ]
