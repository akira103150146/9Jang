import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { PermissionGuard, Permission } from '../common/guards/permission.guard';
import { ApiResourcesService } from './api-resources.service';

@ApiTags('api-resources')
@Controller('account/api-resources')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ApiResourcesController {
  constructor(private apiResourcesService: ApiResourcesService) {}

  @Get()
  @Permission({ resource: '/account/api-resources' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得所有 API 資源', 
    description: '列出系統中所有可用的 API 端點及其 HTTP 方法' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功返回 API 資源列表',
    schema: {
      example: [
        {
          path: '/cramschool/students',
          method: 'GET',
          controller: 'StudentsController',
          handler: 'getStudents'
        },
        {
          path: '/cramschool/students',
          method: 'POST',
          controller: 'StudentsController',
          handler: 'createStudent'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限' })
  async getApiResources() {
    return this.apiResourcesService.discoverApiResources();
  }

  @Get('tree')
  @Permission({ resource: '/account/api-resources' })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '取得 API 資源樹狀結構', 
    description: '以模組分組的樹狀結構呈現所有 API 資源,方便管理權限' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功返回樹狀結構',
    schema: {
      example: [
        {
          module: 'cramschool',
          resources: [
            {
              path: '/cramschool/students',
              methods: ['GET', 'POST'],
              controller: 'StudentsController'
            },
            {
              path: '/cramschool/students/*',
              methods: ['GET', 'PUT', 'DELETE'],
              controller: 'StudentsController'
            }
          ]
        },
        {
          module: 'account',
          resources: [
            {
              path: '/account/login',
              methods: ['POST'],
              controller: 'AccountController'
            }
          ]
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限' })
  async getApiResourcesTree() {
    return this.apiResourcesService.getApiResourcesTree();
  }
}
