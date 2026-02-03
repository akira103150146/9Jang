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

@Controller('cramschool/student-groups')
@UseGuards(JwtAuthGuard)
export class StudentGroupsController {
  constructor(private readonly studentGroupsService: StudentGroupsService) { }

  @Get()
  async getStudentGroups(
    @Query(new ZodValidationPipe(StudentGroupQuerySchema)) query: StudentGroupQuery,
  ) {
    return this.studentGroupsService.getStudentGroups(query);
  }

  @Get(':id')
  async getStudentGroup(@Param('id', ParseIntPipe) id: number): Promise<StudentGroup> {
    return this.studentGroupsService.getStudentGroup(id);
  }

  @Post()
  async createStudentGroup(
    @Body(new ZodValidationPipe(CreateStudentGroupSchema)) createDto: CreateStudentGroupDto,
    @Request() req,
  ): Promise<StudentGroup> {
    const user = req.user;
    return this.studentGroupsService.createStudentGroup(createDto, user.id);
  }

  @Put(':id')
  async updateStudentGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateStudentGroupSchema)) updateDto: UpdateStudentGroupDto,
  ): Promise<StudentGroup> {
    return this.studentGroupsService.updateStudentGroup(id, updateDto);
  }

  @Delete(':id')
  async deleteStudentGroup(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentGroupsService.deleteStudentGroup(id);
  }

  @Post(':id/add-students')
  async addStudentsToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddStudentsToGroupSchema)) dto: AddStudentsToGroupDto,
  ): Promise<StudentGroup> {
    return this.studentGroupsService.addStudentsToGroup(id, dto);
  }

  @Post(':id/remove-students')
  async removeStudentsFromGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(RemoveStudentsFromGroupSchema)) dto: RemoveStudentsFromGroupDto,
  ): Promise<StudentGroup> {
    return this.studentGroupsService.removeStudentsFromGroup(id, dto);
  }
}
