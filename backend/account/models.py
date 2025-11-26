from django.db import models
# accounts/models.py

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

# 1. 定義使用者身分/角色常數 (Roles)
class UserRole(models.TextChoices):
    # 這是最高權限的角色，通常可以管理所有內容
    ADMIN = 'ADMIN', '系統管理員'
    # 老師角色，可以建立課程、作業等
    TEACHER = 'TEACHER', '老師'
    # 學生角色，只能瀏覽課程、提交作業等
    STUDENT = 'STUDENT', '學生'

class CustomUser(AbstractUser):
    """
    繼承 AbstractUser，新增 'role' 欄位作為 RBAC 的核心角色識別。
    """
    
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.STUDENT, # 預設身分為學生
        verbose_name='身分/角色'
    )
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="customuser_set", # 這裡加上獨特的名稱
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="customuser_set", # 這裡加上獨特的名稱
        related_query_name="user",
    )
    # 注意：我們使用 Django 內建的 Permission 機制來處理具體的權限 (P, Permission)
    # 角色 (R) 通過 role 欄位管理。

    def is_admin(self):
        """檢查是否為系統管理員"""
        return self.role == UserRole.ADMIN

    def is_teacher(self):
        """檢查是否為老師"""
        return self.role == UserRole.TEACHER
        
    def is_student(self):
        """檢查是否為學生"""
        return self.role == UserRole.STUDENT

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = '自訂使用者'
        verbose_name_plural = '自訂使用者'
        

# Create your models here.
