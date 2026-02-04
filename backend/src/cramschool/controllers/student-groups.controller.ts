import { AuthRequest } from '@/types/request.types';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentGroupsService } from '../services/student-groups.service';
import {
  CreateStudentGroupDto,
  UpdateStudentGroupDto,
  StudentGroupQuery,
  StudentGroup,
  StudentGroupQuerySchema,
  CreateStudentGroupSchema,
  UpdateStudentGroupSchema,
  AddStudentsToGroupDto,
  RemoveStudentsFromGroupDto,
  AddStudentsToGroupSchema,
  RemoveStudentsFromGroupSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../account/guards/jwt-auth.guard';

@ApiTags('students')
@Controller('cramschool/student-groups')
@UseGuards(JwtAuthGuard)
export class StudentGroupsController {
  constructor(private readonly studentGroupsService: StudentGroupsService) { }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得學生分組列表', description: '查詢所有學生分組' })
  @ApiResponse({ status: 200, description: '成功' })
  async getStudentGroups(
    @Query(new ZodValidationPipe(StudentGroupQuerySchema)) query: StudentGroupQuery,
  ) {
    return this.studentGroupsService.getStudentGroups(query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一分組', description: '查詢分組詳細資料和成員' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '分組不存在' })
  async getStudentGroup(@Param('id', ParseIntPipe) id: number): Promise<StudentGroup> {
    return this.studentGroupsService.getStudentGroup(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '建立學生分組', description: '新增學生分組' })
  @ApiResponse({ status: 201, description: '建立成功' })
  @ApiResponse({ status: 400, description: '驗證失敗' })
  async createStudentGroup(
    @Body(new ZodValidationPipe(CreateStudentGroupSchema)) createDto: CreateStudentGroupDto,
    @Request() req: AuthRequest,
  ): Promise<StudentGroup> {
    const user = req.user;
    return this.studentGroupsService.createStudentGroup(createDto, user.id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新分組', description: '修改分組資料' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '分組不存在' })
  async updateStudentGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentGroupSchema)) updateDto: UpdateStudentGroupDto,
  ): Promise<StudentGroup> {
    return this.studentGroupsService.updateStudentGroup(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '刪除分組', description: '刪除學生分組' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '分組不存在' })
  async deleteStudentGroup(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentGroupsService.deleteStudentGroup(id);
  }

  @Post(':id/add-students')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '添加學生到分組', description: '將學生加入分組' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '添加成功' })
  async addStudentsToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddStudentsToGroupSchema)) dto: AddStudentsToGroupDto,
  ): Promise<StudentGroup> {
    return this.studentGroupsService.addStudentsToGroup(id, dto);
  }

  @Post(':id/remove-students')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '從分組移除學生', description: '將學生從分組中移除' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '移除成功' })
  async removeStudentsFromGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(RemoveStudentsFromGroupSchema)) dto: RemoveStudentsFromGroupDto,
  ): Promise<StudentGroup> {
    return this.studentGroupsService.removeStudentsFromGroup(id, dto);
  }
}
