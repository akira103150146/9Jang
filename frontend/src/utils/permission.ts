/**
 * 前端權限檢查工具
 * 用於在 Vue 前端檢查使用者權限
 */

/**
 * 權限接口
 */
export interface Permission {
  type: 'api' | 'page';
  resource: string;
  method?: string | null;
}

/**
 * 用戶角色接口
 */
export interface UserRole {
  id: number;
  code: string | null;
  name: string;
  permissions: Permission[];
}

/**
 * 檢查用戶是否有特定權限
 * @param userPermissions 用戶的所有權限
 * @param resource 要檢查的資源路徑 (例: '/cramschool/students')
 * @param method HTTP 方法 (可選, 例: 'GET', 'POST')
 * @param type 權限類型 (可選, 預設為 'api')
 * @returns 是否有權限
 */
export function hasPermission(
  userPermissions: Permission[],
  resource: string,
  method?: string,
  type: 'api' | 'page' = 'api'
): boolean {
  return userPermissions.some(permission => {
    // 檢查權限類型
    if (permission.type !== type) {
      return false;
    }

    // 檢查資源是否匹配
    if (!matchResource(permission.resource, resource)) {
      return false;
    }

    // 檢查 HTTP 方法是否匹配
    if (method && !matchMethod(permission.method, method)) {
      return false;
    }

    return true;
  });
}

/**
 * 匹配資源路徑 (支援萬用字元)
 * @param permissionResource 權限中的資源路徑 (可能包含萬用字元)
 * @param requestResource 請求的資源路徑
 * @returns 是否匹配
 */
function matchResource(permissionResource: string, requestResource: string): boolean {
  // 完全匹配
  if (permissionResource === requestResource) {
    return true;
  }

  // 匹配 /cramschool/students/* (單層萬用字元)
  if (permissionResource.endsWith('/*')) {
    const baseResource = permissionResource.slice(0, -2);
    const regex = new RegExp(`^${escapeRegex(baseResource)}/[^/]+$`);
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
 * @param permissionMethod 權限中的方法 (可能是逗號分隔的多個方法或 *)
 * @param requestMethod 請求的方法
 * @returns 是否匹配
 */
function matchMethod(permissionMethod: string | null | undefined, requestMethod: string): boolean {
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
 * 轉義正則表達式特殊字元
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 檢查用戶是否為超級管理員
 * @param roleCode 角色代碼
 * @returns 是否為超級管理員
 */
export function isSuperAdmin(roleCode: string | null | undefined): boolean {
  return roleCode === 'SUPERADMIN';
}

/**
 * 從 JWT Token 中解析用戶資訊
 * @param token JWT Access Token
 * @returns 解析後的用戶資訊
 */
export function parseJwtPayload(token: string): {
  sub: number;
  username: string;
  role: string;
  roleId: number | null;
  isSuperadmin: boolean;
} | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
}

/**
 * 檢查多個權限 (AND 邏輯)
 * 用戶必須擁有所有指定的權限
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Array<{ resource: string; method?: string; type?: 'api' | 'page' }>
): boolean {
  return requiredPermissions.every(req =>
    hasPermission(userPermissions, req.resource, req.method, req.type || 'api')
  );
}

/**
 * 檢查多個權限 (OR 邏輯)
 * 用戶只需擁有其中一個權限即可
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Array<{ resource: string; method?: string; type?: 'api' | 'page' }>
): boolean {
  return requiredPermissions.some(req =>
    hasPermission(userPermissions, req.resource, req.method, req.type || 'api')
  );
}

/**
 * Vue 3 Composition API 範例
 * 
 * ```typescript
 * import { computed } from 'vue';
 * import { useUserStore } from '@/stores/user';
 * import { hasPermission, isSuperAdmin } from '@/utils/permission';
 * 
 * const userStore = useUserStore();
 * 
 * const canCreateStudent = computed(() => {
 *   if (isSuperAdmin(userStore.role)) return true;
 *   return hasPermission(userStore.permissions, '/cramschool/students', 'POST');
 * });
 * 
 * const canViewCourses = computed(() => {
 *   if (isSuperAdmin(userStore.role)) return true;
 *   return hasPermission(userStore.permissions, '/cramschool/courses', 'GET');
 * });
 * ```
 * 
 * Vue 3 Template 範例
 * 
 * ```vue
 * <template>
 *   <button v-if="canCreateStudent" @click="createStudent">新增學生</button>
 *   <div v-if="canViewCourses">課程列表...</div>
 * </template>
 * ```
 */
