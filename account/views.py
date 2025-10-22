from rest_framework import viewsets
from django.shortcuts import render
# from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework.permissions import IsAuthenticated , AllowAny
from django.contrib.auth import get_user_model

# 透過函式獲取 CustomUser 模型，確保使用的是 AUTH_USER_MODEL 指定的模型
CustomUser = get_user_model()
# Create your views here.
class CustomUserViewSet(viewsets.ModelViewSet):
    """
    提供 CustomUser 模型 CRUD 操作的 API 視圖集。
    ModelViewSet 預設包含了 list, retrieve, create, update, destroy 等操作。
    """
    
    # 定義這個視圖集處理哪個模型的物件
    queryset = CustomUser.objects.all()
    
    # 定義使用的序列化器
    serializer_class = CustomUserSerializer
    
    # (可選) 設置權限：這裡我們假設只有系統管理員才能進行全部 CRUD 操作
    # 實際專案中您可能需要更細緻的權限控制 (例如讓使用者自己修改自己的資料)
    permission_classes = [IsAuthenticated]
    
    # 您也可以在這裡加入自訂的邏輯，例如：
    def get_queryset(self):
    #     如果不是管理員，則只返回自己的帳號
        if self.request.user.is_admin():
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)