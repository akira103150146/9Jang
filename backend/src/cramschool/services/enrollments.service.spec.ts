import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService, resetAllMocks } from '../../test/helpers/mock-prisma.helper';
import { createMockEnrollment } from '../../test/helpers/test-data.helper';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    prisma = module.get<PrismaService>(PrismaService);
    resetAllMocks(prisma);
  });

  describe('getEnrollments', () => {
    it('應該回傳分頁的報名列表', async () => {
      const mockEnrollments = [createMockEnrollment(), createMockEnrollment()];
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findMany').mockResolvedValue(mockEnrollments);
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'count').mockResolvedValue(20);

      const result = await service.getEnrollments(1, 10);

      expect(result.count).toBe(20);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('getEnrollment', () => {
    it('應該取得指定報名', async () => {
      const mockEnrollment = createMockEnrollment({ enrollmentId: 1 });
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(mockEnrollment);

      const result = await service.getEnrollment(1);

      expect(result).toBeDefined();
    });

    it('應該在報名不存在時拋出 NotFoundException', async () => {
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(null);

      await expect(service.getEnrollment(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createEnrollment', () => {
    it('應該成功建立報名', async () => {
      const createDto = {
        student_id: 1,
        course_id: 1,
        enroll_date: '2024-01-01',
        discount_rate: 0,
        is_active: true,
      };
      const mockEnrollment = createMockEnrollment();
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'create').mockResolvedValue(mockEnrollment);
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(mockEnrollment);

      const result = await service.createEnrollment(createDto);

      expect(result).toBeDefined();
      expect(prisma.cramschoolStudentEnrollment.create).toHaveBeenCalled();
    });
  });

  describe('updateEnrollment', () => {
    it('應該成功更新報名', async () => {
      const updateDto = { discount_rate: 0.1 };
      const mockEnrollment = createMockEnrollment();
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(mockEnrollment);
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'update').mockResolvedValue(mockEnrollment);

      const result = await service.updateEnrollment(1, updateDto);

      expect(result).toBeDefined();
    });

    it('應該在報名不存在時拋出 NotFoundException', async () => {
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(null);

      await expect(service.updateEnrollment(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEnrollment', () => {
    it('應該成功軟刪除報名', async () => {
      const mockEnrollment = createMockEnrollment();
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(mockEnrollment);
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'update').mockResolvedValue(mockEnrollment);

      await service.deleteEnrollment(1);

      expect(prisma.cramschoolStudentEnrollment.update).toHaveBeenCalledWith({
        where: { enrollmentId: 1 },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
    });

    it('應該在報名不存在時拋出 NotFoundException', async () => {
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteEnrollment(999)).rejects.toThrow(NotFoundException);
    });
  });
});
