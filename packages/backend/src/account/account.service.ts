import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginRequestDto, LoginResponse, User, ChangePasswordRequestDto, RefreshTokenRequestDto, RefreshTokenResponse } from '@9jang/shared';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginRequestDto): Promise<LoginResponse> {
    // 嘗試使用 email 或 username 登入
    let user = await this.prisma.accountCustomUser.findFirst({
      where: {
        OR: [
          { email: loginDto.email },
          { username: loginDto.email },
        ],
      },
      include: {
        customRole: {
          include: {
            permissions: true,
          },
        },
        studentProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('帳號已被停用');
    }

    // 生成 JWT token
    const payload = { sub: user.id, username: user.username };
    const access = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refresh = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access,
      refresh,
      user: this.toUserDto(user),
    };
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.prisma.accountCustomUser.findUnique({
      where: { id: userId },
      include: {
        customRole: {
          include: {
            permissions: true,
          },
        },
        studentProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用戶不存在');
    }

    return this.toUserDto(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordRequestDto): Promise<void> {
    const user = await this.prisma.accountCustomUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用戶不存在');
    }

    // 驗證舊密碼
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.old_password, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('舊密碼錯誤');
    }

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);

    // 更新密碼並清除 must_change_password 標記
    await this.prisma.accountCustomUser.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenRequestDto): Promise<RefreshTokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh);
      const newAccess = this.jwtService.sign(
        { sub: payload.sub, username: payload.username },
        { expiresIn: '1h' },
      );

      return {
        access: newAccess,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUsers(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.accountCustomUser.findMany({
        skip,
        take: pageSize,
        include: {
          customRole: {
            include: {
              permissions: true,
            },
          },
          studentProfile: true,
        },
      }),
      this.prisma.accountCustomUser.count(),
    ]);

    return {
      count,
      next: skip + pageSize < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      results: results.map((user) => this.toUserDto(user)),
    };
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.accountCustomUser.findUnique({
      where: { id },
      include: {
        customRole: {
          include: {
            permissions: true,
          },
        },
        studentProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserDto(user);
  }

  async getRoles(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.accountRole.findMany({
        skip,
        take: pageSize,
        include: {
          permissions: true,
        },
      }),
      this.prisma.accountRole.count(),
    ]);

    return {
      count,
      next: skip + pageSize < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      results: results.map((role) => ({
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        is_active: role.isActive,
        created_at: role.createdAt.toISOString(),
        updated_at: role.updatedAt.toISOString(),
        permissions: role.permissions.map((p) => ({
          id: p.id,
          role: p.roleId,
          permission_type: p.permissionType,
          resource: p.resource,
          method: p.method,
          created_at: p.createdAt.toISOString(),
        })),
        permission_count: role.permissions.length,
      })),
    };
  }

  async getAuditLogs(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.accountAuditLog.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.accountAuditLog.count(),
    ]);

    return {
      count,
      next: skip + pageSize < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      results: results.map((log) => ({
        id: log.id,
        user: log.userId,
        role: log.roleId,
        impersonated_by: log.impersonatedById,
        action_type: log.actionType,
        resource_type: log.resourceType,
        resource_id: log.resourceId,
        resource_name: log.resourceName,
        description: log.description,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
        request_data: log.requestData as Record<string, any>,
        response_status: log.responseStatus,
        created_at: log.createdAt.toISOString(),
      })),
    };
  }

  private toUserDto(user: any): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      role: user.role as 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT',
      role_display: this.getRoleDisplay(user.role),
      custom_role: user.customRoleId,
      custom_role_name: user.customRole?.name || null,
      is_staff: user.isStaff,
      is_active: user.isActive,
      must_change_password: user.mustChangePassword,
      student_id: user.studentProfile?.studentId || null,
    };
  }

  private getRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      ADMIN: '系統管理員',
      TEACHER: '老師',
      STUDENT: '學生',
      ACCOUNTANT: '會計',
    };
    return roleMap[role] || role;
  }
}
