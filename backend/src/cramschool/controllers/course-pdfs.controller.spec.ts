import { Test, TestingModule } from '@nestjs/testing';
import { CoursePdfsController } from './course-pdfs.controller';
import { CoursePdfsService } from '../services/course-pdfs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CoursePdfsController', () => {
  let controller: CoursePdfsController;
  let service: CoursePdfsService;

  const mockCoursePdfsService = {
    uploadPdf: jest.fn(),
    getPdfsForStudent: jest.fn(),
    getPdfsForTeacher: jest.fn(),
    viewPdf: jest.fn(),
    downloadPdf: jest.fn(),
    toggleDownload: jest.fn(),
    updatePdf: jest.fn(),
    deletePdf: jest.fn(),
  };

  const mockPrismaService = {
    accountCustomUser: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursePdfsController],
      providers: [
        {
          provide: CoursePdfsService,
          useValue: mockCoursePdfsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<CoursePdfsController>(CoursePdfsController);
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

    const mockBody = {
      title: 'Test PDF',
      description: 'Test Description',
      student_group_ids: '[1, 2]',
      is_visible_to_all: 'false',
      allow_download: 'false',
    };

    const mockRequest = {
      user: { id: 1 },
    };

    const mockPdf = {
      pdf_id: 1,
      title: 'Test PDF',
      description: 'Test Description',
      file_path: 'course_pdfs/1/test.pdf',
      file_size: 1024,
      course_id: 1,
      uploaded_by_id: 1,
      student_group_ids: [1, 2],
      allow_download: false,
      is_visible_to_all: false,
      is_active: true,
      created_at: '2026-02-06T10:00:00.000Z',
      updated_at: '2026-02-06T10:00:00.000Z',
    };

    it('應該成功上傳 PDF', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'TEACHER',
      });
      mockCoursePdfsService.uploadPdf.mockResolvedValue(mockPdf);

      const result = await controller.uploadPdf(1, mockFile, mockBody, mockRequest as any);

      expect(result).toEqual(mockPdf);
      expect(service.uploadPdf).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          title: 'Test PDF',
          course_id: 1,
        }),
        1,
        'TEACHER',
      );
    });

    it('應該拒絕沒有檔案的請求', async () => {
      await expect(controller.uploadPdf(1, undefined as any, mockBody, mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('應該拒絕非 PDF 檔案', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      await expect(controller.uploadPdf(1, invalidFile, mockBody, mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('應該拒絕超過大小限制的檔案', async () => {
      const largeFile = {
        ...mockFile,
        size: 21 * 1024 * 1024, // 21MB
      } as Express.Multer.File;

      await expect(controller.uploadPdf(1, largeFile, mockBody, mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('應該拒絕沒有標題的請求', async () => {
      const bodyWithoutTitle = { ...mockBody, title: '' };

      await expect(
        controller.uploadPdf(1, mockFile, bodyWithoutTitle, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPdfs', () => {
    const mockRequest = {
      user: { id: 1 },
    };

    const mockPdfs = [
      {
        pdf_id: 1,
        title: 'Test PDF',
        description: 'Test',
        file_path: 'test.pdf',
        file_size: 1024,
        course_id: 1,
        uploaded_by_id: 1,
        student_group_ids: [],
        allow_download: false,
        is_visible_to_all: true,
        is_active: true,
        created_at: '2026-02-06T10:00:00.000Z',
        updated_at: '2026-02-06T10:00:00.000Z',
      },
    ];

    it('應該返回學生的 PDF 列表', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'STUDENT',
      });
      mockCoursePdfsService.getPdfsForStudent.mockResolvedValue(mockPdfs);

      const result = await controller.getPdfs(1, mockRequest as any);

      expect(result).toEqual(mockPdfs);
      expect(service.getPdfsForStudent).toHaveBeenCalledWith(1, 1);
    });

    it('應該返回老師的 PDF 列表', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'TEACHER',
      });
      mockCoursePdfsService.getPdfsForTeacher.mockResolvedValue(mockPdfs);

      const result = await controller.getPdfs(1, mockRequest as any);

      expect(result).toEqual(mockPdfs);
      expect(service.getPdfsForTeacher).toHaveBeenCalledWith(1, 1, 'TEACHER');
    });

    it('應該返回管理員的 PDF 列表', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'ADMIN',
      });
      mockCoursePdfsService.getPdfsForTeacher.mockResolvedValue(mockPdfs);

      const result = await controller.getPdfs(1, mockRequest as any);

      expect(result).toEqual(mockPdfs);
      expect(service.getPdfsForTeacher).toHaveBeenCalledWith(1, 1, 'ADMIN');
    });
  });

  describe('viewPdf', () => {
    const mockRequest = {
      user: { id: 1 },
    };

    const mockResponse = {
      set: jest.fn(),
    };

    it('應該返回 PDF 檔案流供檢視', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'STUDENT',
      });
      mockCoursePdfsService.viewPdf.mockResolvedValue({
        stream: 'mock-stream',
        filename: 'test.pdf',
      });

      const result = await controller.viewPdf(1, 1, mockRequest as any, mockResponse as any);

      expect(result).toBeDefined();
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': expect.stringContaining('inline'),
      });
    });
  });

  describe('downloadPdf', () => {
    const mockRequest = {
      user: { id: 1 },
    };

    const mockResponse = {
      set: jest.fn(),
    };

    it('應該返回 PDF 檔案流供下載', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'STUDENT',
      });
      mockCoursePdfsService.downloadPdf.mockResolvedValue({
        stream: 'mock-stream',
        filename: 'test.pdf',
      });

      const result = await controller.downloadPdf(1, 1, mockRequest as any, mockResponse as any);

      expect(result).toBeDefined();
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': expect.stringContaining('attachment'),
      });
    });
  });

  describe('toggleDownload', () => {
    const mockRequest = {
      user: { id: 1 },
    };

    const mockPdf = {
      pdf_id: 1,
      title: 'Test PDF',
      description: 'Test',
      file_path: 'test.pdf',
      file_size: 1024,
      course_id: 1,
      uploaded_by_id: 1,
      student_group_ids: [],
      allow_download: true,
      is_visible_to_all: true,
      is_active: true,
      created_at: '2026-02-06T10:00:00.000Z',
      updated_at: '2026-02-06T10:00:00.000Z',
    };

    it('應該成功切換下載權限', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'TEACHER',
      });
      mockCoursePdfsService.toggleDownload.mockResolvedValue(mockPdf);

      const result = await controller.toggleDownload(
        1,
        1,
        { allow_download: true },
        mockRequest as any,
      );

      expect(result).toEqual(mockPdf);
      expect(service.toggleDownload).toHaveBeenCalledWith(1, true, 1, 'TEACHER');
    });

    it('應該拒絕沒有 allow_download 參數的請求', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'TEACHER',
      });

      await expect(controller.toggleDownload(1, 1, {} as any, mockRequest as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updatePdf', () => {
    const mockRequest = {
      user: { id: 1 },
    };

    const mockUpdateDto = {
      title: 'Updated PDF',
      description: 'Updated Description',
    };

    const mockPdf = {
      pdf_id: 1,
      title: 'Updated PDF',
      description: 'Updated Description',
      file_path: 'test.pdf',
      file_size: 1024,
      course_id: 1,
      uploaded_by_id: 1,
      student_group_ids: [],
      allow_download: false,
      is_visible_to_all: true,
      is_active: true,
      created_at: '2026-02-06T10:00:00.000Z',
      updated_at: '2026-02-06T10:00:00.000Z',
    };

    it('應該成功更新 PDF 資訊', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'TEACHER',
      });
      mockCoursePdfsService.updatePdf.mockResolvedValue(mockPdf);

      const result = await controller.updatePdf(1, 1, mockUpdateDto, mockRequest as any);

      expect(result).toEqual(mockPdf);
      expect(service.updatePdf).toHaveBeenCalledWith(1, mockUpdateDto, 1, 'TEACHER');
    });
  });

  describe('deletePdf', () => {
    const mockRequest = {
      user: { id: 1 },
    };

    it('應該成功刪除 PDF', async () => {
      mockPrismaService.accountCustomUser.findUnique.mockResolvedValue({
        id: 1,
        role: 'TEACHER',
      });
      mockCoursePdfsService.deletePdf.mockResolvedValue(undefined);

      const result = await controller.deletePdf(1, 1, mockRequest as any);

      expect(result).toEqual({ message: 'PDF 已成功刪除' });
      expect(service.deletePdf).toHaveBeenCalledWith(1, 1, 'TEACHER');
    });
  });
});
