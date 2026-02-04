import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from '../services/courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockCourse, createMockPaginatedResponse } from '../../test/helpers/test-data.helper';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: {
            getCourses: jest.fn(),
            getCourse: jest.fn(),
            createCourse: jest.fn(),
            updateCourse: jest.fn(),
            deleteCourse: jest.fn(),
            getStudentStatus: jest.fn(),
            getResources: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            accountCustomUser: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  describe('getCourses', () => {
    it('應該回傳課程列表', async () => {
      const mockCourses = [createMockCourse(), createMockCourse()];
      const mockResponse = createMockPaginatedResponse(mockCourses, 20, 1, 10);
      jest.spyOn(service, 'getCourses').mockResolvedValue(mockResponse);

      const result = await controller.getCourses();

      expect(service.getCourses).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCourse', () => {
    it('應該取得指定課程', async () => {
      const mockCourse = createMockCourse({ courseId: 1 });
      jest.spyOn(service, 'getCourse').mockResolvedValue(mockCourse);

      const result = await controller.getCourse(1);

      expect(service.getCourse).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('createCourse', () => {
    it('應該建立新課程', async () => {
      const createDto = {
        course_name: '數學班',
        teacher_id: 1,
        status: 'Active' as const,
        start_time: '18:00',
        end_time: '20:00',
        day_of_week: 'Mon' as const,
        fee_per_session: 500,
      };
      const mockCourse = createMockCourse();
      jest.spyOn(service, 'createCourse').mockResolvedValue(mockCourse);

      const result = await controller.createCourse(createDto);

      expect(service.createCourse).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('updateCourse', () => {
    it('應該更新課程', async () => {
      const updateDto = { course_name: 'Updated' };
      const mockCourse = createMockCourse();
      jest.spyOn(service, 'updateCourse').mockResolvedValue(mockCourse);

      const result = await controller.updateCourse(1, updateDto);

      expect(service.updateCourse).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('deleteCourse', () => {
    it('應該刪除課程', async () => {
      jest.spyOn(service, 'deleteCourse').mockResolvedValue(undefined);

      const result = await controller.deleteCourse(1);

      expect(service.deleteCourse).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
