# cramschool/management/commands/flush_db.py

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.apps import apps
from django.contrib.contenttypes.models import ContentType


def sort_models_by_dependencies(models):
    """
    根據外鍵依賴關係對模型進行排序
    返回排序後的模型列表，確保先刪除子模型（有外鍵指向父模型的），
    最後刪除父模型（被其他模型引用的）
    
    例如：QuestionBank 有外鍵指向 Subject (PROTECT)，
    我們必須先刪除 QuestionBank，然後才能刪除 Subject
    
    使用拓撲排序：找出沒有被其他模型引用的模型（葉節點），
    最後刪除它們；先刪除引用它們的模型
    """
    from django.db import models as django_models
    
    model_set = set(models)
    
    # 構建依賴圖：parent_model -> [child_models_that_reference_it]
    # 如果 Model A 有外鍵指向 Model B (PROTECT)，那麼：
    # - A 是子模型，B 是父模型
    # - 我們必須先刪除 A，然後才能刪除 B
    # - parent_to_children[B] = {A} 表示 B 被 A 引用
    parent_to_children = {}  # {parent_model: set of child models that reference it}
    
    for model in models:
        parent_to_children[model] = set()
    
    for model in models:
        # 檢查所有外鍵關係
        for field in model._meta.get_fields():
            if isinstance(field, django_models.ForeignKey):
                related_model = field.related_model
                # 如果相關模型在要刪除的列表中
                if related_model in model_set and related_model != model:
                    # 當前 model 有外鍵指向 related_model
                    # 所以當前 model 是子模型，related_model 是父模型
                    # 如果外鍵是 PROTECT，我們必須先刪除子模型
                    if field.remote_field.on_delete == django_models.PROTECT:
                        parent_to_children[related_model].add(model)
    
    # 拓撲排序：找出沒有被其他模型引用的模型（葉節點），最後刪除它們
    # 先刪除引用它們的模型（子模型），最後刪除被引用的模型（父模型）
    sorted_models = []
    remaining = set(models)
    
    while remaining:
        # 找出沒有被其他模型引用的模型（或所有引用它的模型都已處理）
        # 這些是可以安全刪除的模型（父模型，葉節點）
        ready_to_delete = [
            model for model in remaining
            if not any(child in remaining for child in parent_to_children.get(model, set()))
        ]
        
        if not ready_to_delete:
            # 如果沒有找到，可能存在循環依賴，按原順序處理
            sorted_models.extend(list(remaining))
            break
        
        # 將這些模型加入排序列表（先刪除的在前）
        # 注意：我們要反轉順序，因為我們想先刪除子模型，最後刪除父模型
        # 但拓撲排序給我們的是相反的順序（先父後子），所以我們需要反轉
        sorted_models = ready_to_delete + sorted_models
        remaining -= set(ready_to_delete)
    
    # 反轉列表，使得先刪除子模型，最後刪除父模型
    return sorted_models[::-1]


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

        # 根據外鍵依賴關係排序模型，確保先刪除子模型，再刪除父模型
        models_to_delete = sort_models_by_dependencies(models_to_delete)

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

