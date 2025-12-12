# Generated migration to make teacher field required in Course model

from django.db import migrations, models
import django.db.models.deletion


def set_default_teacher_for_null_courses(apps, schema_editor):
    """
    為所有 teacher 為 NULL 的課程設置一個默認老師
    如果沒有老師存在，則刪除這些課程
    """
    Course = apps.get_model('cramschool', 'Course')
    Teacher = apps.get_model('cramschool', 'Teacher')
    
    # 查找所有 teacher 為 NULL 的課程
    courses_without_teacher = Course.objects.filter(teacher__isnull=True)
    
    if courses_without_teacher.exists():
        # 嘗試獲取第一個老師作為默認值
        default_teacher = Teacher.objects.first()
        
        if default_teacher:
            # 如果有老師，將所有 NULL 的課程設置為默認老師
            courses_without_teacher.update(teacher=default_teacher)
        else:
            # 如果沒有老師，刪除所有沒有老師的課程
            courses_without_teacher.delete()


def reverse_migration(apps, schema_editor):
    """
    反向遷移：不需要特殊操作
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('cramschool', '0015_contenttemplate_learningresource'),
    ]

    operations = [
        # 第一步：先處理數據，為 NULL 值設置默認值
        migrations.RunPython(set_default_teacher_for_null_courses, reverse_migration),
        
        # 第二步：修改欄位，將 null=True 改為 null=False，並將 on_delete 改為 PROTECT
        migrations.AlterField(
            model_name='course',
            name='teacher',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='courses',
                to='cramschool.teacher',
                verbose_name='授課老師'
            ),
        ),
    ]
