# account/management/commands/init_default_roles.py

from django.core.management.base import BaseCommand
from account.models import Role, RolePermission


class Command(BaseCommand):
    help = '初始化預設角色（管理員、老師、學生、會計）到資料庫'

    def handle(self, *args, **options):
        # 定義預設角色
        default_roles = [
            {
                'name': '系統管理員',
                'description': '擁有所有權限，可以管理系統的所有功能，包括切換角色視角',
                'permissions': []  # 管理員不需要權限設定，因為在代碼中會檢查 is_admin()
            },
            {
                'name': '老師',
                'description': '可以管理課程、題庫、Quiz、考卷、講義，查看學生學習狀況',
                'permissions': [
                    # 頁面權限
                    {'type': 'page', 'resource': '/', 'method': None},  # 儀表板
                    {'type': 'page', 'resource': '/courses', 'method': None},  # 課程管理
                    {'type': 'page', 'resource': '/questions', 'method': None},  # 題庫系統
                    {'type': 'page', 'resource': '/quizzes', 'method': None},  # Quiz 管理
                    {'type': 'page', 'resource': '/exams', 'method': None},  # 考卷管理
                    {'type': 'page', 'resource': '/materials', 'method': None},  # 講義管理
                    {'type': 'page', 'resource': '/student-groups', 'method': None},  # 學生群組
                    {'type': 'page', 'resource': '/generator', 'method': None},  # 生成器
                    {'type': 'page', 'resource': '/attendance', 'method': None},  # 出缺勤
                    # API 權限
                    {'type': 'api', 'resource': '/api/cramschool/courses/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/courses/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/courses/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/courses/', 'method': 'DELETE'},
                    {'type': 'api', 'resource': '/api/cramschool/questions/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/questions/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/questions/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/questions/', 'method': 'DELETE'},
                    {'type': 'api', 'resource': '/api/cramschool/quizzes/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/quizzes/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/quizzes/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/quizzes/', 'method': 'DELETE'},
                    {'type': 'api', 'resource': '/api/cramschool/exams/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/exams/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/exams/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/exams/', 'method': 'DELETE'},
                    {'type': 'api', 'resource': '/api/cramschool/course-materials/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/course-materials/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/course-materials/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/course-materials/', 'method': 'DELETE'},
                    {'type': 'api', 'resource': '/api/cramschool/student-groups/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/student-groups/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/student-groups/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/student-groups/', 'method': 'DELETE'},
                    {'type': 'api', 'resource': '/api/cramschool/generate-assessment/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/attendance/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/attendance/', 'method': 'POST'},
                ]
            },
            {
                'name': '學生',
                'description': '只能看到自己報名的課程、相關考卷，以及訂便當團購連結頁面',
                'permissions': [
                    # 頁面權限
                    {'type': 'page', 'resource': '/', 'method': None},  # 儀表板
                    {'type': 'page', 'resource': '/courses', 'method': None},  # 課程管理（僅自己報名的）
                    {'type': 'page', 'resource': '/lunch-orders', 'method': None},  # 訂便當系統
                    # API 權限
                    {'type': 'api', 'resource': '/api/cramschool/courses/', 'method': 'GET'},  # 僅自己報名的課程
                    {'type': 'api', 'resource': '/api/cramschool/quizzes/', 'method': 'GET'},  # 僅相關的 Quiz
                    {'type': 'api', 'resource': '/api/cramschool/exams/', 'method': 'GET'},  # 僅相關的考卷
                    {'type': 'api', 'resource': '/api/cramschool/lunch-orders/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/lunch-orders/', 'method': 'POST'},
                ]
            },
            {
                'name': '會計',
                'description': '主要處理帳務、訂便當，排除教學相關模組',
                'permissions': [
                    # 頁面權限
                    {'type': 'page', 'resource': '/', 'method': None},  # 儀表板
                    {'type': 'page', 'resource': '/students', 'method': None},  # 學生管理（僅查看，用於帳務）
                    {'type': 'page', 'resource': '/lunch-orders', 'method': None},  # 訂便當系統
                    # API 權限
                    {'type': 'api', 'resource': '/api/cramschool/students/', 'method': 'GET'},  # 僅查看
                    {'type': 'api', 'resource': '/api/cramschool/extra-fees/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/extra-fees/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/extra-fees/', 'method': 'PUT'},
                    {'type': 'api', 'resource': '/api/cramschool/lunch-orders/', 'method': 'GET'},
                    {'type': 'api', 'resource': '/api/cramschool/lunch-orders/', 'method': 'POST'},
                    {'type': 'api', 'resource': '/api/cramschool/lunch-orders/', 'method': 'PUT'},
                ]
            },
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for role_data in default_roles:
            role_name = role_data['name']
            
            # 檢查角色是否已存在
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={
                    'description': role_data['description'],
                    'is_active': True
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ 成功創建角色: {role_name}')
                )
            else:
                # 如果角色已存在，更新描述（如果需要）
                if role.description != role_data['description']:
                    role.description = role_data['description']
                    role.is_active = True
                    role.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'↻ 更新角色描述: {role_name}')
                    )
                else:
                    skipped_count += 1
                    self.stdout.write(
                        self.style.NOTICE(f'⊘ 角色已存在，跳過: {role_name}')
                    )

            # 為角色創建權限（如果角色是新創建的，或者需要更新權限）
            if role_data.get('permissions'):
                permission_count = 0
                for perm_data in role_data['permissions']:
                    perm, perm_created = RolePermission.objects.get_or_create(
                        role=role,
                        permission_type=perm_data['type'],
                        resource=perm_data['resource'],
                        method=perm_data.get('method'),
                        defaults={}
                    )
                    if perm_created:
                        permission_count += 1

                if permission_count > 0:
                    self.stdout.write(
                        self.style.SUCCESS(f'  → 新增 {permission_count} 個權限')
                    )

        # 輸出總結
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('初始化預設角色完成！'))
        self.stdout.write(self.style.SUCCESS(f'  創建: {created_count} 個角色'))
        self.stdout.write(self.style.SUCCESS(f'  更新: {updated_count} 個角色'))
        self.stdout.write(self.style.SUCCESS(f'  跳過: {skipped_count} 個角色'))
        self.stdout.write(self.style.SUCCESS('=' * 50))

