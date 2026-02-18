import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  CreateRolePermissionDto,
  RoleQueryDto,
} from '@9jang/shared';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 分頁查詢所有角色
   */
  async findAll(query: RoleQueryDto) {
    const { page, page_size, search, is_active } = query;
    const skip = (page - 1) * page_size;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (is_active !== undefined) {
      where.isActive = is_active;
    }

    const [roles, total] = await Promise.all([
      this.prisma.accountRole.findMany({
        where,
        include: {
          permissions: true,
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: page_size,
      }),
      this.prisma.accountRole.count({ where }),
    ]);

    return {
      data: roles.map(role => ({
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        is_active: role.isActive,
        created_at: role.createdAt.toISOString(),
        updated_at: role.updatedAt.toISOString(),
        permissions_count: role.permissions.length,
        users_count: role._count.users,
      })),
      total,
      page,
      page_size,
    };
  }

  /**
   * 查詢單一角色詳情
   */
  async findOne(id: number) {
    const role = await this.prisma.accountRole.findUnique({
      where: { id },
      include: {
        permissions: {
          orderBy: [
            { permissionType: 'asc' },
            { resource: 'asc' },
          ],
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      is_active: role.isActive,
      created_at: role.createdAt.toISOString(),
      updated_at: role.updatedAt.toISOString(),
      permissions: role.permissions.map(p => ({
        id: p.id,
        role_id: p.roleId,
        permission_type: p.permissionType,
        resource: p.resource,
        method: p.method,
        created_at: p.createdAt.toISOString(),
      })),
      users: role.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        is_active: u.isActive,
      })),
    };
  }

  /**
   * 建立角色 (可同時設定權限)
   */
  async create(data: CreateRoleDto & { permissions?: CreateRolePermissionDto[] }) {
    // 檢查 code 是否重複
    if (data.code) {
      const existing = await this.prisma.accountRole.findUnique({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestException(`角色代碼 "${data.code}" 已存在`);
      }
    }

    // 檢查 name 是否重複
    const existingName = await this.prisma.accountRole.findUnique({
      where: { name: data.name },
    });
    if (existingName) {
      throw new BadRequestException(`角色名稱 "${data.name}" 已存在`);
    }

    const role = await this.prisma.accountRole.create({
      data: {
        code: data.code || null,
        name: data.name,
        description: data.description || '',
        isActive: data.is_active ?? true,
        permissions: data.permissions
          ? {
              create: data.permissions.map((p: { permission_type: string; resource: string; method?: string | null }) => ({
                permissionType: p.permission_type,
                resource: p.resource,
                method: p.method || null,
              })),
            }
          : undefined,
      },
      include: { permissions: true },
    });

    return this.findOne(role.id);
  }

  /**
   * 更新角色基本資訊
   */
  async update(id: number, data: UpdateRoleDto) {
    const role = await this.prisma.accountRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    // 檢查 code 是否重複
    if (data.code && data.code !== role.code) {
      const existing = await this.prisma.accountRole.findUnique({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestException(`角色代碼 "${data.code}" 已存在`);
      }
    }

    // 檢查 name 是否重複
    if (data.name && data.name !== role.name) {
      const existingName = await this.prisma.accountRole.findUnique({
        where: { name: data.name },
      });
      if (existingName) {
        throw new BadRequestException(`角色名稱 "${data.name}" 已存在`);
      }
    }

    await this.prisma.accountRole.update({
      where: { id },
      data: {
        code: data.code !== undefined ? data.code : undefined,
        name: data.name,
        description: data.description,
        isActive: data.is_active,
      },
    });

    return this.findOne(id);
  }

  /**
   * 刪除角色
   */
  async delete(id: number) {
    const role = await this.prisma.accountRole.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    // 檢查是否為 SUPERADMIN
    if (role.code === 'SUPERADMIN') {
      throw new BadRequestException('無法刪除超級管理員角色');
    }

    // 檢查是否有用戶使用此角色
    if (role._count.users > 0) {
      throw new BadRequestException(
        `無法刪除角色 "${role.name}",還有 ${role._count.users} 個用戶使用此角色`
      );
    }

    await this.prisma.accountRole.delete({
      where: { id },
    });

    return { message: '角色已刪除', id };
  }

  /**
   * 設定角色權限 (覆蓋)
   */
  async setPermissions(id: number, permissions: CreateRolePermissionDto[]) {
    const role = await this.prisma.accountRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    // 在 transaction 中刪除舊權限並建立新權限
    await this.prisma.$transaction([
      // 刪除所有舊權限
      this.prisma.accountRolePermission.deleteMany({
        where: { roleId: id },
      }),
      // 建立新權限
      this.prisma.accountRolePermission.createMany({
        data: permissions.map(p => ({
          roleId: id,
          permissionType: p.permission_type,
          resource: p.resource,
          method: p.method || null,
        })),
      }),
    ]);

    return this.findOne(id);
  }

  /**
   * 追加角色權限
   */
  async addPermissions(id: number, permissions: CreateRolePermissionDto[]) {
    const role = await this.prisma.accountRole.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    await this.prisma.accountRolePermission.createMany({
      data: permissions.map(p => ({
        roleId: id,
        permissionType: p.permission_type,
        resource: p.resource,
        method: p.method || null,
      })),
      skipDuplicates: true, // 跳過重複的權限
    });

    return this.findOne(id);
  }

  /**
   * 移除單一權限
   */
  async removePermission(roleId: number, permissionId: number) {
    const permission = await this.prisma.accountRolePermission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`權限 ID ${permissionId} 不存在`);
    }

    if (permission.roleId !== roleId) {
      throw new BadRequestException('權限不屬於此角色');
    }

    await this.prisma.accountRolePermission.delete({
      where: { id: permissionId },
    });

    return { message: '權限已移除', id: permissionId };
  }

  /**
   * 複製角色
   */
  async clone(id: number, newName: string, newCode?: string) {
    const sourceRole = await this.prisma.accountRole.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!sourceRole) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    // 檢查新名稱是否重複
    const existingName = await this.prisma.accountRole.findUnique({
      where: { name: newName },
    });
    if (existingName) {
      throw new BadRequestException(`角色名稱 "${newName}" 已存在`);
    }

    // 檢查新代碼是否重複
    if (newCode) {
      const existingCode = await this.prisma.accountRole.findUnique({
        where: { code: newCode },
      });
      if (existingCode) {
        throw new BadRequestException(`角色代碼 "${newCode}" 已存在`);
      }
    }

    // 建立新角色並複製權限
    const newRole = await this.prisma.accountRole.create({
      data: {
        code: newCode || null,
        name: newName,
        description: `${sourceRole.description} (複製自 ${sourceRole.name})`,
        isActive: true,
        permissions: {
          create: sourceRole.permissions.map(p => ({
            permissionType: p.permissionType,
            resource: p.resource,
            method: p.method,
          })),
        },
      },
      include: { permissions: true },
    });

    return this.findOne(newRole.id);
  }

  /**
   * 取得使用此角色的使用者
   */
  async getRoleUsers(id: number) {
    const role = await this.prisma.accountRole.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isStaff: true,
            dateJoined: true,
            lastLogin: true,
            studentProfile: {
              select: {
                studentId: true,
                name: true,
                grade: true,
              },
            },
            teacherProfile: {
              select: {
                teacherId: true,
                name: true,
              },
            },
          },
          orderBy: { dateJoined: 'desc' },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`);
    }

    return {
      role_id: role.id,
      role_name: role.name,
      role_code: role.code,
      users: role.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        is_active: u.isActive,
        is_staff: u.isStaff,
        date_joined: u.dateJoined.toISOString(),
        last_login: u.lastLogin?.toISOString() || null,
        student_profile: u.studentProfile,
        teacher_profile: u.teacherProfile,
      })),
      total_users: role.users.length,
    };
  }
}
