import { Test, TestingModule } from '@nestjs/testing';
import { CoursePdfsService } from './course-pdfs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CoursePdfsService', () => {
  let service: CoursePdfsService;

  const mockPrismaService = {
    cramschoolTeacher: {
      findFirst: jest.fn(),
    },
    cramschoolCourse: {
      findUnique: jest.fn(),
    },
    cramschoolCoursePdf: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    cramschoolCoursePdfStudentGroup: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    cramschoolStudent: {
      findFirst: jest.fn(),
    },
    cramschoolStudentEnrollment: {
      findFirst: jest.fn(),
    },
    cramschoolStudentGroupStudent: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursePdfsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursePdfsService>(CoursePdfsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPdf', () => {
    const mockFile = {
      originalname: 'test.pdf',
      buffer: Buffer.from('test'),
      size: 1024,
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    const mockCreateDto = {
      title: 'Test PDF',
      description: 'Test Description',
      course_id: 1,
      student_group_ids: [1, 2],
      is_visible_to_all: false,
      allow_download: false,
      is_active: true,
    };

    it('應該成功上傳 PDF (老師)', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };
      const mockCourse = { courseId: 1, teacherId: 1 };
      const mockPdf = {
        pdfId: 1,
        title: 'Test PDF',
        description: 'Test Description',
        filePath: 'course_pdfs/1/test.pdf',
        fileSize: 1024,
        courseId: 1,
        uploadedById: 1,
        allowDownload: false,
        isVisibleToAll: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        studentGroups: [],
      };

      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCourse.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.cramschoolCoursePdf.create.mockResolvedValue(mockPdf);
      mockPrismaService.cramschoolCoursePdf.findUnique.mockResolvedValue(mockPdf);

      const result = await service.uploadPdf(mockFile, mockCreateDto, 1, 'TEACHER');

      expect(result).toBeDefined();
      expect(result.pdf_id).toBe(1);
      expect(result.title).toBe('Test PDF');
    });

    it('應該拒絕非老師上傳', async () => {
      await expect(service.uploadPdf(mockFile, mockCreateDto, 1, 'STUDENT')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('應該拒絕上傳到不屬於自己的課程', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };
      const mockCourse = { courseId: 1, teacherId: 2 }; // 不同的老師

      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCourse.findUnique.mockResolvedValue(mockCourse);

      await expect(service.uploadPdf(mockFile, mockCreateDto, 1, 'TEACHER')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('應該拒絕上傳到不存在的課程', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };

      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCourse.findUnique.mockResolvedValue(null);

      await expect(service.uploadPdf(mockFile, mockCreateDto, 1, 'TEACHER')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPdfsForStudent', () => {
    it('應該返回學生可見的 PDF 列表', async () => {
      const mockStudent = { studentId: 1, userId: 1 };
      const mockEnrollment = { enrollmentId: 1, studentId: 1, courseId: 1, isActive: true };
      const mockStudentGroups = [{ groupId: 1 }, { groupId: 2 }];
      const mockPdfs = [
        {
          pdfId: 1,
          title: 'Test PDF',
          description: 'Test',
          filePath: 'test.pdf',
          fileSize: 1024,
          courseId: 1,
          uploadedById: 1,
          allowDownload: false,
          isVisibleToAll: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          studentGroups: [],
        },
      ];

      mockPrismaService.cramschoolStudent.findFirst.mockResolvedValue(mockStudent);
      mockPrismaService.cramschoolStudentEnrollment.findFirst.mockResolvedValue(mockEnrollment);
      mockPrismaService.cramschoolStudentGroupStudent.findMany.mockResolvedValue(mockStudentGroups);
      mockPrismaService.cramschoolCoursePdf.findMany.mockResolvedValue(mockPdfs);

      const result = await service.getPdfsForStudent(1, 1);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Test PDF');
    });

    it('應該拒絕未報名課程的學生', async () => {
      const mockStudent = { studentId: 1, userId: 1 };

      mockPrismaService.cramschoolStudent.findFirst.mockResolvedValue(mockStudent);
      mockPrismaService.cramschoolStudentEnrollment.findFirst.mockResolvedValue(null);

      await expect(service.getPdfsForStudent(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('應該拒絕找不到學生資料', async () => {
      mockPrismaService.cramschoolStudent.findFirst.mockResolvedValue(null);

      await expect(service.getPdfsForStudent(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPdfsForTeacher', () => {
    it('應該返回老師課程的所有 PDF', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };
      const mockCourse = { courseId: 1, teacherId: 1 };
      const mockPdfs = [
        {
          pdfId: 1,
          title: 'Test PDF',
          description: 'Test',
          filePath: 'test.pdf',
          fileSize: 1024,
          courseId: 1,
          uploadedById: 1,
          allowDownload: false,
          isVisibleToAll: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          studentGroups: [],
        },
      ];

      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCourse.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.cramschoolCoursePdf.findMany.mockResolvedValue(mockPdfs);

      const result = await service.getPdfsForTeacher(1, 1, 'TEACHER');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it('應該拒絕查看不屬於自己課程的 PDF', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };
      const mockCourse = { courseId: 1, teacherId: 2 };

      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCourse.findUnique.mockResolvedValue(mockCourse);

      await expect(service.getPdfsForTeacher(1, 1, 'TEACHER')).rejects.toThrow(ForbiddenException);
    });

    it('管理員應該可以查看所有課程的 PDF', async () => {
      const mockPdfs = [
        {
          pdfId: 1,
          title: 'Test PDF',
          description: 'Test',
          filePath: 'test.pdf',
          fileSize: 1024,
          courseId: 1,
          uploadedById: 1,
          allowDownload: false,
          isVisibleToAll: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          studentGroups: [],
        },
      ];

      mockPrismaService.cramschoolCoursePdf.findMany.mockResolvedValue(mockPdfs);

      const result = await service.getPdfsForTeacher(1, 1, 'ADMIN');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });

  describe('toggleDownload', () => {
    it('應該成功切換下載權限', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };
      const mockPdf = {
        pdfId: 1,
        courseId: 1,
        course: { courseId: 1, teacherId: 1 },
        allowDownload: false,
      };
      const mockUpdatedPdf = {
        ...mockPdf,
        allowDownload: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        studentGroups: [],
      };

      mockPrismaService.cramschoolCoursePdf.findUnique
        .mockResolvedValueOnce(mockPdf)
        .mockResolvedValueOnce(mockUpdatedPdf);
      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCoursePdf.update.mockResolvedValue(mockUpdatedPdf);

      const result = await service.toggleDownload(1, true, 1, 'TEACHER');

      expect(result).toBeDefined();
      expect(result.allow_download).toBe(true);
    });

    it('應該拒絕非老師切換下載權限', async () => {
      const mockPdf = {
        pdfId: 1,
        courseId: 1,
        course: { courseId: 1, teacherId: 1 },
      };

      mockPrismaService.cramschoolCoursePdf.findUnique.mockResolvedValue(mockPdf);

      await expect(service.toggleDownload(1, true, 1, 'STUDENT')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deletePdf', () => {
    it('應該成功刪除 PDF (軟刪除)', async () => {
      const mockTeacher = { teacherId: 1, userId: 1 };
      const mockPdf = {
        pdfId: 1,
        courseId: 1,
        course: { courseId: 1, teacherId: 1 },
      };

      mockPrismaService.cramschoolCoursePdf.findUnique.mockResolvedValue(mockPdf);
      mockPrismaService.cramschoolTeacher.findFirst.mockResolvedValue(mockTeacher);
      mockPrismaService.cramschoolCoursePdf.update.mockResolvedValue({ ...mockPdf, isActive: false });

      await expect(service.deletePdf(1, 1, 'TEACHER')).resolves.not.toThrow();
    });

    it('應該拒絕非老師刪除 PDF', async () => {
      const mockPdf = {
        pdfId: 1,
        courseId: 1,
        course: { courseId: 1, teacherId: 1 },
      };

      mockPrismaService.cramschoolCoursePdf.findUnique.mockResolvedValue(mockPdf);

      await expect(service.deletePdf(1, 1, 'STUDENT')).rejects.toThrow(ForbiddenException);
    });

    it('管理員應該可以刪除任何 PDF', async () => {
      const mockPdf = {
        pdfId: 1,
        courseId: 1,
        course: { courseId: 1, teacherId: 1 },
      };

      mockPrismaService.cramschoolCoursePdf.findUnique.mockResolvedValue(mockPdf);
      mockPrismaService.cramschoolCoursePdf.update.mockResolvedValue({ ...mockPdf, isActive: false });

      await expect(service.deletePdf(1, 1, 'ADMIN')).resolves.not.toThrow();
    });
  });
});
