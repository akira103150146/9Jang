import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FeesService } from './fees.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService, resetAllMocks } from '../../test/helpers/mock-prisma.helper';
import { createMockFee } from '../../test/helpers/test-data.helper';

describe('FeesService', () => {
  let service: FeesService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
    prisma = module.get<PrismaService>(PrismaService);

    resetAllMocks(prisma);
    jest.clearAllMocks();
  });

  describe('getFees', () => {
    it('應該回傳分頁的費用列表', async () => {
      // Arrange
      const mockFees = [
        createMockFee({ id: 1, feeId: 1, student: { name: 'Student 1' } }),
        createMockFee({ id: 2, feeId: 2, student: { name: 'Student 2' } }),
      ];
      jest.spyOn(prisma.cramschoolExtraFee, 'findMany').mockResolvedValue(mockFees);
      jest.spyOn(prisma.cramschoolExtraFee, 'count').mockResolvedValue(20);

      // Act
      const result = await service.getFees(1, 10);

      // Assert
      expect(result.count).toBe(20);
      expect(result.results).toHaveLength(2);
      expect(result.next).toBe(2);
      expect(result.previous).toBeNull();
      expect(prisma.cramschoolExtraFee.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { isDeleted: false },
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
            },
          },
        },
        orderBy: { feeDate: 'desc' },
      });
    });

    it('應該依學生 ID 過濾費用', async () => {
      // Arrange
      const mockFees = [createMockFee({ studentId: 5 })];
      jest.spyOn(prisma.cramschoolExtraFee, 'findMany').mockResolvedValue(mockFees);
      jest.spyOn(prisma.cramschoolExtraFee, 'count').mockResolvedValue(1);

      // Act
      await service.getFees(1, 10, 5);

      // Assert
      expect(prisma.cramschoolExtraFee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            studentId: 5,
            isDeleted: false,
          }),
        })
      );
    });

    it('應該在 includeDeleted=true 時包含已刪除的費用', async () => {
      // Arrange
      const mockFees = [
        createMockFee({ isDeleted: false }),
        createMockFee({ isDeleted: true }),
      ];
      jest.spyOn(prisma.cramschoolExtraFee, 'findMany').mockResolvedValue(mockFees);
      jest.spyOn(prisma.cramschoolExtraFee, 'count').mockResolvedValue(2);

      // Act
      await service.getFees(1, 10, undefined, true);

      // Assert
      expect(prisma.cramschoolExtraFee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}, // 不過濾 isDeleted
        })
      );
    });

    it('應該正確計算分頁參數', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolExtraFee, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.cramschoolExtraFee, 'count').mockResolvedValue(0);

      // Act
      await service.getFees(3, 5);

      // Assert
      expect(prisma.cramschoolExtraFee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 3 - 1) * pageSize 5
          take: 5,
        })
      );
    });

    it('應該按費用日期降序排序', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolExtraFee, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.cramschoolExtraFee, 'count').mockResolvedValue(0);

      // Act
      await service.getFees(1, 10);

      // Assert
      expect(prisma.cramschoolExtraFee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { feeDate: 'desc' },
        })
      );
    });
  });

  describe('getFee', () => {
    it('應該成功取得指定費用', async () => {
      // Arrange
      const mockFee = createMockFee({
        feeId: 1,
        item: '教材費',
        amount: 500,
        student: { name: 'Test Student' },
      });
      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(mockFee);

      // Act
      const result = await service.getFee(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.fee_id).toBe(1);
      expect(result.item).toBe('教材費');
      expect(result.amount).toBe(500);
      expect(prisma.cramschoolExtraFee.findUnique).toHaveBeenCalledWith({
        where: { feeId: 1 },
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
            },
          },
        },
      });
    });

    it('應該在費用不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getFee(999)).rejects.toThrow(NotFoundException);
      await expect(service.getFee(999)).rejects.toThrow('Fee with ID 999 not found');
    });
  });

  describe('createFee', () => {
    it('應該成功建立費用', async () => {
      // Arrange
      const createDto = {
        student_id: 1,
        item: '教材費',
        amount: 500,
        fee_date: '2024-01-01',
        payment_status: 'Unpaid' as const,
        notes: 'Test notes',
      };
      const mockFee = createMockFee({
        feeId: 1,
        studentId: 1,
        item: '教材費',
        amount: 500,
        student: { name: 'Student' },
      });
      jest.spyOn(prisma.cramschoolExtraFee, 'create').mockResolvedValue(mockFee);

      // Act
      const result = await service.createFee(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.item).toBe('教材費');
      expect(result.amount).toBe(500);
      expect(prisma.cramschoolExtraFee.create).toHaveBeenCalledWith({
        data: {
          studentId: 1,
          item: '教材費',
          amount: 500,
          feeDate: expect.any(Date),
          paymentStatus: 'Unpaid',
          notes: 'Test notes',
          paidAt: null,
        },
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
            },
          },
        },
      });
    });

    it('應該使用預設值（payment_status=Unpaid, notes=null）', async () => {
      // Arrange
      const createDto = {
        student_id: 1,
        item: '費用',
        amount: 1000,
        fee_date: '2024-01-01',
        payment_status: 'Unpaid' as const,
      };
      const mockFee = createMockFee();
      const createSpy = jest.spyOn(prisma.cramschoolExtraFee, 'create').mockResolvedValue(mockFee);

      // Act
      await service.createFee(createDto);

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paymentStatus: 'Unpaid',
          notes: null,
        }),
        include: expect.any(Object),
      });
    });

    it('應該正確處理 paid_at 日期', async () => {
      // Arrange
      const createDto = {
        student_id: 1,
        item: '已付費用',
        amount: 1000,
        fee_date: '2024-01-01',
        payment_status: 'Paid' as const,
        paid_at: '2024-01-05',
      };
      const mockFee = createMockFee();
      const createSpy = jest.spyOn(prisma.cramschoolExtraFee, 'create').mockResolvedValue(mockFee);

      // Act
      await service.createFee(createDto);

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paidAt: expect.any(Date),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('updateFee', () => {
    it('應該成功更新費用', async () => {
      // Arrange
      const updateDto = {
        student_id: 1,
        item: '更新後的項目',
        amount: 1500,
        fee_date: '2024-02-01',
        payment_status: 'Paid' as const,
      };
      const mockFee = createMockFee({ feeId: 1 });
      const mockUpdatedFee = createMockFee({
        feeId: 1,
        item: '更新後的項目',
        amount: 1500,
      });

      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(mockFee);
      jest.spyOn(prisma.cramschoolExtraFee, 'update').mockResolvedValue(mockUpdatedFee);

      // Act
      const result = await service.updateFee(1, updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.item).toBe('更新後的項目');
      expect(result.amount).toBe(1500);
      expect(prisma.cramschoolExtraFee.update).toHaveBeenCalledWith({
        where: { feeId: 1 },
        data: expect.objectContaining({
          studentId: 1,
          item: '更新後的項目',
          amount: 1500,
          paymentStatus: 'Paid',
        }),
        include: expect.any(Object),
      });
    });

    it('應該在費用不存在時拋出 NotFoundException', async () => {
      // Arrange
      const updateDto = {
        item: 'Updated',
      };
      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateFee(999, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateFee(999, updateDto)).rejects.toThrow('Fee with ID 999 not found');
    });

    it('應該支援部分更新', async () => {
      // Arrange
      const updateDto = {
        payment_status: 'Paid' as const,
        // 只更新 payment_status
      };
      const mockFee = createMockFee();
      const mockUpdatedFee = createMockFee({ paymentStatus: 'Paid' });

      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(mockFee);
      const updateSpy = jest.spyOn(prisma.cramschoolExtraFee, 'update').mockResolvedValue(mockUpdatedFee);

      // Act
      await service.updateFee(1, updateDto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentStatus: 'Paid',
          }),
        })
      );
    });

    it('應該正確處理 paid_at 的更新（設為 null）', async () => {
      // Arrange
      const updateDto = {
        payment_status: 'Unpaid' as const,
        paid_at: null,
      };
      const mockFee = createMockFee();
      const mockUpdatedFee = createMockFee({ paidAt: null });

      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(mockFee);
      const updateSpy = jest.spyOn(prisma.cramschoolExtraFee, 'update').mockResolvedValue(mockUpdatedFee);

      // Act
      await service.updateFee(1, updateDto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paidAt: null,
          }),
        })
      );
    });
  });

  describe('deleteFee', () => {
    it('應該成功軟刪除費用', async () => {
      // Arrange
      const mockFee = createMockFee({ feeId: 1, isDeleted: false });
      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(mockFee);
      jest.spyOn(prisma.cramschoolExtraFee, 'update').mockResolvedValue({ ...mockFee, isDeleted: true });

      // Act
      await service.deleteFee(1);

      // Assert
      expect(prisma.cramschoolExtraFee.update).toHaveBeenCalledWith({
        where: { feeId: 1 },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });

    it('應該在費用不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteFee(999)).rejects.toThrow(NotFoundException);
      await expect(service.deleteFee(999)).rejects.toThrow('Fee with ID 999 not found');
    });

    it('應該設定 deletedAt 時間戳記', async () => {
      // Arrange
      const mockFee = createMockFee();
      jest.spyOn(prisma.cramschoolExtraFee, 'findUnique').mockResolvedValue(mockFee);
      const updateSpy = jest.spyOn(prisma.cramschoolExtraFee, 'update').mockResolvedValue(mockFee);

      // Act
      await service.deleteFee(1);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('batchUpdateStatus', () => {
    it('應該批次更新費用狀態為 Paid', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [1, 2, 3],
        payment_status: 'Paid' as const,
      };
      jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 3 });

      // Act
      const result = await service.batchUpdateStatus(batchUpdateDto);

      // Assert
      expect(result).toEqual({ updated: 3 });
      expect(prisma.cramschoolExtraFee.updateMany).toHaveBeenCalledWith({
        where: {
          feeId: { in: [1, 2, 3] },
        },
        data: {
          paymentStatus: 'Paid',
          paidAt: expect.any(Date),
        },
      });
    });

    it('應該批次更新費用狀態為 Unpaid（清除 paidAt）', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [4, 5],
        payment_status: 'Unpaid' as const,
      };
      jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 2 });

      // Act
      const result = await service.batchUpdateStatus(batchUpdateDto);

      // Assert
      expect(result).toEqual({ updated: 2 });
      expect(prisma.cramschoolExtraFee.updateMany).toHaveBeenCalledWith({
        where: {
          feeId: { in: [4, 5] },
        },
        data: {
          paymentStatus: 'Unpaid',
          paidAt: null,
        },
      });
    });

    it('應該在 fee_ids 為空時拋出 BadRequestException', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [],
        payment_status: 'Paid' as const,
      };

      // Act & Assert
      await expect(service.batchUpdateStatus(batchUpdateDto)).rejects.toThrow(BadRequestException);
      await expect(service.batchUpdateStatus(batchUpdateDto)).rejects.toThrow('fee_ids 不能為空');
    });

    it('應該回傳更新的筆數', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [1, 2, 3, 4, 5],
        payment_status: 'Partial' as const,
      };
      jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 5 });

      // Act
      const result = await service.batchUpdateStatus(batchUpdateDto);

      // Assert
      expect(result.updated).toBe(5);
    });

    it('應該處理部分成功的情況（某些 ID 不存在）', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [1, 999, 3],
        payment_status: 'Paid' as const,
      };
      // 假設只有 2 筆存在並被更新
      jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 2 });

      // Act
      const result = await service.batchUpdateStatus(batchUpdateDto);

      // Assert
      expect(result.updated).toBe(2); // 只有存在的費用被更新
    });

    it('應該在狀態為 Paid 時設定 paidAt', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [1, 2],
        payment_status: 'Paid' as const,
      };
      const updateSpy = jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 2 });

      // Act
      await service.batchUpdateStatus(batchUpdateDto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paidAt: expect.any(Date),
          }),
        })
      );
    });

    it('應該支援 Partial 狀態', async () => {
      // Arrange
      const batchUpdateDto = {
        fee_ids: [1],
        payment_status: 'Partial' as const,
      };
      const updateSpy = jest.spyOn(prisma.cramschoolExtraFee, 'updateMany').mockResolvedValue({ count: 1 });

      // Act
      await service.batchUpdateStatus(batchUpdateDto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentStatus: 'Partial',
            paidAt: null, // Partial 不設定 paidAt
          }),
        })
      );
    });
  });
});
