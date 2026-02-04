import { Test, TestingModule } from '@nestjs/testing';
import { FeesController } from './fees.controller';
import { FeesService } from '../services/fees.service';
import { createMockFee, createMockPaginatedResponse } from '../../test/helpers/test-data.helper';

describe('FeesController', () => {
  let controller: FeesController;
  let service: FeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeesController],
      providers: [
        {
          provide: FeesService,
          useValue: {
            getFees: jest.fn(),
            getFee: jest.fn(),
            createFee: jest.fn(),
            updateFee: jest.fn(),
            deleteFee: jest.fn(),
            batchUpdateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeesController>(FeesController);
    service = module.get<FeesService>(FeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFees', () => {
    it('應該呼叫 FeesService.getFees 並回傳費用列表', async () => {
      const mockFees = [createMockFee(), createMockFee()];
      const mockResponse = createMockPaginatedResponse(mockFees, 20, 1, 10);
      jest.spyOn(service, 'getFees').mockResolvedValue(mockResponse);

      const result = await controller.getFees();

      expect(service.getFees).toHaveBeenCalledWith(1, 10, undefined, false);
      expect(result).toEqual(mockResponse);
    });

    it('應該正確傳遞查詢參數', async () => {
      const mockResponse = createMockPaginatedResponse([], 0, 2, 5);
      const getFeesSpy = jest.spyOn(service, 'getFees').mockResolvedValue(mockResponse);

      await controller.getFees(2, 5, 10, 'true');

      expect(getFeesSpy).toHaveBeenCalledWith(2, 5, 10, true);
    });
  });

  describe('getFee', () => {
    it('應該呼叫 FeesService.getFee 並回傳指定費用', async () => {
      const mockFee = createMockFee({ feeId: 1 });
      jest.spyOn(service, 'getFee').mockResolvedValue(mockFee);

      const result = await controller.getFee(1);

      expect(service.getFee).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFee);
    });
  });

  describe('createFee', () => {
    it('應該呼叫 FeesService.createFee 並回傳新建費用', async () => {
      const createDto = {
        student_id: 1,
        item: '教材費',
        amount: 500,
        fee_date: '2024-01-01',
        payment_status: 'Unpaid' as const,
      };
      const mockFee = createMockFee();
      jest.spyOn(service, 'createFee').mockResolvedValue(mockFee);

      const result = await controller.createFee(createDto);

      expect(service.createFee).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockFee);
    });
  });

  describe('updateFee', () => {
    it('應該呼叫 FeesService.updateFee 並回傳更新後的費用', async () => {
      const updateDto = { item: 'Updated' };
      const mockFee = createMockFee();
      jest.spyOn(service, 'updateFee').mockResolvedValue(mockFee);

      const result = await controller.updateFee(1, updateDto);

      expect(service.updateFee).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockFee);
    });
  });

  describe('deleteFee', () => {
    it('應該呼叫 FeesService.deleteFee 並回傳成功訊息', async () => {
      jest.spyOn(service, 'deleteFee').mockResolvedValue(undefined);

      const result = await controller.deleteFee(1);

      expect(service.deleteFee).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: '費用記錄已刪除' });
    });
  });

  describe('batchUpdateStatus', () => {
    it('應該呼叫 FeesService.batchUpdateStatus 並回傳批次結果', async () => {
      const batchDto = {
        fee_ids: [1, 2, 3],
        payment_status: 'Paid' as const,
      };
      const mockResult = { updated: 3 };
      jest.spyOn(service, 'batchUpdateStatus').mockResolvedValue(mockResult);

      const result = await controller.batchUpdateStatus(batchDto);

      expect(service.batchUpdateStatus).toHaveBeenCalledWith(batchDto);
      expect(result).toEqual(mockResult);
    });
  });
});
