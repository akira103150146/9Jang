from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet
# 建立一個 Router 實例
router = DefaultRouter()
# 將 CustomUserViewSet 註冊到 'users' 這個 URL 前綴下
# 註冊後會自動產生 /users/, /users/{id}/ 等路由
router.register(r'users', CustomUserViewSet)
# 應用程式的 URL 模式
urlpatterns = [
    path('', include(router.urls)),
]