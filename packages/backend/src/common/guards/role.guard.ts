import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import 'reflect-metadata';

export const Roles = (...roles: string[]) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('roles', roles, target, key);
  };
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true; // 沒有指定角色要求，允許訪問
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('未認證');
    }

    // 從資料庫獲取用戶角色
    const userRecord = await this.prisma.accountCustomUser.findUnique({
      where: { id: user.id },
    });

    if (!userRecord) {
      throw new ForbiddenException('用戶不存在');
    }

    const userRole = userRecord.role;

    // 管理員擁有所有權限
    if (userRole === 'ADMIN') {
      return true;
    }

    // 檢查是否具有所需角色
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('權限不足');
    }

    return true;
  }
}
