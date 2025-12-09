from django.db import models
# accounts/models.py

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils import timezone
import json

# 1. 定義使用者身分/角色常數 (Roles)
class UserRole(models.TextChoices):
    # 這是最高權限的角色，通常可以管理所有內容
    ADMIN = 'ADMIN', '系統管理員'
    # 老師角色，可以建立課程、作業等
    TEACHER = 'TEACHER', '老師'
    # 學生角色，只能瀏覽課程、提交作業等
    STUDENT = 'STUDENT', '學生'


class Role(models.Model):
    """
    動態角色定義模型，允許管理員創建自定義角色
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='角色名稱')
    description = models.TextField(blank=True, verbose_name='角色描述')
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '角色'
        verbose_name_plural = '角色'
        ordering = ['name']

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """
    定義每個角色可以訪問的頁面和 API
    """
    PERMISSION_TYPE_CHOICES = [
        ('page', '頁面'),
        ('api', 'API'),
    ]

    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions', verbose_name='角色')
    permission_type = models.CharField(max_length=10, choices=PERMISSION_TYPE_CHOICES, verbose_name='權限類型')
    resource = models.CharField(max_length=200, verbose_name='資源路徑')  # 例如: '/students', '/api/cramschool/students/'
    method = models.CharField(max_length=10, blank=True, null=True, verbose_name='HTTP 方法')  # 僅用於 API: GET, POST, PUT, DELETE
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='創建時間')

    class Meta:
        verbose_name = '角色權限'
        verbose_name_plural = '角色權限'
        unique_together = ['role', 'permission_type', 'resource', 'method']
        ordering = ['role', 'permission_type', 'resource']

    def __str__(self):
        method_str = f" [{self.method}]" if self.method else ""
        return f"{self.role.name} - {self.get_permission_type_display()}: {self.resource}{method_str}"


class AuditLog(models.Model):
    """
    操作記錄模型，記錄所有角色的操作
    """
    ACTION_TYPE_CHOICES = [
        ('create', '新增'),
        ('update', '更新'),
        ('delete', '刪除'),
        ('view', '查看'),
        ('login', '登入'),
        ('logout', '登出'),
        ('other', '其他'),
    ]

    user = models.ForeignKey('account.CustomUser', on_delete=models.SET_NULL, null=True, related_name='audit_logs', verbose_name='使用者')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name='角色')
    action_type = models.CharField(max_length=10, choices=ACTION_TYPE_CHOICES, verbose_name='操作類型')
    resource_type = models.CharField(max_length=100, verbose_name='資源類型')  # 例如: 'Student', 'Teacher'
    resource_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='資源ID')
    resource_name = models.CharField(max_length=200, blank=True, null=True, verbose_name='資源名稱')
    description = models.TextField(blank=True, verbose_name='操作描述')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='IP 地址')
    user_agent = models.TextField(blank=True, null=True, verbose_name='用戶代理')
    request_data = models.JSONField(default=dict, blank=True, verbose_name='請求數據')
    response_status = models.IntegerField(null=True, blank=True, verbose_name='回應狀態碼')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='操作時間')

    class Meta:
        verbose_name = '操作記錄'
        verbose_name_plural = '操作記錄'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['role', '-created_at']),
            models.Index(fields=['action_type', '-created_at']),
            models.Index(fields=['resource_type', '-created_at']),
        ]

    def __str__(self):
        user_str = self.user.username if self.user else '未知使用者'
        return f"{user_str} - {self.get_action_type_display()} - {self.resource_type} ({self.created_at})"


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
    # 新增：關聯到動態角色
    custom_role = models.ForeignKey(
        Role, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='users',
        verbose_name='自訂角色'
    )
    # 首次登入強制修改密碼
    must_change_password = models.BooleanField(
        default=False,
        verbose_name='首次登入需修改密碼',
        help_text='如果為 True，用戶首次登入時必須修改密碼'
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

    def has_page_permission(self, page_path):
        """
        檢查使用者是否有訪問指定頁面的權限
        管理員擁有所有權限
        """
        if self.is_admin():
            return True
        
        if self.custom_role:
            return self.custom_role.permissions.filter(
                permission_type='page',
                resource=page_path
            ).exists()
        
        return False

    def has_api_permission(self, api_path, method='GET'):
        """
        檢查使用者是否有調用指定 API 的權限
        管理員擁有所有權限
        """
        if self.is_admin():
            return True
        
        if self.custom_role:
            return self.custom_role.permissions.filter(
                permission_type='api',
                resource=api_path,
                method=method
            ).exists()
        
        return False

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = '自訂使用者'
        verbose_name_plural = '自訂使用者'
        

# Create your models here.
