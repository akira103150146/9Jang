from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
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
    
    # (可選) 設置權限：這裡我們假設只有系統管理員才能進行全部 CRUD 操作
    # 實際專案中您可能需要更細緻的權限控制 (例如讓使用者自己修改自己的資料)
    permission_classes = [IsAuthenticated]
    
    # 您也可以在這裡加入自訂的邏輯，例如：
    def get_queryset(self):
    #     如果不是管理員，則只返回自己的帳號
        if self.request.user.is_admin():
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)


class RoleViewSet(viewsets.ModelViewSet):
    """
    角色管理視圖集，只有管理員可以操作
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 只有管理員可以查看所有角色
        if self.request.user.is_admin():
            return Role.objects.all()
        return Role.objects.none()

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
        role_id = self.request.query_params.get('role', None)
        if role_id:
            return RolePermission.objects.filter(role_id=role_id)
        return RolePermission.objects.all()

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
            
            return Response({
                'user': serializer.data,
                'access': str(access_token),
                'refresh': str(refresh),
                'message': '登入成功'
            })
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