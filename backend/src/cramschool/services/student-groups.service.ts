import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentGroupDto,
  UpdateStudentGroupDto,
  StudentGroupQuery,
  StudentGroup,
  AddStudentsToGroupDto,
  RemoveStudentsFromGroupDto,
} from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StudentGroupsService {
  constructor(private prisma: PrismaService) {}

  async getStudentGroups(query: StudentGroupQuery) {
    const page = query.page || 1;
    const pageSize = query.page_size || 10;
    const skip = (page - 1) * pageSize;

    // 構建 where 條件
    const where: any = {};

    // 搜尋
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    // 群組類型篩選
    if (query.group_type) {
      where.groupType = query.group_type;
    }

    // 查詢總數
    const count = await this.prisma.cramschoolStudentGroup.count({ where });

    // 查詢列表
    const groups = await this.prisma.cramschoolStudentGroup.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    const groupsWithStats = groups.map((group) => ({
      ...this.toStudentGroupDto(group),
      student_count: group.students.length,
    }));

    return createPaginatedResponse(groupsWithStats, count, page, pageSize);
  }

  async getStudentGroup(id: number): Promise<StudentGroup> {
    const group = await this.prisma.cramschoolStudentGroup.findUnique({
      where: { groupId: id },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Student group with ID ${id} not found`);
    }

    return this.toStudentGroupDto(group);
  }

  async createStudentGroup(createDto: CreateStudentGroupDto, userId: number): Promise<StudentGroup> {
    const group = await this.prisma.cramschoolStudentGroup.create({
      data: {
        name: createDto.name,
        description: createDto.description || null,
        groupType: createDto.group_type || 'teaching',
        createdById: createDto.created_by_id || userId,
      },
    });

    return this.getStudentGroup(group.groupId);
  }

  async updateStudentGroup(id: number, updateDto: UpdateStudentGroupDto): Promise<StudentGroup> {
    const group = await this.prisma.cramschoolStudentGroup.findUnique({
      where: { groupId: id },
    });

    if (!group) {
      throw new NotFoundException(`Student group with ID ${id} not found`);
    }

    const updated = await this.prisma.cramschoolStudentGroup.update({
      where: { groupId: id },
      data: {
        name: updateDto.name,
        description: updateDto.description,
        groupType: updateDto.group_type,
      },
    });

    return this.getStudentGroup(updated.groupId);
  }

  async deleteStudentGroup(id: number): Promise<void> {
    const group = await this.prisma.cramschoolStudentGroup.findUnique({
      where: { groupId: id },
    });

    if (!group) {
      throw new NotFoundException(`Student group with ID ${id} not found`);
    }

    // 刪除群組會自動刪除關聯的學生（CASCADE）
    await this.prisma.cramschoolStudentGroup.delete({
      where: { groupId: id },
    });
  }

  async addStudentsToGroup(groupId: number, dto: AddStudentsToGroupDto): Promise<StudentGroup> {
    // 檢查群組是否存在
    const group = await this.prisma.cramschoolStudentGroup.findUnique({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException(`Student group with ID ${groupId} not found`);
    }

    // 檢查學生是否存在
    const students = await this.prisma.cramschoolStudent.findMany({
      where: {
        studentId: { in: dto.student_ids },
      },
    });

    if (students.length !== dto.student_ids.length) {
      const foundIds = students.map((s) => s.studentId);
      const missingIds = dto.student_ids.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(`找不到以下學生 ID: ${missingIds.join(', ')}`);
    }

    // 批量添加學生到群組（使用 createMany，忽略已存在的記錄）
    await this.prisma.cramschoolStudentGroupStudent.createMany({
      data: dto.student_ids.map((studentId) => ({
        groupId,
        studentId,
      })),
      skipDuplicates: true, // 如果學生已經在群組中，跳過
    });

    return this.getStudentGroup(groupId);
  }

  async removeStudentsFromGroup(groupId: number, dto: RemoveStudentsFromGroupDto): Promise<StudentGroup> {
    // 檢查群組是否存在
    const group = await this.prisma.cramschoolStudentGroup.findUnique({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException(`Student group with ID ${groupId} not found`);
    }

    // 移除學生
    await this.prisma.cramschoolStudentGroupStudent.deleteMany({
      where: {
        groupId,
        studentId: { in: dto.student_ids },
      },
    });

    return this.getStudentGroup(groupId);
  }

  private toStudentGroupDto(group: any): StudentGroup {
    return {
      group_id: group.groupId,
      name: group.name,
      description: group.description,
      group_type: group.groupType,
      created_by_id: group.createdById,
      created_at: group.createdAt.toISOString(),
      updated_at: group.updatedAt.toISOString(),
    };
  }
}
