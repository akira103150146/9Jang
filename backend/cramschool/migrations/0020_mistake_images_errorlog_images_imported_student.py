from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cramschool', '0019_studentmistakenote'),
    ]

    operations = [
        migrations.AddField(
            model_name='questionbank',
            name='imported_student',
            field=models.ForeignKey(
                blank=True,
                help_text='若此題由學生錯題彙整而來，記錄來源學生以利針對性教學',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='imported_questions',
                to='cramschool.student',
                verbose_name='來源學生',
            ),
        ),
        migrations.CreateModel(
            name='ErrorLogImage',
            fields=[
                ('image_id', models.AutoField(primary_key=True, serialize=False, verbose_name='錯題圖片ID')),
                ('image_path', models.CharField(max_length=255, verbose_name='圖片路徑')),
                ('caption', models.CharField(blank=True, max_length=255, null=True, verbose_name='圖片說明')),
                ('sort_order', models.IntegerField(default=0, verbose_name='排序')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('error_log', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='cramschool.errorlog', verbose_name='錯題記錄')),
            ],
            options={
                'verbose_name': '錯題圖片',
                'verbose_name_plural': '錯題圖片',
                'ordering': ['sort_order', 'image_id'],
            },
        ),
        migrations.CreateModel(
            name='StudentMistakeNoteImage',
            fields=[
                ('image_id', models.AutoField(primary_key=True, serialize=False, verbose_name='筆記圖片ID')),
                ('image_path', models.CharField(max_length=255, verbose_name='圖片路徑')),
                ('caption', models.CharField(blank=True, max_length=255, null=True, verbose_name='圖片說明')),
                ('sort_order', models.IntegerField(default=0, verbose_name='排序')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='建立時間')),
                ('note', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='cramschool.studentmistakenote', verbose_name='錯題筆記')),
            ],
            options={
                'verbose_name': '錯題筆記圖片',
                'verbose_name_plural': '錯題筆記圖片',
                'ordering': ['sort_order', 'image_id'],
            },
        ),
        migrations.AddIndex(
            model_name='errorlogimage',
            index=models.Index(fields=['error_log', 'sort_order'], name='errimg_log_sort_idx'),
        ),
        migrations.AddIndex(
            model_name='studentmistakenoteimage',
            index=models.Index(fields=['note', 'sort_order'], name='noteimg_note_sort_idx'),
        ),
    ]

