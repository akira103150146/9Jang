# account/management/commands/create_admin.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from account.models import UserRole

CustomUser = get_user_model()


class Command(BaseCommand):
    help = '創建預設管理員帳號'

    def handle(self, *args, **options):
        email = 'admin'
        password = 'admin123'
        username = email.split('@')[0]  # 使用 email 的前綴作為 username

        # 檢查用戶是否已存在
        if CustomUser.objects.filter(email=email).exists():
            user = CustomUser.objects.get(email=email)
            user.set_password(password)
            user.role = UserRole.ADMIN
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'管理員帳號已存在，已更新密碼和權限: {email}')
            )
        else:
            # 創建新用戶
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=UserRole.ADMIN,
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'成功創建管理員帳號: {email}')
            )

        self.stdout.write(
            self.style.SUCCESS(f'帳號: {email}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'密碼: {password}')
        )

