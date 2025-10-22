from django.contrib import admin
# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# 繼承 UserAdmin 以使用 Django 內建的使用者管理介面
class CustomUserAdmin(UserAdmin):
    # 定義在管理後台清單頁面顯示的欄位
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    
    # 定義在編輯頁面中的欄位順序和分組
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}), # 新增一個包含 'role' 欄位的群組
    )
    
    # 定義可以過濾的欄位
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')
    
    # 定義搜尋欄位
    search_fields = ('username', 'first_name', 'last_name', 'email')

# 註冊 CustomUser 模型和其自訂的管理介面
admin.site.register(CustomUser, CustomUserAdmin)
# Register your models here.
