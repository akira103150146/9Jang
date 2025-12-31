import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto, Teacher } from '@9jang/shared';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async getTeachers(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [results, count] = await Promise.all([
      this.prisma.cramschoolTeacher.findMany({
        skip,
        take: pageSize,
        include: {
          user: true,
          courses: true,
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.cramschoolTeacher.count(),
    ]);

    return createPaginatedResponse(
      results.map((t) => this.toTeacherDto(t)),
      count,
      page,
      pageSize,
    );
  }

  async getTeacher(id: number): Promise<Teacher> {
    const teacher = await this.prisma.cramschoolTeacher.findUnique({
      where: { teacherId: id },
      include: {
        user: true,
        courses: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return this.toTeacherDto(teacher);
  }

  async createTeacher(createDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = await this.prisma.cramschoolTeacher.create({
      data: {
        name: createDto.name!,
        permissionLevel: createDto.permission_level || 'Teacher',
        phone: createDto.phone || null,
        hireDate: createDto.hire_date ? new Date(createDto.hire_date) : null,
        userId: createDto.user_id || null,
      },
    });

    return this.getTeacher(teacher.teacherId);
  }

  async updateTeacher(id: number, updateDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.prisma.cramschoolTeacher.findUnique({
      where: { teacherId: id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    await this.prisma.cramschoolTeacher.update({
      where: { teacherId: id },
      data: {
        name: updateDto.name,
        permissionLevel: updateDto.permission_level,
        phone: updateDto.phone,
        hireDate: updateDto.hire_date ? new Date(updateDto.hire_date) : undefined,
        userId: updateDto.user_id,
      },
    });

    return this.getTeacher(id);
  }

  async deleteTeacher(id: number): Promise<void> {
    const teacher = await this.prisma.cramschoolTeacher.findUnique({
      where: { teacherId: id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    await this.prisma.cramschoolTeacher.delete({
      where: { teacherId: id },
    });
  }

  private toTeacherDto(teacher: any): Teacher {
    return {
      teacher_id: teacher.teacherId,
      name: teacher.name,
      user_id: teacher.userId,
      permission_level: teacher.permissionLevel as 'Teacher' | 'Admin' | 'Accountant',
      phone: teacher.phone,
      hire_date: teacher.hireDate?.toISOString().split('T')[0] || null,
    };
  }
}
