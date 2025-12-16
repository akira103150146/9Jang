from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import time
# from .models import CustomUser
from .serializers import (
    CustomUserSerializer, RoleSerializer, RolePermissionSerializer,
    RolePermissionCreateSerializer, AuditLogSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import Role, RolePermission, AuditLog
from .utils import log_audit, check_api_permission

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
    
    # Disable pagination to allow client-side filtering of all users
    pagination_class = None

    # (可選) 設置權限：這裡我們假設只有系統管理員才能進行全部 CRUD 操作
    # 實際專案中您可能需要更細緻的權限控制 (例如讓使用者自己修改自己的資料)
    permission_classes = [IsAuthenticated]
    
    # 您也可以在這裡加入自訂的邏輯，例如：
    def get_queryset(self):
    #     如果不是管理員，則只返回自己的帳號
        if self.request.user.is_admin():
            qs = CustomUser.objects.select_related('custom_role', 'student_profile').all()
            return qs
        return CustomUser.objects.select_related('custom_role', 'student_profile').filter(id=self.request.user.id)


class RoleViewSet(viewsets.ModelViewSet):
    """
    角色管理視圖集，只有管理員可以操作
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 管理員可以查看所有角色
        if self.request.user.is_admin():
            return Role.objects.prefetch_related('permissions').all()
        # 非管理員只能查看自己的角色（如果有的話）
        user = self.request.user
        if hasattr(user, 'custom_role') and user.custom_role:
            return Role.objects.prefetch_related('permissions').filter(id=user.custom_role.id)
        return Role.objects.none()
    
    def retrieve(self, request, *args, **kwargs):
        """
        允許用戶查看自己的角色，即使不是管理員
        """
        # 如果是管理員，允許查看任何角色
        if request.user.is_admin():
            return super().retrieve(request, *args, **kwargs)
        
        # 非管理員只能查看自己的角色
        role_id = kwargs.get('pk')
        user = request.user
        if hasattr(user, 'custom_role') and user.custom_role and str(user.custom_role.id) == str(role_id):
            # 使用 get_object_or_404 來獲取角色對象
            role = get_object_or_404(Role, id=role_id)
            serializer = self.get_serializer(role)
            return Response(serializer.data)
        
        return Response({'detail': '您沒有權限查看此角色'}, status=status.HTTP_403_FORBIDDEN)

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以創建角色'}, status=status.HTTP_403_FORBIDDEN)
        
        response = super().create(request, *args, **kwargs)
        log_audit(
            request, 'create', 'Role', 
            response.data.get('id'), 
            response.data.get('name'),
            response_status=response.status_code
        )
        return response

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以更新角色'}, status=status.HTTP_403_FORBIDDEN)
        
        response = super().update(request, *args, **kwargs)
        log_audit(
            request, 'update', 'Role', 
            kwargs.get('pk'), 
            response.data.get('name'),
            response_status=response.status_code
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以刪除角色'}, status=status.HTTP_403_FORBIDDEN)
        
        instance = self.get_object()
        role_name = instance.name
        role_id = kwargs.get('pk')
        response = super().destroy(request, *args, **kwargs)
        log_audit(
            request, 'delete', 'Role', 
            role_id, 
            role_name,
            response_status=response.status_code
        )
        return response

    @action(detail=True, methods=['post'], url_path='permissions')
    def update_permissions(self, request, pk=None):
        """批量更新角色的權限"""
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以更新角色權限'}, status=status.HTTP_403_FORBIDDEN)
        
        role = self.get_object()
        permissions_data = request.data.get('permissions', [])
        
        # 刪除現有權限
        RolePermission.objects.filter(role=role).delete()
        
        # 創建新權限
        created_permissions = []
        for perm_data in permissions_data:
            serializer = RolePermissionCreateSerializer(data=perm_data)
            if serializer.is_valid():
                permission = RolePermission.objects.create(
                    role=role,
                    **serializer.validated_data
                )
                created_permissions.append(RolePermissionSerializer(permission).data)
        
        log_audit(
            request, 'update', 'RolePermission', 
            pk, 
            f"{role.name} 的權限",
            response_status=status.HTTP_200_OK
        )
        return Response({
            'role': RoleSerializer(role).data,
            'permissions': created_permissions
        })


class RolePermissionViewSet(viewsets.ModelViewSet):
    """
    角色權限管理視圖集，只有管理員可以操作
    """
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_admin():
            return RolePermission.objects.none()
        queryset = RolePermission.objects.select_related('role').all()
        role_id = self.request.query_params.get('role', None)
        if role_id:
            queryset = queryset.filter(role_id=role_id)
        return queryset

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以創建權限'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以更新權限'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response({'detail': '只有管理員可以刪除權限'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    操作記錄視圖集，只有管理員可以查看
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_admin():
            return AuditLog.objects.none()
        
        queryset = AuditLog.objects.select_related('user', 'role')
        
        # 過濾條件
        user_id = self.request.query_params.get('user', None)
        role_id = self.request.query_params.get('role', None)
        action_type = self.request.query_params.get('action_type', None)
        resource_type = self.request.query_params.get('resource_type', None)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if role_id:
            queryset = queryset.filter(role_id=role_id)
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        return queryset.order_by('-created_at')


# 登入視圖
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    用戶登入，返回 JWT token
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'detail': '請提供 email 和 password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 嘗試使用 email 或 username 登入
    user = None
    try:
        # 先嘗試用 email 查找用戶
        user_obj = CustomUser.objects.filter(email=email).first()
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)
        else:
            # 如果 email 不存在，嘗試用 username
            user = authenticate(request, username=email, password=password)
    except Exception as e:
        return Response(
            {'detail': '登入失敗'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if user is not None:
        if user.is_active:
            # 生成 JWT token
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            serializer = CustomUserSerializer(user)
            
            # 記錄登入操作
            try:
                log_audit(
                    request, 'login', 'User', 
                    user.id, 
                    user.username,
                    response_status=status.HTTP_200_OK
                )
            except:
                pass  # 如果記錄失敗，不影響登入
            
            response_data = {
                'user': serializer.data,
                'access': str(access_token),
                'refresh': str(refresh),
                'message': '登入成功'
            }
            
            # 檢查是否需要修改密碼
            if user.must_change_password:
                response_data['must_change_password'] = True
                response_data['message'] = '登入成功，請修改密碼'
            
            return Response(response_data)
        else:
            return Response(
                {'detail': '帳號已被停用'},
                status=status.HTTP_403_FORBIDDEN
            )
    else:
        return Response(
            {'detail': '帳號或密碼錯誤'},
            status=status.HTTP_401_UNAUTHORIZED
        )


# 登出視圖
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    用戶登出，將 refresh token 加入黑名單
    """
    user = request.user
    refresh_token = request.data.get('refresh')
    
    # 記錄登出操作
    try:
        log_audit(
            request, 'logout', 'User', 
            user.id, 
            user.username,
            response_status=status.HTTP_200_OK
        )
    except:
        pass
    
    # 如果提供了 refresh token，將其加入黑名單
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            # 如果黑名單失敗，不影響登出
            pass
    
    return Response({'message': '登出成功'})


# 獲取當前用戶信息
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    獲取當前登入用戶的信息
    """
    serializer = CustomUserSerializer(request.user)
    return Response(serializer.data)


# 修改密碼視圖
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    修改當前用戶的密碼
    如果 must_change_password 為 True，修改後會設為 False
    """
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'detail': '請提供舊密碼和新密碼'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    # 驗證舊密碼
    if not user.check_password(old_password):
        return Response(
            {'detail': '舊密碼錯誤'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 設置新密碼
    user.set_password(new_password)
    
    # 如果之前需要修改密碼，現在已經修改了，設為 False
    if user.must_change_password:
        user.must_change_password = False
    
    user.save()
    
    # 記錄操作
    try:
        log_audit(
            request, 'update', 'User', 
            user.id, 
            user.username,
            description='修改密碼',
            response_status=status.HTTP_200_OK
        )
    except:
        pass
    
    return Response({'message': '密碼修改成功'})


# 角色切換視圖
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def switch_role_view(request):
    """
    管理者可以切換到其他角色視角
    使用前端 localStorage + 請求 header 的方式，避免依賴 session cookie
    只有管理員可以使用此功能
    """
    
    if not request.user.is_admin():

        return Response(
            {'detail': '只有管理員可以切換角色'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    target_role = request.data.get('role')
    if not target_role:
        return Response(
            {'detail': '請提供目標角色'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 驗證角色是否有效
    from .models import UserRole
    valid_roles = [choice[0] for choice in UserRole.choices]
    if target_role not in valid_roles:
        return Response(
            {'detail': f'無效的角色。有效角色：{", ".join(valid_roles)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 記錄操作
    try:
        log_audit(
            request, 'other', 'User', 
            request.user.id, 
            request.user.username,
            description=f'切換角色視角：{target_role}',
            response_status=status.HTTP_200_OK
        )
    except:
        pass
    
    # 返回臨時角色信息，前端會將其存儲在 localStorage 中
    return Response({
        'message': f'已切換到 {dict(UserRole.choices)[target_role]} 視角',
        'temp_role': target_role,
        'original_role': request.user.role
    })


# 重置角色視圖
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_role_view(request):
    """
    重置回原始角色
    前端會清除 localStorage 中的臨時角色
    只有管理員可以使用此功能
    """
    if not request.user.is_admin():
        return Response(
            {'detail': '只有管理員可以重置角色'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # 記錄操作
    try:
        log_audit(
            request, 'other', 'User', 
            request.user.id, 
            request.user.username,
            description=f'重置角色視角：回到原始角色 {request.user.role}',
            response_status=status.HTTP_200_OK
        )
    except:
        pass
    
    from .models import UserRole
    
    return Response({
        'message': f'已重置回 {dict(UserRole.choices)[request.user.role]} 視角',
        'current_role': request.user.role
    })


# 獲取當前角色視角
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_role_view(request):
    """
    獲取當前角色視角（包括臨時切換的角色）
    從請求 header 中讀取臨時角色（由前端發送）
    """
    
    # 從請求 header 中獲取臨時角色（前端會發送 X-Temp-Role header）
    temp_role = request.META.get('HTTP_X_TEMP_ROLE')
    original_role = request.user.role
    
    # 驗證臨時角色是否有效（防止偽造）
    from .models import UserRole
    valid_roles = [choice[0] for choice in UserRole.choices]
    if temp_role and temp_role not in valid_roles:
        temp_role = None
    
    # 只有管理員可以使用臨時角色
    if temp_role and not request.user.is_admin():
        temp_role = None
    
    
    return Response({
        'original_role': original_role,
        'original_role_display': dict(UserRole.choices)[original_role],
        'temp_role': temp_role,
        'temp_role_display': dict(UserRole.choices)[temp_role] if temp_role else None,
        'effective_role': temp_role if temp_role else original_role,
        'effective_role_display': dict(UserRole.choices)[temp_role] if temp_role else dict(UserRole.choices)[original_role]
    })

# 模擬指定用戶登入
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def impersonate_user_view(request):
    """
    管理員可以模擬指定用戶登入
    生成目標用戶的 access token 和 refresh token
    只有管理員可以使用此功能
    """
    if not request.user.is_admin():
        return Response(
            {'detail': '只有管理員可以模擬其他用戶'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    target_user_id = request.data.get('user_id')
    if not target_user_id:
        return Response(
            {'detail': '請提供目標用戶 ID'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    target_user = get_object_or_404(CustomUser, id=target_user_id)
    
    # 防止模擬其他管理員（可選，視需求而定）
    # if target_user.is_admin():
    #     return Response(
    #         {'detail': '不能模擬其他管理員'},
    #         status=status.HTTP_403_FORBIDDEN
    #     )
    
    # 生成目標用戶的 token
    refresh = RefreshToken.for_user(target_user)
    access_token = refresh.access_token
    
    serializer = CustomUserSerializer(target_user)
    
    # 記錄操作
    try:
        log_audit(
            request, 'other', 'User', 
            target_user.id, 
            target_user.username,
            description=f'模擬用戶登入：{target_user.username}',
            response_status=status.HTTP_200_OK
        )
    except:
        pass
    
    return Response({
        'user': serializer.data,
        'access': str(access_token),
        'refresh': str(refresh),
        'message': f'已切換為 {target_user.username} 身分'
    })
