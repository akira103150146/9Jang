"""
創建預設科目的管理命令
"""
from django.core.management.base import BaseCommand
from cramschool.models import Subject


class Command(BaseCommand):
    help = '創建預設科目'

    def handle(self, *args, **options):
        default_subjects = [
            {'name': 'English', 'code': 'Eng'},
            {'name': 'Math', 'code': 'Math'},
            {'name': 'Chinese', 'code': 'Chinese'},
            {'name': 'Physics', 'code': 'Physics'},
            {'name': 'Chemistry', 'code': 'Chemistry'},
            {'name': 'Biology', 'code': 'Biology'},
            {'name': 'History', 'code': 'History'},
            {'name': 'Geography', 'code': 'Geography'},
        ]

        created_count = 0
        for subject_data in default_subjects:
            subject, created = Subject.objects.get_or_create(
                name=subject_data['name'],
                defaults={'code': subject_data['code']}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ 創建科目: {subject.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'○ 科目已存在: {subject.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n完成！共創建 {created_count} 個新科目')
        )

