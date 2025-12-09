# account/utils.py

from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import AuditLog, Role


def get_client_ip(request):
    """獲取客戶端 IP 地址"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_audit(request, action_type, resource_type, resource_id=None, resource_name=None, description='', response_status=None):
    """
    記錄操作日誌
    
    Args:
        request: Django request 對象
        action_type: 操作類型 (create, update, delete, view, login, logout, other)
        resource_type: 資源類型 (例如: 'Student', 'Teacher')
        resource_id: 資源ID
        resource_name: 資源名稱
        description: 操作描述
        response_status: HTTP 回應狀態碼
    """
    user = request.user if hasattr(request, 'user') and request.user.is_authenticated else None
    role = user.custom_role if user and hasattr(user, 'custom_role') else None
    
    # 獲取請求數據（排除敏感信息）
    request_data = {}
    if hasattr(request, 'data'):
        request_data = dict(request.data)
        # 移除可能的敏感字段
        sensitive_fields = ['password', 'token', 'secret']
        for field in sensitive_fields:
            request_data.pop(field, None)
    
    AuditLog.objects.create(
        user=user,
        role=role,
        action_type=action_type,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        resource_name=resource_name,
        description=description,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        request_data=request_data,
        response_status=response_status,
    )


def check_api_permission(user, api_path, method='GET'):
    """
    檢查用戶是否有調用指定 API 的權限
    
    Args:
        user: 用戶對象
        api_path: API 路徑
        method: HTTP 方法
    
    Returns:
        bool: 是否有權限
    """
    if not user or not user.is_authenticated:
        return False
    
    # 管理員擁有所有權限
    if user.is_admin():
        return True
    
    # 檢查自訂角色的權限
    if user.custom_role:
        return user.has_api_permission(api_path, method)
    
    return False


def require_api_permission(api_path, method='GET'):
    """
    裝飾器：檢查 API 權限
    
    Usage:
        @require_api_permission('/api/cramschool/students/', 'POST')
        def create_student(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not check_api_permission(request.user, api_path, method):
                return Response(
                    {'detail': '您沒有權限執行此操作'},
                    status=status.HTTP_403_FORBIDDEN
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

