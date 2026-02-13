import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { PermissionGuard, Permission } from '../common/guards/permission.guard';
import { RolesService } from './roles.service';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  AddPermissionsDto,
  RoleQueryDto,
  RoleQuerySchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  AddPermissionsSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('roles')
@Controller('account/roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得角色列表', 
    description: '分頁取得所有角色及權限統計' 
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'page_size', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限' })
  async getRoles(
    @Query(new ZodValidationPipe(RoleQuerySchema)) query: RoleQueryDto,
  ) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得角色詳情', 
    description: '取得角色及其完整權限列表和使用者列表' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '建立角色', 
    description: '建立新角色,可同時指定初始權限' 
  })
  @ApiBody({
    schema: {
      example: {
        code: 'CUSTOM_ROLE',
        name: '自訂角色',
        description: '角色說明',
        is_active: true,
        permissions: [
          {
            permission_type: 'api',
            resource: '/cramschool/students',
            method: 'GET'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '參數錯誤或角色已存在' })
  async createRole(
    @Body(new ZodValidationPipe(CreateRoleSchema)) data: CreateRoleDto,
  ) {
    return this.rolesService.create(data);
  }

  @Put(':id')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新角色', 
    description: '更新角色基本資訊 (不含權限)' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 400, description: '參數錯誤' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateRoleSchema)) data: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除角色', 
    description: '刪除角色及其所有權限設定' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 400, description: '角色仍被使用中,無法刪除或嘗試刪除 SUPERADMIN' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.delete(id);
  }

  @Put(':id/permissions')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '設定角色權限', 
    description: '完全覆蓋角色的權限設定 (會刪除原有權限)' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiBody({
    schema: {
      example: {
        permissions: [
          {
            permission_type: 'api',
            resource: '/cramschool/students',
            method: 'GET,POST'
          },
          {
            permission_type: 'api',
            resource: '/cramschool/courses',
            method: 'GET'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 200, description: '設定成功' })
  async setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddPermissionsSchema)) data: AddPermissionsDto,
  ) {
    return this.rolesService.setPermissions(id, data.permissions);
  }

  @Post(':id/permissions')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '新增角色權限', 
    description: '在現有權限基礎上追加新權限' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiBody({
    schema: {
      example: {
        permissions: [
          {
            permission_type: 'api',
            resource: '/cramschool/questions',
            method: 'GET'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 201, description: '新增成功' })
  async addPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddPermissionsSchema)) data: AddPermissionsDto,
  ) {
    return this.rolesService.addPermissions(id, data.permissions);
  }

  @Delete(':id/permissions/:permissionId')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '刪除權限', 
    description: '從角色中移除特定權限' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiParam({ name: 'permissionId', description: '權限 ID', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '權限不存在' })
  @ApiResponse({ status: 400, description: '權限不屬於此角色' })
  async removePermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.removePermission(id, permissionId);
  }

  @Post(':id/clone')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '複製角色', 
    description: '複製現有角色及其所有權限設定' 
  })
  @ApiParam({ name: 'id', description: '要複製的角色 ID', type: Number })
  @ApiBody({
    schema: {
      example: {
        name: '教師(自訂)',
        code: 'TEACHER_CUSTOM'
      }
    }
  })
  @ApiResponse({ status: 201, description: '複製成功' })
  @ApiResponse({ status: 400, description: '名稱或代碼已存在' })
  @ApiResponse({ status: 404, description: '來源角色不存在' })
  async cloneRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name: string; code?: string },
  ) {
    return this.rolesService.clone(id, data.name, data.code);
  }

  @Get(':id/users')
  @Permission({ resource: '/account/roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得角色使用者', 
    description: '查詢使用此角色的所有使用者' 
  })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRoleUsers(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleUsers(id);
  }
}
