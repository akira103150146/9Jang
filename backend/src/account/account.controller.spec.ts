import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { createMockUser, createMockAuthRequest, createMockPaginatedResponse } from '../test/helpers/test-data.helper';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            login: jest.fn(),
            getCurrentUser: jest.fn(),
            changePassword: jest.fn(),
            refreshToken: jest.fn(),
            switchRole: jest.fn(),
            resetRole: jest.fn(),
            getCurrentRole: jest.fn(),
            impersonateUser: jest.fn(),
            getUsers: jest.fn(),
            getUserById: jest.fn(),
            getRoles: jest.fn(),
            getAuditLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('應該呼叫 AccountService.login 並回傳登入結果', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        access: 'access_token',
        refresh: 'refresh_token',
        user: createMockUser(),
      };
      jest.spyOn(service, 'login').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('access');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('user');
    });

    it('應該正確傳遞登入資料到 service', async () => {
      // Arrange
      const loginDto = { email: 'user@example.com', password: 'mypassword' };
      const mockResponse = {
        access: 'token',
        refresh: 'refresh',
        user: createMockUser(),
      };
      const loginSpy = jest.spyOn(service, 'login').mockResolvedValue(mockResponse);

      // Act
      await controller.login(loginDto);

      // Assert
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
      expect(loginSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('應該回傳登出成功訊息', async () => {
      // Act
      const result = await controller.logout();

      // Assert
      expect(result).toEqual({ message: '登出成功' });
    });

    it('應該不呼叫任何 service 方法（前端處理）', async () => {
      // Act
      await controller.logout();

      // Assert
      // logout 不應該呼叫任何 service 方法，因為 token 刪除由前端處理
      expect(service.login).not.toHaveBeenCalled();
      expect(service.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('應該呼叫 AccountService.refreshToken 並回傳新的 access token', async () => {
      // Arrange
      const refreshDto = { refresh: 'valid_refresh_token' };
      const mockResponse = { access: 'new_access_token' };
      jest.spyOn(service, 'refreshToken').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.refreshToken(refreshDto);

      // Assert
      expect(service.refreshToken).toHaveBeenCalledWith(refreshDto);
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('access');
    });

    it('應該正確傳遞 refresh token 到 service', async () => {
      // Arrange
      const refreshDto = { refresh: 'my_refresh_token' };
      const mockResponse = { access: 'new_token' };
      const refreshSpy = jest.spyOn(service, 'refreshToken').mockResolvedValue(mockResponse);

      // Act
      await controller.refreshToken(refreshDto);

      // Assert
      expect(refreshSpy).toHaveBeenCalledWith(refreshDto);
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentUser', () => {
    it('應該呼叫 AccountService.getCurrentUser 並回傳當前用戶資料', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'testuser' } });
      const mockUser = createMockUser({ id: 1 });
      jest.spyOn(service, 'getCurrentUser').mockResolvedValue(mockUser);

      // Act
      const result = await controller.getCurrentUser(mockRequest);

      // Assert
      expect(service.getCurrentUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('應該從 request.user 中取得正確的 user ID', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 123, username: 'user123' } });
      const mockUser = createMockUser({ id: 123 });
      const getUserSpy = jest.spyOn(service, 'getCurrentUser').mockResolvedValue(mockUser);

      // Act
      await controller.getCurrentUser(mockRequest);

      // Assert
      expect(getUserSpy).toHaveBeenCalledWith(123);
    });
  });

  describe('getCurrentRole', () => {
    it('應該呼叫 AccountService.getCurrentRole（無臨時角色）', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'testuser' } });
      const mockRoleInfo = {
        original_role: 'STUDENT',
        original_role_display: '學生',
        temp_role: null,
        temp_role_display: null,
        effective_role: 'STUDENT',
        effective_role_display: '學生',
      };
      jest.spyOn(service, 'getCurrentRole').mockResolvedValue(mockRoleInfo);

      // Act
      const result = await controller.getCurrentRole(mockRequest);

      // Assert
      expect(service.getCurrentRole).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(mockRoleInfo);
    });

    it('應該呼叫 AccountService.getCurrentRole（有臨時角色）', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'admin' } });
      const mockRoleInfo = {
        original_role: 'ADMIN',
        original_role_display: '系統管理員',
        temp_role: 'TEACHER',
        temp_role_display: '老師',
        effective_role: 'TEACHER',
        effective_role_display: '老師',
      };
      jest.spyOn(service, 'getCurrentRole').mockResolvedValue(mockRoleInfo);

      // Act
      const result = await controller.getCurrentRole(mockRequest, 'TEACHER');

      // Assert
      expect(service.getCurrentRole).toHaveBeenCalledWith(1, 'TEACHER');
      expect(result).toEqual(mockRoleInfo);
    });

    it('應該正確傳遞 tempRole query 參數', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 5 } });
      const mockRoleInfo = {
        original_role: 'ADMIN',
        original_role_display: '系統管理員',
        temp_role: 'ACCOUNTANT',
        temp_role_display: '會計',
        effective_role: 'ACCOUNTANT',
        effective_role_display: '會計',
      };
      const getRoleSpy = jest.spyOn(service, 'getCurrentRole').mockResolvedValue(mockRoleInfo);

      // Act
      await controller.getCurrentRole(mockRequest, 'ACCOUNTANT');

      // Assert
      expect(getRoleSpy).toHaveBeenCalledWith(5, 'ACCOUNTANT');
    });
  });

  describe('switchRole', () => {
    it('應該呼叫 AccountService.switchRole 並回傳切換結果', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'admin' } });
      const body = { role: 'TEACHER' };
      const mockResponse = {
        message: '已切換到 老師 視角',
        temp_role: 'TEACHER',
        original_role: 'ADMIN',
      };
      jest.spyOn(service, 'switchRole').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.switchRole(mockRequest, body);

      // Assert
      expect(service.switchRole).toHaveBeenCalledWith(1, 'TEACHER');
      expect(result).toEqual(mockResponse);
    });

    it('應該正確傳遞角色資訊到 service', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 2 } });
      const body = { role: 'STUDENT' };
      const mockResponse = {
        message: '已切換到 學生 視角',
        temp_role: 'STUDENT',
        original_role: 'ADMIN',
      };
      const switchSpy = jest.spyOn(service, 'switchRole').mockResolvedValue(mockResponse);

      // Act
      await controller.switchRole(mockRequest, body);

      // Assert
      expect(switchSpy).toHaveBeenCalledWith(2, 'STUDENT');
    });
  });

  describe('resetRole', () => {
    it('應該呼叫 AccountService.resetRole 並回傳重置結果', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'admin' } });
      const mockResponse = {
        message: '已重置回 系統管理員 視角',
        current_role: 'ADMIN',
      };
      jest.spyOn(service, 'resetRole').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.resetRole(mockRequest);

      // Assert
      expect(service.resetRole).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });

    it('應該從 request 中取得正確的 user ID', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 10 } });
      const mockResponse = {
        message: '已重置回 系統管理員 視角',
        current_role: 'ADMIN',
      };
      const resetSpy = jest.spyOn(service, 'resetRole').mockResolvedValue(mockResponse);

      // Act
      await controller.resetRole(mockRequest);

      // Assert
      expect(resetSpy).toHaveBeenCalledWith(10);
    });
  });

  describe('impersonateUser', () => {
    it('應該呼叫 AccountService.impersonateUser 並回傳模擬結果', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1, username: 'admin' } });
      const body = { user_id: 2 };
      const mockResponse = {
        user: createMockUser({ id: 2, username: 'targetuser' }),
        access: 'target_access_token',
        refresh: 'target_refresh_token',
        message: '已切換為 targetuser 身分',
      };
      jest.spyOn(service, 'impersonateUser').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.impersonateUser(mockRequest, body);

      // Assert
      expect(service.impersonateUser).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('message');
    });

    it('應該正確傳遞管理員 ID 和目標用戶 ID', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 5 } });
      const body = { user_id: 10 };
      const mockResponse = {
        user: createMockUser({ id: 10 }),
        access: 'token',
        refresh: 'refresh',
        message: '已切換為 user 身分',
      };
      const impersonateSpy = jest.spyOn(service, 'impersonateUser').mockResolvedValue(mockResponse);

      // Act
      await controller.impersonateUser(mockRequest, body);

      // Assert
      expect(impersonateSpy).toHaveBeenCalledWith(5, 10);
    });
  });

  describe('changePassword', () => {
    it('應該呼叫 AccountService.changePassword 並回傳成功訊息', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 1 } });
      const changePasswordDto = {
        old_password: 'oldPassword123',
        new_password: 'newPassword456',
      };
      jest.spyOn(service, 'changePassword').mockResolvedValue(undefined);

      // Act
      const result = await controller.changePassword(mockRequest, changePasswordDto);

      // Assert
      expect(service.changePassword).toHaveBeenCalledWith(1, changePasswordDto);
      expect(result).toEqual({ message: '密碼修改成功' });
    });

    it('應該正確傳遞用戶 ID 和密碼資料', async () => {
      // Arrange
      const mockRequest = createMockAuthRequest({ user: { id: 123 } });
      const changePasswordDto = {
        old_password: 'old123',
        new_password: 'new456',
      };
      const changeSpy = jest.spyOn(service, 'changePassword').mockResolvedValue(undefined);

      // Act
      await controller.changePassword(mockRequest, changePasswordDto);

      // Assert
      expect(changeSpy).toHaveBeenCalledWith(123, changePasswordDto);
      expect(changeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUsers', () => {
    it('應該呼叫 AccountService.getUsers 並回傳分頁用戶列表', async () => {
      // Arrange
      const mockUsers = [
        createMockUser({ id: 1 }),
        createMockUser({ id: 2 }),
      ];
      const mockResponse = createMockPaginatedResponse(mockUsers, 20, 1, 10);
      jest.spyOn(service, 'getUsers').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getUsers();

      // Assert
      expect(service.getUsers).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResponse);
      expect(result.count).toBe(20);
      expect(result.results).toHaveLength(2);
    });

    it('應該正確傳遞分頁參數（自訂頁碼和筆數）', async () => {
      // Arrange
      const mockResponse = createMockPaginatedResponse([], 0, 2, 5);
      const getUsersSpy = jest.spyOn(service, 'getUsers').mockResolvedValue(mockResponse);

      // Act
      await controller.getUsers(2, 5);

      // Assert
      expect(getUsersSpy).toHaveBeenCalledWith(2, 5);
    });

    it('應該使用預設分頁參數（page=1, pageSize=10）', async () => {
      // Arrange
      const mockResponse = createMockPaginatedResponse([], 0, 1, 10);
      const getUsersSpy = jest.spyOn(service, 'getUsers').mockResolvedValue(mockResponse);

      // Act
      await controller.getUsers();

      // Assert
      expect(getUsersSpy).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getUser', () => {
    it('應該呼叫 AccountService.getUserById 並回傳指定用戶', async () => {
      // Arrange
      const mockUser = createMockUser({ id: 5 });
      jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

      // Act
      const result = await controller.getUser(5);

      // Assert
      expect(service.getUserById).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(5);
    });

    it('應該正確傳遞用戶 ID', async () => {
      // Arrange
      const mockUser = createMockUser({ id: 123 });
      const getUserSpy = jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

      // Act
      await controller.getUser(123);

      // Assert
      expect(getUserSpy).toHaveBeenCalledWith(123);
      expect(getUserSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoles', () => {
    it('應該呼叫 AccountService.getRoles 並回傳分頁角色列表', async () => {
      // Arrange
      const mockRoles = [
        {
          id: 1,
          code: 'ADMIN',
          name: '管理員',
          description: '系統管理員',
          is_active: true,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          permissions: [],
          permission_count: 0,
        },
        {
          id: 2,
          code: 'STUDENT',
          name: '學生',
          description: '一般學生',
          is_active: true,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          permissions: [],
          permission_count: 0,
        },
      ];
      const mockResponse = createMockPaginatedResponse(mockRoles, 5, 1, 10);
      jest.spyOn(service, 'getRoles').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getRoles();

      // Assert
      expect(service.getRoles).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResponse);
      expect(result.count).toBe(5);
    });

    it('應該正確傳遞分頁參數', async () => {
      // Arrange
      const mockResponse = createMockPaginatedResponse([], 0, 3, 20);
      const getRolesSpy = jest.spyOn(service, 'getRoles').mockResolvedValue(mockResponse);

      // Act
      await controller.getRoles(3, 20);

      // Assert
      expect(getRolesSpy).toHaveBeenCalledWith(3, 20);
    });
  });

  describe('getAuditLogs', () => {
    it('應該呼叫 AccountService.getAuditLogs 並回傳分頁審計日誌', async () => {
      // Arrange
      const mockLogs = [
        {
          id: 1,
          user: 1,
          role: 1,
          impersonated_by: null,
          action_type: 'LOGIN',
          resource_type: 'USER',
          resource_id: '1',
          resource_name: 'testuser',
          description: '用戶登入',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0',
          request_data: {},
          response_status: 200,
          created_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          user: 1,
          role: 1,
          impersonated_by: null,
          action_type: 'LOGOUT',
          resource_type: 'USER',
          resource_id: '1',
          resource_name: 'testuser',
          description: '用戶登出',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0',
          request_data: {},
          response_status: 200,
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ];
      const mockResponse = createMockPaginatedResponse(mockLogs, 100, 1, 10);
      jest.spyOn(service, 'getAuditLogs').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAuditLogs();

      // Assert
      expect(service.getAuditLogs).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResponse);
      expect(result.count).toBe(100);
    });

    it('應該正確傳遞分頁參數', async () => {
      // Arrange
      const mockResponse = createMockPaginatedResponse([], 0, 5, 50);
      const getLogsSpy = jest.spyOn(service, 'getAuditLogs').mockResolvedValue(mockResponse);

      // Act
      await controller.getAuditLogs(5, 50);

      // Assert
      expect(getLogsSpy).toHaveBeenCalledWith(5, 50);
    });
  });
});
