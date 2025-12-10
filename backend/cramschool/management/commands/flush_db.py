# cramschool/management/commands/flush_db.py

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.apps import apps
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = '強制清空當前資料庫中的所有資料（危險操作！）'

    def add_arguments(self, parser):
        parser.add_argument(
            '--noinput',
            '--no-input',
            action='store_true',
            help='跳過確認提示，直接執行清空操作',
        )
        parser.add_argument(
            '--keep-auth',
            action='store_true',
            help='保留認證相關的資料（User, Role, RolePermission, AuditLog）',
        )

    def handle(self, *args, **options):
        noinput = options['noinput']
        keep_auth = options['keep_auth']

        # 獲取所有模型
        all_models = []
        models_to_delete = []
        
        for app_config in apps.get_app_configs():
            app_models = app_config.get_models()
            for model in app_models:
                all_models.append(model)
                # 如果保留認證資料，跳過 account app 的模型
                if keep_auth and app_config.label == 'account':
                    continue
                # 跳過 Django 內建的某些模型
                if model._meta.app_label in ['contenttypes', 'sessions', 'admin', 'auth']:
                    if model != ContentType:
                        continue
                models_to_delete.append(model)

        # 顯示警告信息
        self.stdout.write(
            self.style.ERROR('=' * 70)
        )
        self.stdout.write(
            self.style.ERROR('警告：此操作將清空以下模型的所有資料：')
        )
        
        if keep_auth:
            self.stdout.write(
                self.style.WARNING('（將保留 account app 的資料）')
            )
        
        # 按 app 分組顯示
        apps_dict = {}
        for model in models_to_delete:
            app_label = model._meta.app_label
            if app_label not in apps_dict:
                apps_dict[app_label] = []
            apps_dict[app_label].append(model._meta.verbose_name or model.__name__)
        
        for app_label, model_names in apps_dict.items():
            self.stdout.write(self.style.ERROR(f'\n  {app_label}:'))
            for model_name in model_names:
                self.stdout.write(self.style.ERROR(f'    - {model_name}'))
        
        self.stdout.write(
            self.style.ERROR('=' * 70)
        )

        # 確認操作
        if not noinput:
            confirm = input(
                self.style.WARNING(
                    '\n確定要清空資料庫嗎？此操作無法復原！\n'
                    '輸入 "YES" 確認，或按 Enter 取消: '
                )
            )
            if confirm != 'YES':
                self.stdout.write(self.style.SUCCESS('操作已取消'))
                return

        try:
            with transaction.atomic():
                # 禁用外鍵檢查（SQLite）
                if 'sqlite' in connection.settings_dict['ENGINE']:
                    with connection.cursor() as cursor:
                        cursor.execute("PRAGMA foreign_keys = OFF")
                    self.stdout.write(self.style.SUCCESS('已禁用外鍵檢查'))

                # 刪除所有資料
                deleted_count = 0
                for model in models_to_delete:
                    try:
                        count = model.objects.all().count()
                        if count > 0:
                            model.objects.all().delete()
                            deleted_count += count
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'✓ {model._meta.app_label}.{model.__name__}: '
                                    f'已刪除 {count} 筆記錄'
                                )
                            )
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'✗ 刪除 {model._meta.app_label}.{model.__name__} 時發生錯誤: {str(e)}'
                            )
                        )

                # 重新啟用外鍵檢查（SQLite）
                if 'sqlite' in connection.settings_dict['ENGINE']:
                    with connection.cursor() as cursor:
                        cursor.execute("PRAGMA foreign_keys = ON")
                    self.stdout.write(self.style.SUCCESS('已重新啟用外鍵檢查'))

            self.stdout.write(
                self.style.SUCCESS(f'\n✓ 資料庫清空完成！共刪除 {deleted_count} 筆記錄')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n✗ 清空資料庫時發生錯誤: {str(e)}')
            )
            raise

