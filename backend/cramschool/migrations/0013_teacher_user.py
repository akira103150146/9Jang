# Generated manually to add user field to Teacher model and remove old username/password_hash fields

from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_alter_customuser_role'),
        ('cramschool', '0012_add_accountant_permission'),
    ]

    operations = [
        # 先添加 user 欄位
        migrations.AddField(
            model_name='teacher',
            name='user',
            field=models.OneToOneField(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='teacher_profile',
                to=settings.AUTH_USER_MODEL,
                verbose_name='用戶帳號'
            ),
        ),
        # 移除舊的 username 和 password_hash 欄位
        migrations.RemoveField(
            model_name='teacher',
            name='username',
        ),
        migrations.RemoveField(
            model_name='teacher',
            name='password_hash',
        ),
    ]
