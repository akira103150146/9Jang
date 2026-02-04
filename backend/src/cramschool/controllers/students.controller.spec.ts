import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from '../services/students/students.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockStudent, createMockStudentWithRelations, createMockUser, createMockAuthRequest, createMockPaginatedResponse } from '../../test/helpers/test-data.helper';
import { createMockPrismaService } from '../../test/helpers/mock-prisma.helper';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: {
            getStudents: jest.fn(),
            getStudent: jest.fn(),
            createStudent: jest.fn(),
            updateStudent: jest.fn(),
            deleteStudent: jest.fn(),
            restoreStudent: jest.fn(),
            getTuitionStatus: jest.fn(),
            generateTuition: jest.fn(),
            batchGenerateTuitions: jest.fn(),
            getAttendanceAndLeaves: jest.fn(),
            resetPassword: jest.fn(),
            toggleAccountStatus: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudents', () => {
    it('應該呼叫 StudentsService.getStudents 並回傳學生列表', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'admin' } });
      const mockUser = createMockUser({ id: 1, role: 'ADMIN' });
      const mockStudents = [
        createMockStudent({ id: 1, studentId: 'S001' }),
        createMockStudent({ id: 2, studentId: 'S002' }),
      ];
      const mockResponse = createMockPaginatedResponse(mockStudents, 20, 1, 10);

      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'getStudents').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getStudents(query, mockRequest);

      // Assert
      expect(prisma.accountCustomUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(service.getStudents).toHaveBeenCalledWith(query, 1, 'ADMIN');
      expect(result).toEqual(mockResponse);
      expect(result.count).toBe(20);
    });

    it('應該正確傳遞查詢參數', async () => {
      // Arrange
      const query = { 
        page: 2, 
        page_size: 5,
        include_deleted: false,
        search: 'test',
        grade: '國三',
      };
      const mockRequest = createMockAuthRequest({ user: { id: 5 } });
      const mockUser = createMockUser({ id: 5, role: 'TEACHER' });
      const mockResponse = createMockPaginatedResponse([], 0, 2, 5);

      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      const getStudentsSpy = jest.spyOn(service, 'getStudents').mockResolvedValue(mockResponse);

      // Act
      await controller.getStudents(query, mockRequest);

      // Assert
      expect(getStudentsSpy).toHaveBeenCalledWith(query, 5, 'TEACHER');
    });

    it('應該從資料庫查詢用戶角色', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockRequest = createMockAuthRequest({ user: { id: 10 } });
      const mockUser = createMockUser({ id: 10, role: 'STUDENT' });
      const mockResponse = createMockPaginatedResponse([], 0, 1, 10);

      const findUniqueSpy = jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'getStudents').mockResolvedValue(mockResponse);

      // Act
      await controller.getStudents(query, mockRequest);

      // Assert
      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { id: 10 } });
    });

    it('應該在用戶不存在時使用預設角色 STUDENT', async () => {
      // Arrange
      const query = { page: 1, page_size: 10, include_deleted: false };
      const mockRequest = createMockAuthRequest({ user: { id: 99 } });
      const mockResponse = createMockPaginatedResponse([], 0, 1, 10);

      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(null);
      const getStudentsSpy = jest.spyOn(service, 'getStudents').mockResolvedValue(mockResponse);

      // Act
      await controller.getStudents(query, mockRequest);

      // Assert
      expect(getStudentsSpy).toHaveBeenCalledWith(query, 99, 'STUDENT');
    });
  });

  describe('getStudent', () => {
    it('應該呼叫 StudentsService.getStudent 並回傳指定學生', async () => {
      // Arrange
      const mockStudent = createMockStudentWithRelations({
        studentId: 'S001',
        student_id: 'S001',
        name: 'Test Student',
      });
      jest.spyOn(service, 'getStudent').mockResolvedValue(mockStudent);

      // Act
      const result = await controller.getStudent(1);

      // Assert
      expect(service.getStudent).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStudent);
      expect(result.student_id).toBe('S001');
    });

    it('應該正確傳遞學生 ID', async () => {
      // Arrange
      const mockStudent = createMockStudentWithRelations({ studentId: 'S123' });
      const getStudentSpy = jest.spyOn(service, 'getStudent').mockResolvedValue(mockStudent);

      // Act
      await controller.getStudent(123);

      // Assert
      expect(getStudentSpy).toHaveBeenCalledWith(123);
      expect(getStudentSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createStudent', () => {
    it('應該呼叫 StudentsService.createStudent 並回傳新建學生', async () => {
      // Arrange
      const createDto = {
        name: 'New Student',
        school: 'School',
        grade: '國三',
        phone: '0912345678',
      };
      const mockRequest = createMockAuthRequest({ user: { id: 1 } });
      const mockUser = createMockUser({ id: 1, role: 'ADMIN' });
      const mockStudent = createMockStudentWithRelations({
        studentId: 'S001',
        name: 'New Student',
      });

      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(service, 'createStudent').mockResolvedValue(mockStudent);

      // Act
      const result = await controller.createStudent(createDto, mockRequest);

      // Assert
      expect(service.createStudent).toHaveBeenCalledWith(createDto, 1, 'ADMIN');
      expect(result).toEqual(mockStudent);
    });

    it('應該正確傳遞用戶 ID 和角色', async () => {
      // Arrange
      const createDto = {
        name: 'Student',
        school: 'School',
        grade: '高一',
      };
      const mockRequest = createMockAuthRequest({ user: { id: 5 } });
      const mockUser = createMockUser({ id: 5, role: 'TEACHER' });
      const mockStudent = createMockStudentWithRelations();

      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      const createSpy = jest.spyOn(service, 'createStudent').mockResolvedValue(mockStudent);

      // Act
      await controller.createStudent(createDto, mockRequest);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(createDto, 5, 'TEACHER');
    });
  });

  describe('updateStudent', () => {
    it('應該呼叫 StudentsService.updateStudent 並回傳更新後的學生', async () => {
      // Arrange
      const updateDto = {
        name: 'Updated Name',
        school: 'Updated School',
        grade: '高二',
      };
      const mockStudent = createMockStudentWithRelations({
        studentId: 'S001',
        name: 'Updated Name',
      });

      jest.spyOn(service, 'updateStudent').mockResolvedValue(mockStudent);

      // Act
      const result = await controller.updateStudent(1, updateDto);

      // Assert
      expect(service.updateStudent).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockStudent);
      expect(result.name).toBe('Updated Name');
    });

    it('應該正確傳遞學生 ID 和更新資料', async () => {
      // Arrange
      const updateDto = {
        name: 'New Name',
        phone: '0987654321',
      };
      const mockStudent = createMockStudentWithRelations();
      const updateSpy = jest.spyOn(service, 'updateStudent').mockResolvedValue(mockStudent);

      // Act
      await controller.updateStudent(123, updateDto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(123, updateDto);
    });
  });

  describe('deleteStudent', () => {
    it('應該呼叫 StudentsService.deleteStudent 並回傳成功訊息', async () => {
      // Arrange
      jest.spyOn(service, 'deleteStudent').mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteStudent(1);

      // Assert
      expect(service.deleteStudent).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('應該正確傳遞學生 ID', async () => {
      // Arrange
      const deleteSpy = jest.spyOn(service, 'deleteStudent').mockResolvedValue(undefined);

      // Act
      await controller.deleteStudent(456);

      // Assert
      expect(deleteSpy).toHaveBeenCalledWith(456);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreStudent', () => {
    it('應該呼叫 StudentsService.restoreStudent 並回傳恢復後的學生', async () => {
      // Arrange
      const mockStudent = createMockStudentWithRelations({
        studentId: 'S001',
        isDeleted: false,
      });
      jest.spyOn(service, 'restoreStudent').mockResolvedValue(mockStudent);

      // Act
      const result = await controller.restoreStudent(1);

      // Assert
      expect(service.restoreStudent).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStudent);
    });
  });

  describe('getTuitionStatus', () => {
    it('應該呼叫 StudentsService.getTuitionStatus 並回傳學費狀態', async () => {
      // Arrange
      const mockStatus = {
        student_id: 1,
        total_unpaid: 3000,
        total_paid: 7000,
        tuition_months: [],
      };
      jest.spyOn(service, 'getTuitionStatus').mockResolvedValue(mockStatus);

      // Act
      const result = await controller.getTuitionStatus(1);

      // Assert
      expect(service.getTuitionStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStatus);
      expect(result.total_paid).toBe(7000);
    });

    it('應該正確傳遞學生 ID', async () => {
      // Arrange
      const mockStatus = {
        student_id: 789,
        total_unpaid: 0,
        total_paid: 5000,
        tuition_months: [],
      };
      const getStatusSpy = jest.spyOn(service, 'getTuitionStatus').mockResolvedValue(mockStatus);

      // Act
      await controller.getTuitionStatus(789);

      // Assert
      expect(getStatusSpy).toHaveBeenCalledWith(789);
    });
  });

  describe('generateTuition', () => {
    it('應該呼叫 StudentsService.generateTuition 並回傳生成結果', async () => {
      // Arrange
      const body = {
        year: 2024,
        month: 1,
        enrollment_id: 1,
        weeks: 4,
      };
      const mockResult = {
        success: true,
        fee_id: 123,
        amount: 5000,
        message: '學費生成成功',
      };
      jest.spyOn(service, 'generateTuition').mockResolvedValue(mockResult);

      // Act
      const result = await controller.generateTuition(1, body);

      // Assert
      expect(service.generateTuition).toHaveBeenCalledWith(1, body);
      expect(result).toEqual(mockResult);
      expect(result.success).toBe(true);
    });

    it('應該正確傳遞學生 ID 和生成參數', async () => {
      // Arrange
      const body = {
        year: 2024,
        month: 6,
        enrollment_id: 5,
        weeks: 2,
      };
      const mockResult = {
        success: true,
        fee_id: 456,
      };
      const generateSpy = jest.spyOn(service, 'generateTuition').mockResolvedValue(mockResult);

      // Act
      await controller.generateTuition(100, body);

      // Assert
      expect(generateSpy).toHaveBeenCalledWith(100, body);
    });
  });

  describe('batchGenerateTuitions', () => {
    it('應該呼叫 StudentsService.batchGenerateTuitions 並回傳批次結果', async () => {
      // Arrange
      const body = {
        student_ids: [1, 2, 3],
        weeks: 4,
      };
      const mockResult = {
        success: 3,
        failed: 0,
        results: [
          { student_id: 1, success: true },
          { student_id: 2, success: true },
          { student_id: 3, success: true },
        ],
      };
      jest.spyOn(service, 'batchGenerateTuitions').mockResolvedValue(mockResult);

      // Act
      const result = await controller.batchGenerateTuitions(body);

      // Assert
      expect(service.batchGenerateTuitions).toHaveBeenCalledWith([1, 2, 3], 4);
      expect(result).toEqual(mockResult);
      expect(result.success).toBe(3);
    });

    it('應該正確處理批次生成參數', async () => {
      // Arrange
      const body = {
        student_ids: [10, 20, 30, 40],
        weeks: 2,
      };
      const mockResult = {
        success: 4,
        failed: 0,
      };
      const batchSpy = jest.spyOn(service, 'batchGenerateTuitions').mockResolvedValue(mockResult);

      // Act
      await controller.batchGenerateTuitions(body);

      // Assert
      expect(batchSpy).toHaveBeenCalledWith([10, 20, 30, 40], 2);
    });
  });

  describe('getAttendanceAndLeaves', () => {
    it('應該呼叫 StudentsService.getAttendanceAndLeaves 並回傳出缺席記錄', async () => {
      // Arrange
      const mockData = {
        student_id: 1,
        student_name: 'Test Student',
        attendance: [
          { date: '2024-01-01', status: 'PRESENT' },
          { date: '2024-01-02', status: 'PRESENT' },
        ],
        leaves: [
          { date: '2024-01-03', reason: '生病' },
        ],
      };
      jest.spyOn(service, 'getAttendanceAndLeaves').mockResolvedValue(mockData);

      // Act
      const result = await controller.getAttendanceAndLeaves(1);

      // Assert
      expect(service.getAttendanceAndLeaves).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
      expect(result.attendance).toHaveLength(2);
      expect(result.leaves).toHaveLength(1);
    });
  });

  describe('resetPassword', () => {
    it('應該呼叫 StudentsService.resetPassword 並回傳結果', async () => {
      // Arrange
      const data = { password: 'newpass123' };
      const mockResult = {
        success: true,
        message: '密碼已重置',
      };

      jest.spyOn(service, 'resetPassword').mockResolvedValue(mockResult);

      // Act
      const result = await controller.resetPassword(1, data);

      // Assert
      expect(service.resetPassword).toHaveBeenCalledWith(1, 'newpass123');
      expect(result).toEqual(mockResult);
      expect(result.success).toBe(true);
    });

    it('應該正確傳遞學生 ID 和密碼', async () => {
      // Arrange
      const data = { password: 'reset123' };
      const mockResult = {
        success: true,
        message: '密碼已重置',
      };

      const resetSpy = jest.spyOn(service, 'resetPassword').mockResolvedValue(mockResult);

      // Act
      await controller.resetPassword(100, data);

      // Assert
      expect(resetSpy).toHaveBeenCalledWith(100, 'reset123');
    });
  });

  describe('toggleAccountStatus', () => {
    it('應該呼叫 StudentsService.toggleAccountStatus 並回傳帳號狀態', async () => {
      // Arrange
      const mockStatus = {
        is_active: true,
      };
      jest.spyOn(service, 'toggleAccountStatus').mockResolvedValue(mockStatus);

      // Act
      const result = await controller.toggleAccountStatus(1);

      // Assert
      expect(service.toggleAccountStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStatus);
      expect(result.is_active).toBe(true);
    });

    it('應該正確切換帳號狀態', async () => {
      // Arrange
      const mockStatus = {
        is_active: false,
      };
      jest.spyOn(service, 'toggleAccountStatus').mockResolvedValue(mockStatus);

      // Act
      const result = await controller.toggleAccountStatus(999);

      // Assert
      expect(service.toggleAccountStatus).toHaveBeenCalledWith(999);
      expect(result.is_active).toBe(false);
    });
  });
});
