"""
從 JSON 文件初始化資料庫資料的通用 Seeder 命令

使用方法:
    python manage.py seed_data <json_file_path>

JSON 文件格式:
{
    "models": {
        "account.CustomUser": [
            {
                "lookup_fields": ["username"],
                "data": {
                    "username": "admin",
                    "email": "admin@example.com",
                    "role": "ADMIN",
                    ...
                }
            }
        ],
        "cramschool.Student": [
            {
                "lookup_fields": ["name", "school"],
                "data": {
                    "name": "張三",
                    "school": "XX國中",
                    "grade": "七年級",
                    ...
                }
            }
        ]
    }
}
"""
import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.apps import apps
from django.db import transaction
from django.contrib.auth import get_user_model

CustomUser = get_user_model()


class Command(BaseCommand):
    help = '從 JSON 文件初始化資料庫資料'

    def add_arguments(self, parser):
        parser.add_argument(
            'json_file',
            type=str,
            help='JSON 資料文件的路徑'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='清除現有資料後再初始化（危險操作）',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='僅顯示將要執行的操作，不實際寫入資料庫',
        )

    def handle(self, *args, **options):
        json_file = options['json_file']
        clear_existing = options['clear']
        dry_run = options['dry_run']

        # 檢查文件是否存在
        if not os.path.exists(json_file):
            raise CommandError(f'文件不存在: {json_file}')

        # 讀取 JSON 文件
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            raise CommandError(f'JSON 文件格式錯誤: {e}')
        except Exception as e:
            raise CommandError(f'讀取文件失敗: {e}')

        if 'models' not in data:
            raise CommandError('JSON 文件必須包含 "models" 鍵')

        if dry_run:
            self.stdout.write(self.style.WARNING('=== 預覽模式（不會實際寫入資料庫）==='))

        # 統計信息
        stats = {
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'errors': 0
        }

        # 用於存儲已創建的對象，以便處理外鍵關係
        created_objects = {}

        try:
            with transaction.atomic():
                # 如果指定了 --clear，先清除資料
                if clear_existing and not dry_run:
                    self.stdout.write(self.style.WARNING('清除現有資料...'))
                    for model_path in data['models'].keys():
                        try:
                            model = self.get_model(model_path)
                            count = model.objects.all().count()
                            if count > 0:
                                model.objects.all().delete()
                                self.stdout.write(
                                    self.style.WARNING(f'  已清除 {model_path}: {count} 筆記錄')
                                )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'  清除 {model_path} 失敗: {e}')
                            )

                # 處理每個模型
                for model_path, items in data['models'].items():
                    self.stdout.write('')
                    self.stdout.write(self.style.SUCCESS(f'處理模型: {model_path}'))

                    try:
                        model = self.get_model(model_path)
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'  無法載入模型 {model_path}: {e}')
                        )
                        stats['errors'] += len(items)
                        continue

                    # 處理該模型的每筆資料
                    for item in items:
                        try:
                            result = self.process_item(
                                model, item, created_objects, dry_run
                            )
                            if result == 'created':
                                stats['created'] += 1
                            elif result == 'updated':
                                stats['updated'] += 1
                            elif result == 'skipped':
                                stats['skipped'] += 1
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'  處理資料失敗: {e}')
                            )
                            stats['errors'] += 1

                if dry_run:
                    # 在 dry-run 模式下，不提交事務
                    raise transaction.TransactionManagementError('Dry run mode')

        except transaction.TransactionManagementError:
            # Dry run 模式，不提交
            pass
        except Exception as e:
            raise CommandError(f'執行過程中發生錯誤: {e}')

        # 輸出統計信息
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('初始化完成！'))
        self.stdout.write(self.style.SUCCESS(f'  創建: {stats["created"]} 筆'))
        self.stdout.write(self.style.SUCCESS(f'  更新: {stats["updated"]} 筆'))
        self.stdout.write(self.style.SUCCESS(f'  跳過: {stats["skipped"]} 筆'))
        if stats['errors'] > 0:
            self.stdout.write(self.style.ERROR(f'  錯誤: {stats["errors"]} 筆'))
        self.stdout.write(self.style.SUCCESS('=' * 50))

    def get_model(self, model_path):
        """根據字符串路徑獲取模型類"""
        try:
            app_label, model_name = model_path.split('.')
            return apps.get_model(app_label, model_name)
        except ValueError:
            raise CommandError(f'無效的模型路徑格式: {model_path}。應為 "app_label.ModelName"')
        except LookupError:
            raise CommandError(f'找不到模型: {model_path}')

    def process_item(self, model, item, created_objects, dry_run):
        """處理單筆資料項目"""
        if 'data' not in item:
            raise ValueError('項目必須包含 "data" 鍵')

        data = item['data'].copy()
        lookup_fields = item.get('lookup_fields', [])

        # 處理外鍵關係
        data = self.resolve_foreign_keys(model, data, created_objects)

        # 構建查找條件
        lookup = {}
        if lookup_fields:
            for field in lookup_fields:
                if field not in data:
                    raise ValueError(f'查找欄位 "{field}" 不存在於資料中')
                lookup[field] = data[field]

        # 處理 CustomUser 的密碼（需要特殊處理）
        password = None
        is_custom_user = (model == CustomUser or 
                         (hasattr(model, '_meta') and 
                          f"{model._meta.app_label}.{model._meta.model_name}" == 
                          f"{CustomUser._meta.app_label}.{CustomUser._meta.model_name}"))
        
        if is_custom_user:
            # 提取密碼，如果沒有則使用預設值（username）
            password = data.pop('password', None)
            if not password:
                # 如果沒有指定密碼，使用 username 作為預設密碼
                password = data.get('username', 'password123')
            # 確保密碼不會被包含在 defaults 中
            if 'password' in data:
                del data['password']

        # 執行創建或更新
        if lookup and not dry_run:
            obj, created = model.objects.update_or_create(
                defaults=data,
                **lookup
            )
            # 如果是 CustomUser，設置密碼
            if is_custom_user and password and obj:
                obj.set_password(password)
                obj.save()
        elif lookup and dry_run:
            # Dry run 模式：檢查是否存在
            exists = model.objects.filter(**lookup).exists()
            created = not exists
            obj = None
        else:
            # 沒有查找條件，直接創建
            if dry_run:
                created = True
                obj = None
            else:
                # 如果是 CustomUser，使用 create_user 方法來正確處理密碼
                if is_custom_user and password:
                    obj = CustomUser.objects.create_user(
                        password=password,
                        **data
                    )
                    created = True
                else:
                    obj = model.objects.create(**data)
                    created = True

        # 保存到 created_objects 以便後續引用
        if obj:
            model_key = f"{model._meta.app_label}.{model._meta.model_name}"
            if model_key not in created_objects:
                created_objects[model_key] = {}
            # 使用第一個查找欄位作為鍵，如果沒有則使用 id
            if lookup_fields:
                key = str(data[lookup_fields[0]])
            else:
                key = str(obj.pk)
            created_objects[model_key][key] = obj

        # 輸出結果（包含密碼資訊）
        if created:
            action = '創建' if not dry_run else '將創建'
            display_name = self.get_display_name(model, data)
            message = f'  ✓ {action}: {display_name}'
            if is_custom_user and password and not dry_run:
                message += f' (密碼: {password})'
            self.stdout.write(
                self.style.SUCCESS(message)
            )
            return 'created'
        else:
            action = '更新' if not dry_run else '將更新'
            display_name = self.get_display_name(model, data)
            message = f'  ↻ {action}: {display_name}'
            if is_custom_user and password and not dry_run:
                message += f' (密碼已更新: {password})'
            self.stdout.write(
                self.style.WARNING(message)
            )
            return 'updated'

    def resolve_foreign_keys(self, model, data, created_objects):
        """解析外鍵關係"""
        resolved_data = data.copy()

        for field_name, value in data.items():
            # 檢查是否為外鍵欄位
            try:
                field = model._meta.get_field(field_name)
            except:
                continue

            # 處理外鍵
            if field.is_relation:
                # 檢查值是否為引用格式（例如: "CustomUser:username:admin"）
                if isinstance(value, str) and ':' in value:
                    parts = value.split(':')
                    if len(parts) == 3:
                        ref_model_path, ref_field, ref_value = parts
                        try:
                            ref_model = self.get_model(ref_model_path)
                            # 先從 created_objects 查找
                            ref_key = f"{ref_model._meta.app_label}.{ref_model._meta.model_name}"
                            if ref_key in created_objects and ref_value in created_objects[ref_key]:
                                resolved_data[field_name] = created_objects[ref_key][ref_value]
                            else:
                                # 從資料庫查找
                                resolved_data[field_name] = ref_model.objects.get(**{ref_field: ref_value})
                        except ref_model.DoesNotExist:
                            raise ValueError(f'找不到引用的對象: {ref_model_path}.{ref_field}={ref_value}')
                        except Exception as e:
                            raise ValueError(f'解析外鍵失敗 {field_name}: {e}')

        return resolved_data

    def get_display_name(self, model, data):
        """獲取對象的顯示名稱"""
        # 嘗試使用常見的顯示欄位
        for field_name in ['name', 'username', 'title', 'code']:
            if field_name in data:
                return f"{model._meta.verbose_name}: {data[field_name]}"
        # 如果都沒有，使用第一個欄位
        if data:
            first_key = list(data.keys())[0]
            return f"{model._meta.verbose_name}: {first_key}={data[first_key]}"
        return model._meta.verbose_name

