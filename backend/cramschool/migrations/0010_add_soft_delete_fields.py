# Generated manually for soft delete functionality

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('cramschool', '0009_student_initial_password'),
    ]

    operations = [
        # 為 Student 模型添加 soft delete 欄位（如果還沒有）
        migrations.AddField(
            model_name='student',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='是否已刪除'),
        ),
        migrations.AddField(
            model_name='student',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='刪除時間'),
        ),
        # 為 ExtraFee 模型添加 soft delete 欄位
        migrations.AddField(
            model_name='extrafee',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='是否已刪除'),
        ),
        migrations.AddField(
            model_name='extrafee',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='刪除時間'),
        ),
        # 為 StudentAnswer 模型添加 soft delete 欄位
        migrations.AddField(
            model_name='studentanswer',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='是否已刪除'),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='刪除時間'),
        ),
        # 為 ErrorLog 模型添加 soft delete 欄位
        migrations.AddField(
            model_name='errorlog',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='是否已刪除'),
        ),
        migrations.AddField(
            model_name='errorlog',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='刪除時間'),
        ),
        # 為 Order 模型添加 soft delete 欄位
        migrations.AddField(
            model_name='order',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='是否已刪除'),
        ),
        migrations.AddField(
            model_name='order',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='刪除時間'),
        ),
    ]

