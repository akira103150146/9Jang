import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { StudentsQueryService } from './students-query.service';
import { StudentsFeeService } from './students-fee.service';
import { StudentsPermissionService } from './students-permission.service';
import { StudentsStatsService } from './students-stats.service';
import { createMockPrismaService, resetAllMocks } from '../../../test/helpers/mock-prisma.helper';
import { createMockStudent, createMockStudentWithRelations, createMockUser } from '../../../test/helpers/test-data.helper';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: any;
  let queryService: StudentsQueryService;
  let feeService: StudentsFeeService;
  let permissionService: StudentsPermissionService;
  let statsService: StudentsStatsService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: StudentsQueryService,
          useValue: {
            buildWhereClause: jest.fn(),
            isEmptyCondition: jest.fn(),
          },
        },
        {
          provide: StudentsFeeService,
          useValue: {
            getTuitionStatus: jest.fn(),
            generateTuition: jest.fn(),
            batchGenerateTuitions: jest.fn(),
          },
        },
        {
          provide: StudentsPermissionService,
          useValue: {
            checkCreatePermission: jest.fn(),
            checkUpdatePermission: jest.fn(),
            checkDeletePermission: jest.fn(),
          },
        },
        {
          provide: StudentsStatsService,
          useValue: {
            calculateStudentStats: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
    queryService = module.get<StudentsQueryService>(StudentsQueryService);
    feeService = module.get<StudentsFeeService>(StudentsFeeService);
    permissionService = module.get<StudentsPermissionService>(StudentsPermissionService);
    statsService = module.get<StudentsStatsService>(StudentsStatsService);

    resetAllMocks(prisma);
    jest.clearAllMocks();
  });

  describe('getStudents', () => {
    it('應該回傳分頁的學生列表', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockWhere = { isDeleted: false };
      const mockStudents = [
        createMockStudentWithRelations({ id: 1, studentId: 'S001' }),
        createMockStudentWithRelations({ id: 2, studentId: 'S002' }),
      ];

      jest.spyOn(queryService, 'buildWhereClause').mockResolvedValue(mockWhere);
      jest.spyOn(queryService, 'isEmptyCondition').mockReturnValue(false);
      jest.spyOn(prisma.cramschoolStudent, 'findMany').mockResolvedValue(mockStudents);
      jest.spyOn(prisma.cramschoolStudent, 'count').mockResolvedValue(20);
      jest.spyOn(statsService, 'calculateStudentStats').mockResolvedValue({
        total_fees: 5000,
        unpaid_fees: 2000,
        enrollments_count: 1,
        has_tuition_needed: false,
      });

      // Act
      const result = await service.getStudents(query, 1, 'ADMIN');

      // Assert
      expect(result.count).toBe(20);
      expect(result.results).toHaveLength(2);
      expect(queryService.buildWhereClause).toHaveBeenCalledWith(query, 1, 'ADMIN');
      expect(prisma.cramschoolStudent.findMany).toHaveBeenCalled();
    });

    it('應該在空條件時回傳空結果', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockWhere = { _empty: true };

      jest.spyOn(queryService, 'buildWhereClause').mockResolvedValue(mockWhere);
      jest.spyOn(queryService, 'isEmptyCondition').mockReturnValue(true);

      // Act
      const result = await service.getStudents(query, 1, 'TEACHER');

      // Assert
      expect(result.count).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(prisma.cramschoolStudent.findMany).not.toHaveBeenCalled();
    });

    it('應該正確處理分頁參數', async () => {
      // Arrange
      const query = { page: 2, page_size: 5, include_deleted: false };
      const mockWhere = { isDeleted: false };

      jest.spyOn(queryService, 'buildWhereClause').mockResolvedValue(mockWhere);
      jest.spyOn(queryService, 'isEmptyCondition').mockReturnValue(false);
      jest.spyOn(prisma.cramschoolStudent, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.cramschoolStudent, 'count').mockResolvedValue(0);

      // Act
      await service.getStudents(query, 1, 'ADMIN');

      // Assert
      expect(prisma.cramschoolStudent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page 2 - 1) * pageSize 5
          take: 5,
        })
      );
    });

    it('應該使用 QueryService 構建 where 條件', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false, search: 'test', grade: '國三' };
      const mockWhere = { name: { contains: 'test' }, grade: '國三' };

      jest.spyOn(queryService, 'buildWhereClause').mockResolvedValue(mockWhere);
      jest.spyOn(queryService, 'isEmptyCondition').mockReturnValue(false);
      jest.spyOn(prisma.cramschoolStudent, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.cramschoolStudent, 'count').mockResolvedValue(0);

      // Act
      await service.getStudents(query, 5, 'TEACHER');

      // Assert
      expect(queryService.buildWhereClause).toHaveBeenCalledWith(query, 5, 'TEACHER');
    });

    it('應該包含學生的關聯資料', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockWhere = {};

      jest.spyOn(queryService, 'buildWhereClause').mockResolvedValue(mockWhere);
      jest.spyOn(queryService, 'isEmptyCondition').mockReturnValue(false);
      jest.spyOn(prisma.cramschoolStudent, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.cramschoolStudent, 'count').mockResolvedValue(0);

      // Act
      await service.getStudents(query, 1, 'ADMIN');

      // Assert
      expect(prisma.cramschoolStudent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: true,
            enrollments: expect.any(Object),
            extraFees: expect.any(Object),
            studentGroups: expect.any(Object),
          }),
        })
      );
    });

    it('應該使用 StatsService 計算統計信息', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockStudent = createMockStudentWithRelations();
      const mockStats = {
        total_fees: 10000,
        unpaid_fees: 3000,
        enrollments_count: 2,
        has_tuition_needed: true,
      };

      jest.spyOn(queryService, 'buildWhereClause').mockResolvedValue({});
      jest.spyOn(queryService, 'isEmptyCondition').mockReturnValue(false);
      jest.spyOn(prisma.cramschoolStudent, 'findMany').mockResolvedValue([mockStudent]);
      jest.spyOn(prisma.cramschoolStudent, 'count').mockResolvedValue(1);
      jest.spyOn(statsService, 'calculateStudentStats').mockResolvedValue(mockStats);

      // Act
      await service.getStudents(query, 1, 'ADMIN');

      // Assert
      expect(statsService.calculateStudentStats).toHaveBeenCalledWith(mockStudent);
    });
  });

  describe('getStudent', () => {
    it('應該成功取得指定學生', async () => {
      // Arrange
      const mockStudent = createMockStudentWithRelations({
        studentId: 'S001',
        name: 'Test Student',
      });

      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockStudent);

      // Act
      const result = await service.getStudent(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.student_id).toBe('S001');
      expect(prisma.cramschoolStudent.findUnique).toHaveBeenCalledWith({
        where: { studentId: 1 },
        include: expect.objectContaining({
          user: true,
          enrollments: expect.any(Object),
          extraFees: expect.any(Object),
          studentGroups: expect.any(Object),
        }),
      });
    });

    it('應該在學生不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getStudent(999)).rejects.toThrow(NotFoundException);
      await expect(service.getStudent(999)).rejects.toThrow('Student with ID 999 not found');
    });

    it('應該包含學生的關聯資料（enrollments, fees, groups）', async () => {
      // Arrange
      const mockStudent = createMockStudentWithRelations({
        studentId: 'S001',
        enrollments: [
          {
            enrollmentId: 'E001',
            courseId: 1,
            enrollDate: new Date('2024-01-01'),
            discountRate: 0,
            isActive: true,
            course: { courseName: '數學班' },
          },
        ],
      });

      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockStudent);

      // Act
      const result = await service.getStudent(1);

      // Assert
      expect(result.enrollments).toBeDefined();
      expect(Array.isArray(result.enrollments)).toBe(true);
    });
  });

  describe('createStudent', () => {
    it('應該成功建立學生（不含初始密碼）', async () => {
      // Arrange
      const createDto = {
        name: 'New Student',
        school: '台北市立某某國中',
        grade: '國三',
        phone: '0912345678',
        emergency_contact_name: 'Parent',
        emergency_contact_phone: '0923456789',
        notes: 'Test notes',
      };
      const mockStudent = createMockStudent({ studentId: 'S001' });
      const mockFullStudent = createMockStudentWithRelations({ studentId: 'S001' });

      jest.spyOn(permissionService, 'checkCreatePermission').mockReturnValue(undefined);
      jest.spyOn(prisma.cramschoolStudent, 'create').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockFullStudent);

      // Act
      const result = await service.createStudent(createDto, 1, 'ADMIN');

      // Assert
      expect(permissionService.checkCreatePermission).toHaveBeenCalledWith('ADMIN');
      expect(prisma.cramschoolStudent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Student',
          school: '台北市立某某國中',
          grade: '國三',
        }),
      });
      expect(result).toBeDefined();
    });

    it('應該成功建立學生並創建用戶帳號（含初始密碼）', async () => {
      // Arrange
      const createDto = {
        name: 'New Student',
        school: 'School',
        grade: '國三',
        initial_password: 'password123',
      };
      const mockStudent = createMockStudent({ studentId: 'S001' });
      const mockUser = createMockUser({ id: 10, username: 'student_S001' });
      const mockFullStudent = createMockStudentWithRelations({ studentId: 'S001' });

      jest.spyOn(permissionService, 'checkCreatePermission').mockReturnValue(undefined);
      jest.spyOn(prisma.cramschoolStudent, 'create').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.accountCustomUser, 'create').mockResolvedValue(mockUser);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockFullStudent);

      // Mock bcrypt
      const bcrypt = require('bcrypt');
      bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$hashedPassword');

      // Act
      await service.createStudent(createDto, 1, 'ADMIN');

      // Assert
      expect(prisma.accountCustomUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          username: 'student_S001',
          role: 'STUDENT',
          firstName: 'New Student',
        }),
      });
      expect(prisma.cramschoolStudent.update).toHaveBeenCalledWith({
        where: { studentId: 'S001' },
        data: { userId: 10 },
      });
    });

    it('應該使用 PermissionService 檢查建立權限', async () => {
      // Arrange
      const createDto = {
        name: 'Student',
        school: 'School',
        grade: '國三',
      };
      const mockStudent = createMockStudent();
      const mockFullStudent = createMockStudentWithRelations();

      const checkPermSpy = jest.spyOn(permissionService, 'checkCreatePermission').mockReturnValue(undefined);
      jest.spyOn(prisma.cramschoolStudent, 'create').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockFullStudent);

      // Act
      await service.createStudent(createDto, 5, 'TEACHER');

      // Assert
      expect(checkPermSpy).toHaveBeenCalledWith('TEACHER');
    });

    it('應該正確處理選填欄位', async () => {
      // Arrange
      const createDto = {
        name: 'Student',
        school: 'School',
        grade: '國三',
        // 沒有提供 phone, emergency_contact 等選填欄位
      };
      const mockStudent = createMockStudent();
      const mockFullStudent = createMockStudentWithRelations();

      jest.spyOn(permissionService, 'checkCreatePermission').mockReturnValue(undefined);
      const createSpy = jest.spyOn(prisma.cramschoolStudent, 'create').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockFullStudent);

      // Act
      await service.createStudent(createDto, 1, 'ADMIN');

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          notes: null,
        }),
      });
    });
  });

  describe('updateStudent', () => {
    it('應該成功更新學生資料', async () => {
      // Arrange
      const updateDto = {
        name: 'Updated Name',
        school: 'Updated School',
        grade: '高一',
        phone: '0987654321',
      };
      const mockStudent = createMockStudent({ studentId: 'S001' });
      const mockUpdatedStudent = createMockStudentWithRelations({
        studentId: 'S001',
        name: 'Updated Name',
      });

      jest.spyOn(prisma.cramschoolStudent, 'findUnique')
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce(mockUpdatedStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockUpdatedStudent);

      // Act
      const result = await service.updateStudent(1, updateDto);

      // Assert
      expect(prisma.cramschoolStudent.update).toHaveBeenCalledWith({
        where: { studentId: 1 },
        data: expect.objectContaining({
          name: 'Updated Name',
          school: 'Updated School',
          grade: '高一',
        }),
      });
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
    });

    it('應該在學生不存在時拋出 NotFoundException', async () => {
      // Arrange
      const updateDto = {
        name: 'Updated Name',
      };
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateStudent(999, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateStudent(999, updateDto)).rejects.toThrow('Student with ID 999 not found');
    });

    it('應該支援部分更新', async () => {
      // Arrange
      const updateDto = {
        name: 'Updated Name',
        // 只更新 name，其他欄位不變
      };
      const mockStudent = createMockStudent();
      const mockUpdatedStudent = createMockStudentWithRelations();

      jest.spyOn(prisma.cramschoolStudent, 'findUnique')
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce(mockUpdatedStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockUpdatedStudent);

      // Act
      await service.updateStudent(1, updateDto);

      // Assert
      expect(prisma.cramschoolStudent.update).toHaveBeenCalled();
    });

    it('應該在更新後重新取得完整學生資料', async () => {
      // Arrange
      const updateDto = { name: 'Updated' };
      const mockStudent = createMockStudent({ studentId: 'S001' });
      const mockUpdatedStudent = createMockStudentWithRelations({ studentId: 'S001' });

      jest.spyOn(prisma.cramschoolStudent, 'findUnique')
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce(mockUpdatedStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockUpdatedStudent);

      // Act
      await service.updateStudent(1, updateDto);

      // Assert - getStudent 會再次呼叫 findUnique
      expect(prisma.cramschoolStudent.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteStudent', () => {
    it('應該成功軟刪除學生', async () => {
      // Arrange
      const mockStudent = createMockStudent({ studentId: 'S001', isDeleted: false });

      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue({ ...mockStudent, isDeleted: true });
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.cramschoolAttendance, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.cramschoolLeave, 'updateMany').mockResolvedValue({ count: 0 });

      // Act
      await service.deleteStudent(1);

      // Assert
      expect(prisma.cramschoolStudent.update).toHaveBeenCalledWith({
        where: { studentId: 1 },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });

    it('應該在學生不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteStudent(999)).rejects.toThrow(NotFoundException);
      await expect(service.deleteStudent(999)).rejects.toThrow('Student with ID 999 not found');
    });

    it('應該軟刪除相關的 enrollments, fees, attendance, leaves', async () => {
      // Arrange
      const mockStudent = createMockStudent();

      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockStudent);
      const enrollmentSpy = jest.spyOn(prisma.cramschoolStudentEnrollment, 'updateMany').mockResolvedValue({ count: 2 });
      const feeSpy = jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 3 });
      const attendanceSpy = jest.spyOn(prisma.cramschoolAttendance, 'updateMany').mockResolvedValue({ count: 10 });
      const leaveSpy = jest.spyOn(prisma.cramschoolLeave, 'updateMany').mockResolvedValue({ count: 1 });

      // Act
      await service.deleteStudent(1);

      // Assert
      expect(enrollmentSpy).toHaveBeenCalledWith({
        where: { studentId: 1, isDeleted: false },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
      expect(feeSpy).toHaveBeenCalledWith({
        where: { studentId: 1, isDeleted: false },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
      expect(attendanceSpy).toHaveBeenCalled();
      expect(leaveSpy).toHaveBeenCalled();
    });

    it('應該使用 Promise.all 同時軟刪除所有相關記錄', async () => {
      // Arrange
      const mockStudent = createMockStudent();

      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockStudent);
      jest.spyOn(prisma.cramschoolStudentEnrollment, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.cramschoolAttendance, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.cramschoolLeave, 'updateMany').mockResolvedValue({ count: 0 });

      // Act
      await service.deleteStudent(1);

      // Assert - 驗證所有 updateMany 都被呼叫
      expect(prisma.cramschoolStudentEnrollment.updateMany).toHaveBeenCalled();
      expect(prisma.cramschoolExtraFee.updateMany).toHaveBeenCalled();
      expect(prisma.cramschoolAttendance.updateMany).toHaveBeenCalled();
      expect(prisma.cramschoolLeave.updateMany).toHaveBeenCalled();
    });
  });

  describe('restoreStudent', () => {
    it('應該成功恢復已刪除的學生', async () => {
      // Arrange
      const mockStudent = createMockStudent({ isDeleted: true });
      const mockRestoredStudent = createMockStudentWithRelations({ isDeleted: false });

      jest.spyOn(prisma.cramschoolStudent, 'findUnique')
        .mockResolvedValueOnce(mockStudent)
        .mockResolvedValueOnce(mockRestoredStudent);
      jest.spyOn(prisma.cramschoolStudent, 'update').mockResolvedValue(mockRestoredStudent);

      // Act
      const result = await service.restoreStudent(1);

      // Assert
      expect(prisma.cramschoolStudent.update).toHaveBeenCalledWith({
        where: { studentId: 1 },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
      expect(result).toBeDefined();
    });

    it('應該在學生不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolStudent, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.restoreStudent(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTuitionStatus', () => {
    it('應該呼叫 FeeService.getTuitionStatus', async () => {
      // Arrange
      const mockStatus = {
        total: 10000,
        paid: 7000,
        unpaid: 3000,
      };
      jest.spyOn(feeService, 'getTuitionStatus').mockResolvedValue(mockStatus);

      // Act
      const result = await service.getTuitionStatus(1);

      // Assert
      expect(feeService.getTuitionStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStatus);
    });
  });

  describe('generateTuition', () => {
    it('應該呼叫 FeeService.generateTuition', async () => {
      // Arrange
      const data = { year: 2024, month: 1, enrollment_id: 1, weeks: 4 };
      const mockResult = {
        success: true,
        fee_id: 123,
      };
      jest.spyOn(feeService, 'generateTuition').mockResolvedValue(mockResult);

      // Act
      const result = await service.generateTuition(1, data);

      // Assert
      expect(feeService.generateTuition).toHaveBeenCalledWith(1, data);
      expect(result).toEqual(mockResult);
    });
  });

  describe('batchGenerateTuitions', () => {
    it('應該呼叫 FeeService.batchGenerateTuitions', async () => {
      // Arrange
      const studentIds = [1, 2, 3];
      const mockResult = {
        success: 3,
        failed: 0,
      };
      jest.spyOn(feeService, 'batchGenerateTuitions').mockResolvedValue(mockResult);

      // Act
      const result = await service.batchGenerateTuitions(studentIds, 4);

      // Assert
      expect(feeService.batchGenerateTuitions).toHaveBeenCalledWith(studentIds, 4);
      expect(result).toEqual(mockResult);
    });
  });
});
