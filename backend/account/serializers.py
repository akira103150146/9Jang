# accounts/serializers.py

from rest_framework import serializers
# from .models import CustomUser
from django.contrib.auth import get_user_model
# 透過函式獲取 CustomUser 模型
CustomUser = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    """
    用於 CustomUser 模型的序列化器，定義 API 應公開哪些欄位。
    """
    
    # 我們可以覆寫 role 欄位，確保它顯示為人類可讀的選項 (例如 '學生' 而不是 'STUDENT')
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = CustomUser
        # fields 定義了 API 介面將會公開或接收哪些欄位
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'role_display', 'is_staff', 'is_active',
        )
        # read_only_fields = ('is_staff', 'is_active') 
        # extra_kwargs = {'password': {'write_only': True}} # 處理密碼時使用，此處我們先省略密碼相關操作