# account/middleware.py

from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve
from .utils import log_audit, check_api_permission
from rest_framework.response import Response
from rest_framework import status
import json


class AuditLogMiddleware(MiddlewareMixin):
    """
    中間件：自動記錄 API 操作
    """
    
    # 需要記錄的操作方法
    LOGGED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    # 排除的路徑（不需要記錄）
    EXCLUDED_PATHS = [
        '/api/account/audit-logs/',
    ]
    
    def process_response(self, request, response):
        """處理回應時記錄操作"""
        # 只記錄 API 路徑
        if not request.path.startswith('/api/'):
            return response
        
        # 排除特定路徑
        if any(request.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return response
        
        # 只記錄特定方法
        if request.method not in self.LOGGED_METHODS:
            return response
        
        # 檢查用戶是否已認證
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
        
        # 確定操作類型
        action_type_map = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }
        action_type = action_type_map.get(request.method, 'other')
        
        # 確定資源類型（從 URL 路徑推斷）
        resource_type = self._get_resource_type(request.path)
        
        # 獲取資源ID（如果有的話）
        resource_id = None
        try:
            resolved = resolve(request.path)
            if 'pk' in resolved.kwargs:
                resource_id = resolved.kwargs['pk']
        except:
            pass
        
        # 記錄操作
        try:
            log_audit(
                request=request,
                action_type=action_type,
                resource_type=resource_type,
                resource_id=resource_id,
                description=f"{request.method} {request.path}",
                response_status=response.status_code if hasattr(response, 'status_code') else None
            )
        except Exception as e:
            # 記錄失敗不應該影響正常請求
            print(f"Audit log error: {e}")
        
        return response
    
    def _get_resource_type(self, path):
        """從路徑推斷資源類型"""
        # 移除前綴
        path = path.replace('/api/', '').replace('/cramschool/', '').replace('/account/', '')
        
        # 移除尾部的 ID 和斜線
        parts = [p for p in path.split('/') if p and not p.isdigit()]
        
        if parts:
            # 將路徑轉換為資源類型名稱
            resource = parts[0].rstrip('s')  # 移除複數形式
            return resource.capitalize()
        
        return 'Unknown'


class PermissionCheckMiddleware(MiddlewareMixin):
    """
    中間件：檢查 API 權限
    """
    
    # 排除的路徑（不需要權限檢查）
    EXCLUDED_PATHS = [
        '/api/account/users/',  # 用戶登入等操作
    ]
    
    def process_request(self, request):
        """處理請求時檢查權限"""
        # 只檢查 API 路徑
        if not request.path.startswith('/api/'):
            return None
        
        # 排除特定路徑
        if any(request.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return None
        
        # 檢查用戶是否已認證
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        
        # 檢查權限
        method = request.method
        if not check_api_permission(request.user, request.path, method):
            # 返回 403 錯誤
            from django.http import JsonResponse
            return JsonResponse(
                {'detail': '您沒有權限執行此操作'},
                status=403
            )
        
        return None

