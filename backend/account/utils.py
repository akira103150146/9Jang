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


def get_effective_role(user, request=None):
    """
    獲取用戶的有效角色（考慮角色切換）
    
    Args:
        user: 用戶對象
        request: Django request 對象（可選，用於獲取臨時角色 header）
    
    Returns:
        str: 有效角色（ADMIN, TEACHER, STUDENT, ACCOUNTANT）
    """
    if not user or not user.is_authenticated:
        return None
    
    # 如果不是管理員，直接返回原始角色
    if not user.is_admin():
        return user.role
    
    # 如果是管理員，檢查是否有臨時切換的角色（從請求 header 中讀取）
    if request:
        temp_role = request.META.get('HTTP_X_TEMP_ROLE')
        if temp_role:
            # 驗證角色是否有效
            from .models import UserRole
            valid_roles = [choice[0] for choice in UserRole.choices]
            if temp_role in valid_roles:
                return temp_role
    
    return user.role


def check_api_permission(user, api_path, method='GET', request=None):
    """
    檢查用戶是否有調用指定 API 的權限（考慮角色切換）
    
    Args:
        user: 用戶對象
        api_path: API 路徑
        method: HTTP 方法
        request: Django request 對象（可選，用於角色切換）
    
    Returns:
        bool: 是否有權限
    """
    if not user or not user.is_authenticated:
        return False
    
    # 獲取有效角色代碼
    effective_role_code = get_effective_role(user, request)
    
    # 如果有效角色是管理員，擁有所有權限
    if effective_role_code == 'ADMIN':
        return True
    
    # 使用 code 查詢 Role 物件並檢查權限
    try:
        # 直接查詢資料庫中 code=effective_role_code 的 Role 權限
        role = Role.objects.get(code=effective_role_code)
        return role.permissions.filter(
            permission_type='api',
            resource=api_path,
            method=method
        ).exists()
    except Role.DoesNotExist:
        return False


def filter_queryset_by_role(queryset, user, request=None, model_name=None):
    """
    根據用戶角色過濾 queryset（考慮角色切換）
    
    Args:
        queryset: Django QuerySet
        user: 用戶對象
        request: Django request 對象（可選，用於角色切換）
        model_name: 模型名稱（用於特殊過濾邏輯）
    
    Returns:
        QuerySet: 過濾後的 QuerySet
    """
    if not user or not user.is_authenticated:
        return queryset
    
    # 獲取有效角色
    effective_role = get_effective_role(user, request)
    
    # 管理員可以看到所有資料
    if effective_role == 'ADMIN':
        return queryset
    
    # 老師可以看到所有教學相關資料
    if effective_role == 'TEACHER':
        # 會計相關的資料，老師看不到
        if model_name in ['ExtraFee', 'Order', 'GroupOrder']:
            return queryset.none()
        return queryset
    
    # 學生只能看到自己的資料
    if effective_role == 'STUDENT':
        try:
            student = user.student_profile
            if model_name == 'Course':
                # 學生只能看到自己報名的課程
                from cramschool.models import StudentEnrollment
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    is_deleted=False
                ).values_list('course_id', flat=True)
                return queryset.filter(course_id__in=enrolled_course_ids)
            elif model_name == 'Student':
                # 學生只能看到自己的資料
                return queryset.filter(student_id=student.student_id)
            elif model_name in ['Quiz', 'Exam', 'CourseMaterial']:
                # 學生只能看到自己報名課程的資料
                from cramschool.models import StudentEnrollment
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    is_deleted=False
                ).values_list('course_id', flat=True)
                return queryset.filter(course_id__in=enrolled_course_ids)
            elif model_name == 'QuestionBank':
                # 學生看不到題庫
                return queryset.none()
        except:
            return queryset.none()
    
    # 會計只能看到帳務相關資料
    if effective_role == 'ACCOUNTANT':
        # 會計可以看到帳務、訂便當相關資料
        if model_name in ['ExtraFee', 'Order', 'GroupOrder', 'Restaurant', 'Student']:
            # 學生資料僅查看，不能編輯
            return queryset
        # 會計看不到教學相關模組
        if model_name in ['Course', 'Quiz', 'Exam', 'CourseMaterial', 'QuestionBank', 'ErrorLog', 'StudentAnswer']:
            return queryset.none()
        return queryset
    
    return queryset


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

