import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

// Metadata keys
export const PERMISSION_KEY = 'permission_config';
export const PUBLIC_KEY = 'is_public';

/**
 * 權限配置接口
 */
export interface PermissionConfig {
  resource?: string;      // 資源路徑,不指定則自動使用路由路徑
  requireAuth?: boolean;  // 是否需要認證,預設 true
  allowPublic?: boolean;  // 是否允許公開存取
}

/**
 * Permission 裝飾器 - 設定權限配置
 */
export const Permission = (config: PermissionConfig = {}) => {
  return (target: any, key?: string, _descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSION_KEY, config, target, key);
  };
};

/**
 * Public 裝飾器 - 標記公開 API (不需要權限)
 */
export const Public = () => {
  return (target: any, key?: string, _descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(PUBLIC_KEY, true, target, key);
  };
};

/**
 * Permission Guard - 動態權限檢查
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 檢查是否為公開 API
    const isPublic = this.reflector.get<boolean>(PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 2. 檢查權限配置
    const permissionConfig = this.reflector.get<PermissionConfig>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    // 如果標記為 allowPublic,允許未登入用戶存取
    if (permissionConfig?.allowPublic) {
      return true;
    }

    // 3. 檢查是否已認證
    const requireAuth = permissionConfig?.requireAuth !== false;
    if (requireAuth && !user) {
      throw new ForbiddenException('請先登入');
    }

    // 如果不需要認證,直接通過
    if (!requireAuth) {
      return true;
    }

    // 4. 查詢用戶及其角色權限
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
      include: {
        customRole: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!userRecord) {
      throw new ForbiddenException('用戶不存在');
    }

    // 5. SUPERADMIN 角色通行證 (繞過所有權限檢查)
    if (userRecord.customRole?.code === 'SUPERADMIN') {
      this.logger.debug(`超級管理員 ${userRecord.username} 存取 ${request.method} ${request.path}`);
      return true;
    }

    // 6. 檢查是否有角色
    if (!userRecord.customRole) {
      throw new ForbiddenException('用戶未分配角色,無法存取系統');
    }

    // 7. 檢查角色是否啟用
    if (!userRecord.customRole.isActive) {
      throw new ForbiddenException('角色已被停用');
    }

    // 8. 取得要檢查的資源路徑
    const resource = permissionConfig?.resource || this.normalizeRoutePath(request.route.path);
    const method = request.method.toUpperCase();

    // 9. 檢查 API 權限
    const hasPermission = this.checkPermission(
      userRecord.customRole.permissions,
      resource,
      method,
    );

    if (!hasPermission) {
      this.logger.warn(
        `用戶 ${userRecord.username} (角色: ${userRecord.customRole.name}) ` +
        `無權限存取 ${method} ${resource}`
      );
      throw new ForbiddenException(
        `無權限執行此操作 [${method} ${resource}]`
      );
    }

    this.logger.debug(
      `用戶 ${userRecord.username} (角色: ${userRecord.customRole.name}) ` +
      `成功存取 ${method} ${resource}`
    );

    return true;
  }

  /**
   * 檢查權限
   */
  private checkPermission(
    permissions: any[],
    resource: string,
    method: string,
  ): boolean {
    return permissions.some(permission => {
      // 只檢查 API 類型的權限
      if (permission.permissionType !== 'api') {
        return false;
      }

      // 檢查資源是否匹配
      if (!this.matchResource(permission.resource, resource)) {
        return false;
      }

      // 檢查 HTTP 方法是否匹配
      if (!this.matchMethod(permission.method, method)) {
        return false;
      }

      return true;
    });
  }

  /**
   * 匹配資源路徑 (支援萬用字元)
   */
  private matchResource(permissionResource: string, requestResource: string): boolean {
    // 完全匹配
    if (permissionResource === requestResource) {
      return true;
    }

    // 匹配 /cramschool/students/* (單層萬用字元)
    if (permissionResource.endsWith('/*')) {
      const baseResource = permissionResource.slice(0, -2);
      const regex = new RegExp(`^${this.escapeRegex(baseResource)}/[^/]+$`);
      return regex.test(requestResource);
    }

    // 匹配 /cramschool/students/** (多層萬用字元)
    if (permissionResource.endsWith('/**')) {
      const baseResource = permissionResource.slice(0, -3);
      return requestResource.startsWith(baseResource + '/');
    }

    return false;
  }

  /**
   * 匹配 HTTP 方法
   */
  private matchMethod(permissionMethod: string | null, requestMethod: string): boolean {
    // 如果權限中沒有指定方法,表示允許所有方法
    if (!permissionMethod) {
      return true;
    }

    // 支援多個方法,用逗號分隔 例: "GET,POST"
    const methods = permissionMethod.split(',').map(m => m.trim().toUpperCase());
    
    // 支援 * 萬用字元 (允許所有方法)
    if (methods.includes('*')) {
      return true;
    }

    return methods.includes(requestMethod.toUpperCase());
  }

  /**
   * 標準化路由路徑 (移除參數)
   */
  private normalizeRoutePath(path: string): string {
    // /cramschool/students/:id -> /cramschool/students
    return path.replace(/\/:[^/]+/g, '');
  }

  /**
   * 轉義正則表達式特殊字元
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
