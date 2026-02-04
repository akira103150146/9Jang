import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from '../services/enrollments.service';
import { createMockEnrollment, createMockPaginatedResponse } from '../../test/helpers/test-data.helper';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let service: EnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: {
            getEnrollments: jest.fn(),
            getEnrollment: jest.fn(),
            createEnrollment: jest.fn(),
            updateEnrollment: jest.fn(),
            deleteEnrollment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  describe('getEnrollments', () => {
    it('應該回傳報名列表', async () => {
      const mockEnrollments = [createMockEnrollment(), createMockEnrollment()];
      const mockResponse = createMockPaginatedResponse(mockEnrollments, 20, 1, 10);
      jest.spyOn(service, 'getEnrollments').mockResolvedValue(mockResponse);

      const result = await controller.getEnrollments();

      expect(service.getEnrollments).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEnrollment', () => {
    it('應該取得指定報名', async () => {
      const mockEnrollment = createMockEnrollment({ enrollmentId: 1 });
      jest.spyOn(service, 'getEnrollment').mockResolvedValue(mockEnrollment);

      const result = await controller.getEnrollment(1);

      expect(service.getEnrollment).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('createEnrollment', () => {
    it('應該建立新報名', async () => {
      const createDto = { student_id: 1, course_id: 1, enroll_date: '2024-01-01', discount_rate: 0, is_active: true };
      const mockEnrollment = createMockEnrollment();
      jest.spyOn(service, 'createEnrollment').mockResolvedValue(mockEnrollment);

      const result = await controller.createEnrollment(createDto);

      expect(service.createEnrollment).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('updateEnrollment', () => {
    it('應該更新報名', async () => {
      const updateDto = { discount_rate: 0.1 };
      const mockEnrollment = createMockEnrollment();
      jest.spyOn(service, 'updateEnrollment').mockResolvedValue(mockEnrollment);

      const result = await controller.updateEnrollment(1, updateDto);

      expect(service.updateEnrollment).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('deleteEnrollment', () => {
    it('應該刪除報名', async () => {
      jest.spyOn(service, 'deleteEnrollment').mockResolvedValue(undefined);

      const result = await controller.deleteEnrollment(1);

      expect(service.deleteEnrollment).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
