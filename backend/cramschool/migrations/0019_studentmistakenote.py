from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cramschool', '0018_add_solution_content'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentMistakeNote',
            fields=[
                ('note_id', models.AutoField(primary_key=True, serialize=False, verbose_name='錯題筆記ID')),
                ('title', models.CharField(max_length=200, verbose_name='標題')),
                ('subject', models.CharField(blank=True, max_length=100, null=True, verbose_name='科目/分類')),
                ('content', models.TextField(blank=True, null=True, verbose_name='內容 (Markdown)')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新時間')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='是否已刪除')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mistake_notes', to='cramschool.student', verbose_name='學生')),
            ],
            options={
                'verbose_name': '學生錯題筆記',
                'verbose_name_plural': '學生錯題筆記',
                'ordering': ['-updated_at', '-note_id'],
            },
        ),
        migrations.AddIndex(
            model_name='studentmistakenote',
            index=models.Index(fields=['student', 'is_deleted'], name='mistake_student_deleted_idx'),
        ),
        migrations.AddIndex(
            model_name='studentmistakenote',
            index=models.Index(fields=['student', 'updated_at'], name='mistake_student_updated_idx'),
        ),
    ]

