import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService, resetAllMocks } from '../../test/helpers/mock-prisma.helper';
import { createMockCourse } from '../../test/helpers/test-data.helper';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);
    resetAllMocks(prisma);
  });

  describe('getCourses', () => {
    it('應該回傳分頁的課程列表', async () => {
      const mockCourses = [createMockCourse(), createMockCourse()];
      jest.spyOn(prisma.cramschoolCourse, 'findMany').mockResolvedValue(mockCourses);
      jest.spyOn(prisma.cramschoolCourse, 'count').mockResolvedValue(20);

      const result = await service.getCourses(1, 10);

      expect(result.count).toBe(20);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('getCourse', () => {
    it('應該取得指定課程', async () => {
      const mockCourse = createMockCourse({ courseId: 1 });
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(mockCourse);

      const result = await service.getCourse(1);

      expect(result).toBeDefined();
    });

    it('應該在課程不存在時拋出 NotFoundException', async () => {
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(null);

      await expect(service.getCourse(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCourse', () => {
    it('應該成功建立課程', async () => {
      const createDto = {
        course_name: '數學基礎班',
        teacher_id: 1,
        status: 'Active' as const,
        start_time: '18:00',
        end_time: '20:00',
        day_of_week: 'Mon' as const,
        fee_per_session: 500,
      };
      const mockCourse = createMockCourse();
      jest.spyOn(prisma.cramschoolCourse, 'create').mockResolvedValue(mockCourse);
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(mockCourse);

      const result = await service.createCourse(createDto);

      expect(result).toBeDefined();
      expect(prisma.cramschoolCourse.create).toHaveBeenCalled();
    });
  });

  describe('updateCourse', () => {
    it('應該成功更新課程', async () => {
      const updateDto = { course_name: 'Updated Name' };
      const mockCourse = createMockCourse();
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(mockCourse);
      jest.spyOn(prisma.cramschoolCourse, 'update').mockResolvedValue(mockCourse);

      const result = await service.updateCourse(1, updateDto);

      expect(result).toBeDefined();
    });

    it('應該在課程不存在時拋出 NotFoundException', async () => {
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(null);

      await expect(service.updateCourse(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCourse', () => {
    it('應該成功刪除課程', async () => {
      const mockCourse = createMockCourse();
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(mockCourse);
      jest.spyOn(prisma.cramschoolCourse, 'delete').mockResolvedValue(mockCourse);

      await service.deleteCourse(1);

      expect(prisma.cramschoolCourse.delete).toHaveBeenCalledWith({
        where: { courseId: 1 },
      });
    });

    it('應該在課程不存在時拋出 NotFoundException', async () => {
      jest.spyOn(prisma.cramschoolCourse, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteCourse(999)).rejects.toThrow(NotFoundException);
    });
  });
});
