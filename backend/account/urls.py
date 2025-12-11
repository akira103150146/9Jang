from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomUserViewSet, RoleViewSet, RolePermissionViewSet, AuditLogViewSet,
    login_view, logout_view, current_user_view, change_password_view,
    switch_role_view, reset_role_view, current_role_view, impersonate_user_view
)
# 建立一個 Router 實例
router = DefaultRouter()
# 將 CustomUserViewSet 註冊到 'users' 這個 URL 前綴下
# 註冊後會自動產生 /users/, /users/{id}/ 等路由
router.register(r'users', CustomUserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'role-permissions', RolePermissionViewSet)
router.register(r'audit-logs', AuditLogViewSet)
# 應用程式的 URL 模式
# 注意：將 users/me/ 放在 router.urls 之前，避免被 router 的路由覆蓋
urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT token 刷新
    path('users/me/', current_user_view, name='current-user'),  # 必須在 router.urls 之前
    path('change-password/', change_password_view, name='change-password'),
    path('switch-role/', switch_role_view, name='switch-role'),
    path('reset-role/', reset_role_view, name='reset-role'),
    path('current-role/', current_role_view, name='current-role'),
    path('impersonate-user/', impersonate_user_view, name='impersonate-user'),
    path('', include(router.urls)),
]