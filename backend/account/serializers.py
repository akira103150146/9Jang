# accounts/serializers.py

from rest_framework import serializers
# from .models import CustomUser
from django.contrib.auth import get_user_model
from .models import Role, RolePermission, AuditLog
# 透過函式獲取 CustomUser 模型
CustomUser = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    """
    用於 CustomUser 模型的序列化器，定義 API 應公開哪些欄位。
    """
    
    # 我們可以覆寫 role 欄位，確保它顯示為人類可讀的選項 (例如 '學生' 而不是 'STUDENT')
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    custom_role_name = serializers.CharField(source='custom_role.name', read_only=True)

    class Meta:
        model = CustomUser
        # fields 定義了 API 介面將會公開或接收哪些欄位
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'role_display', 'custom_role', 'custom_role_name', 
            'is_staff', 'is_active', 'must_change_password',
        )
        # read_only_fields = ('is_staff', 'is_active') 
        # extra_kwargs = {'password': {'write_only': True}} # 處理密碼時使用，此處我們先省略密碼相關操作


class RolePermissionSerializer(serializers.ModelSerializer):
    """角色權限序列化器"""
    permission_type_display = serializers.CharField(source='get_permission_type_display', read_only=True)

    class Meta:
        model = RolePermission
        fields = '__all__'


class RoleSerializer(serializers.ModelSerializer):
    """角色序列化器"""
    permissions = RolePermissionSerializer(many=True, read_only=True)
    permission_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = '__all__'

    def get_permission_count(self, obj):
        return obj.permissions.count()


class RolePermissionCreateSerializer(serializers.ModelSerializer):
    """用於批量創建角色權限的序列化器"""
    
    class Meta:
        model = RolePermission
        fields = ['permission_type', 'resource', 'method']


class AuditLogSerializer(serializers.ModelSerializer):
    """操作記錄序列化器"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['user', 'role', 'created_at']