import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    // 跳過登入端點（在登入視圖中單獨處理）
    if (url.includes('/login') || url.includes('/token/refresh')) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          const statusCode = response?.statusCode || 200;
          await this.logAudit(
            user,
            method,
            url,
            body,
            statusCode,
            ip,
            headers['user-agent'],
          );
        },
        error: async (error) => {
          const statusCode = error?.status || 500;
          await this.logAudit(
            user,
            method,
            url,
            body,
            statusCode,
            ip,
            headers['user-agent'],
          );
        },
      }),
    );
  }

  private async logAudit(
    user: any,
    method: string,
    url: string,
    body: any,
    statusCode: number,
    ip: string,
    userAgent: string,
  ) {
    if (!user) {
      return; // 未認證的請求不記錄
    }

    try {
      // 確定操作類型
      let actionType = 'other';
      if (method === 'POST') {
        actionType = 'create';
      } else if (method === 'PUT' || method === 'PATCH') {
        actionType = 'update';
      } else if (method === 'DELETE') {
        actionType = 'delete';
      } else if (method === 'GET') {
        actionType = 'view';
      }

      // 確定資源類型
      const resourceType = this.extractResourceType(url);

      // 獲取用戶記錄以獲取角色
      const userRecord = await this.prisma.accountCustomUser.findUnique({
        where: { id: user.id },
        include: { customRole: true },
      });

      await this.prisma.accountAuditLog.create({
        data: {
          userId: user.id,
          roleId: userRecord?.customRoleId || null,
          actionType,
          resourceType,
          resourceId: this.extractResourceId(url, body),
          resourceName: this.extractResourceName(body),
          description: `${method} ${url}`,
          ipAddress: ip,
          userAgent,
          requestData: body || {},
          responseStatus: statusCode,
        },
      });
    } catch (error) {
      // 審計日誌失敗不應影響主流程
      console.error('Failed to log audit:', error);
    }
  }

  private extractResourceType(url: string): string {
    // 從 URL 提取資源類型
    const parts = url.split('/').filter((p) => p);
    if (parts.length >= 2) {
      return parts[parts.length - 2]; // 例如：/api/cramschool/students -> 'students'
    }
    return 'unknown';
  }

  private extractResourceId(url: string, body: any): string | null {
    // 從 URL 或 body 提取資源 ID
    const parts = url.split('/').filter((p) => p);
    const lastPart = parts[parts.length - 1];
    if (lastPart && !isNaN(parseInt(lastPart))) {
      return lastPart;
    }
    return body?.id?.toString() || null;
  }

  private extractResourceName(body: any): string | null {
    return body?.name || body?.title || body?.course_name || null;
  }
}
