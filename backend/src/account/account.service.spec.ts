import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService, resetAllMocks } from '../test/helpers/mock-prisma.helper';
import { createMockUser, createMockUserWithRelations, createMockRole, createMockAuditLog, createMockJwtPayload } from '../test/helpers/test-data.helper';

describe('AccountService', () => {
  let service: AccountService;
  let prisma: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // 重置所有 mocks
    resetAllMocks(prisma);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('應該使用 email 成功登入', async () => {
      // Arrange
      const mockUser = createMockUserWithRelations({
        email: 'test@example.com',
        username: 'testuser',
        password: '$2b$10$hashedPassword',
        isActive: true,
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access_token_123')
        .mockReturnValueOnce('refresh_token_456');

      // Act
      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(result).toHaveProperty('access', 'access_token_123');
      expect(result).toHaveProperty('refresh', 'refresh_token_456');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(prisma.accountCustomUser.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'test@example.com' },
            { username: 'test@example.com' },
          ],
        },
        include: {
          customRole: {
            include: {
              permissions: true,
            },
          },
          studentProfile: true,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('應該使用 username 成功登入', async () => {
      // Arrange
      const mockUser = createMockUserWithRelations({
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      // Act
      const result = await service.login({
        email: 'testuser', // 使用 username 登入
        password: 'password123',
      });

      // Assert
      expect(result).toHaveProperty('access');
      expect(result).toHaveProperty('refresh');
      expect(result.user.username).toBe('testuser');
    });

    it('應該在用戶不存在時拋出 UnauthorizedException', async () => {
      // Arrange
      jest.spyOn(prisma.accountCustomUser, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login({
        email: 'nonexistent@example.com',
        password: 'password123',
      })).rejects.toThrow(UnauthorizedException);
      
      await expect(service.login({
        email: 'nonexistent@example.com',
        password: 'password123',
      })).rejects.toThrow('帳號或密碼錯誤');
    });

    it('應該在密碼錯誤時拋出 UnauthorizedException', async () => {
      // Arrange
      const mockUser = createMockUser();
      jest.spyOn(prisma.accountCustomUser, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(service.login({
        email: 'test@example.com',
        password: 'wrong_password',
      })).rejects.toThrow(UnauthorizedException);
      
      await expect(service.login({
        email: 'test@example.com',
        password: 'wrong_password',
      })).rejects.toThrow('帳號或密碼錯誤');
    });

    it('應該在帳號已停用時拋出 UnauthorizedException', async () => {
      // Arrange
      const mockUser = createMockUser({ isActive: false });
      jest.spyOn(prisma.accountCustomUser, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      // Act & Assert
      await expect(service.login({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow(UnauthorizedException);
      
      await expect(service.login({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow('帳號已被停用');
    });

    it('應該正確生成 JWT token with payload', async () => {
      // Arrange
      const mockUser = createMockUserWithRelations({
        id: 123,
        username: 'testuser',
        isActive: true,
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      const signSpy = jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access')
        .mockReturnValueOnce('refresh');

      // Act
      await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(signSpy).toHaveBeenNthCalledWith(1, 
        { sub: 123, username: 'testuser' }, 
        { expiresIn: '1h' }
      );
      expect(signSpy).toHaveBeenNthCalledWith(2, 
        { sub: 123, username: 'testuser' }, 
        { expiresIn: '7d' }
      );
    });
  });

  describe('getCurrentUser', () => {
    it('應該成功取得用戶資料', async () => {
      // Arrange
      const mockUser = createMockUserWithRelations({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.getCurrentUser(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(prisma.accountCustomUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          customRole: {
            include: {
              permissions: true,
            },
          },
          studentProfile: true,
        },
      });
    });

    it('應該在用戶不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentUser(999)).rejects.toThrow(NotFoundException);
      await expect(service.getCurrentUser(999)).rejects.toThrow('用戶不存在');
    });
  });

  describe('changePassword', () => {
    it('應該成功修改密碼', async () => {
      // Arrange
      const mockUser = createMockUser({
        id: 1,
        password: '$2b$10$oldHashedPassword',
        mustChangePassword: true,
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('$2b$10$newHashedPassword'));
      jest.spyOn(prisma.accountCustomUser, 'update').mockResolvedValue(mockUser);

      // Act
      await service.changePassword(1, {
        old_password: 'oldPassword',
        new_password: 'newPassword123',
      });

      // Assert
      expect(prisma.accountCustomUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          password: '$2b$10$newHashedPassword',
          mustChangePassword: false,
        },
      });
    });

    it('應該在用戶不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.changePassword(999, {
        old_password: 'oldPassword',
        new_password: 'newPassword123',
      })).rejects.toThrow(NotFoundException);
    });

    it('應該在舊密碼錯誤時拋出 UnauthorizedException', async () => {
      // Arrange
      const mockUser = createMockUser();
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(service.changePassword(1, {
        old_password: 'wrongOldPassword',
        new_password: 'newPassword123',
      })).rejects.toThrow(UnauthorizedException);
      
      await expect(service.changePassword(1, {
        old_password: 'wrongOldPassword',
        new_password: 'newPassword123',
      })).rejects.toThrow('舊密碼錯誤');
    });

    it('應該清除 mustChangePassword 標記', async () => {
      // Arrange
      const mockUser = createMockUser({ mustChangePassword: true });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
      const updateSpy = jest.spyOn(prisma.accountCustomUser, 'update').mockResolvedValue(mockUser);

      // Act
      await service.changePassword(1, {
        old_password: 'oldPassword',
        new_password: 'newPassword123',
      });

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            mustChangePassword: false,
          }),
        })
      );
    });
  });

  describe('refreshToken', () => {
    it('應該成功刷新 token', async () => {
      // Arrange
      const mockPayload = createMockJwtPayload({ sub: 1, username: 'testuser' });
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new_access_token');

      // Act
      const result = await service.refreshToken({
        refresh: 'valid_refresh_token',
      });

      // Assert
      expect(result).toHaveProperty('access', 'new_access_token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid_refresh_token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 1, username: 'testuser' },
        { expiresIn: '1h' }
      );
    });

    it('應該在 token 無效時拋出 UnauthorizedException', async () => {
      // Arrange
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken({
        refresh: 'invalid_token',
      })).rejects.toThrow(UnauthorizedException);
      
      await expect(service.refreshToken({
        refresh: 'invalid_token',
      })).rejects.toThrow('Invalid refresh token');
    });

    it('應該在 token 過期時拋出 UnauthorizedException', async () => {
      // Arrange
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      await expect(service.refreshToken({
        refresh: 'expired_token',
      })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('switchRole', () => {
    it('應該允許管理員切換角色', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockAdmin);

      // Act
      const result = await service.switchRole(1, 'TEACHER');

      // Assert
      expect(result).toEqual({
        message: '已切換到 老師 視角',
        temp_role: 'TEACHER',
        original_role: 'ADMIN',
      });
    });

    it('應該拒絕非管理員切換角色', async () => {
      // Arrange
      const mockStudent = createMockUser({ id: 1, role: 'STUDENT' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockStudent);

      // Act & Assert
      await expect(service.switchRole(1, 'TEACHER')).rejects.toThrow(ForbiddenException);
      await expect(service.switchRole(1, 'TEACHER')).rejects.toThrow('只有管理員可以切換角色');
    });

    it('應該拒絕切換到無效角色', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockAdmin);

      // Act & Assert
      await expect(service.switchRole(1, 'INVALID_ROLE')).rejects.toThrow(BadRequestException);
      await expect(service.switchRole(1, 'INVALID_ROLE')).rejects.toThrow('無效的角色');
    });

    it('應該驗證所有有效角色代碼', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockAdmin);

      const validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'];

      // Act & Assert
      for (const role of validRoles) {
        const result = await service.switchRole(1, role);
        expect(result.temp_role).toBe(role);
      }
    });
  });

  describe('resetRole', () => {
    it('應該允許管理員重置角色', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockAdmin);

      // Act
      const result = await service.resetRole(1);

      // Assert
      expect(result).toEqual({
        message: '已重置回 系統管理員 視角',
        current_role: 'ADMIN',
      });
    });

    it('應該拒絕非管理員重置角色', async () => {
      // Arrange
      const mockStudent = createMockUser({ id: 1, role: 'STUDENT' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockStudent);

      // Act & Assert
      await expect(service.resetRole(1)).rejects.toThrow(ForbiddenException);
      await expect(service.resetRole(1)).rejects.toThrow('只有管理員可以重置角色');
    });
  });

  describe('getCurrentRole', () => {
    it('應該回傳用戶的原始角色（無臨時角色）', async () => {
      // Arrange
      const mockUser = createMockUser({ id: 1, role: 'STUDENT' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.getCurrentRole(1);

      // Assert
      expect(result).toEqual({
        original_role: 'STUDENT',
        original_role_display: '學生',
        temp_role: null,
        temp_role_display: null,
        effective_role: 'STUDENT',
        effective_role_display: '學生',
      });
    });

    it('應該回傳管理員的臨時角色', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockAdmin);

      // Act
      const result = await service.getCurrentRole(1, 'TEACHER');

      // Assert
      expect(result).toEqual({
        original_role: 'ADMIN',
        original_role_display: '系統管理員',
        temp_role: 'TEACHER',
        temp_role_display: '老師',
        effective_role: 'TEACHER',
        effective_role_display: '老師',
      });
    });

    it('應該拒絕非管理員使用臨時角色', async () => {
      // Arrange
      const mockStudent = createMockUser({ id: 1, role: 'STUDENT' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockStudent);

      // Act
      const result = await service.getCurrentRole(1, 'TEACHER');

      // Assert - 非管理員即使傳入 tempRole 也不生效
      expect(result).toEqual({
        original_role: 'STUDENT',
        original_role_display: '學生',
        temp_role: null,
        temp_role_display: null,
        effective_role: 'STUDENT',
        effective_role_display: '學生',
      });
    });

    it('應該在用戶不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentRole(999)).rejects.toThrow(NotFoundException);
      await expect(service.getCurrentRole(999)).rejects.toThrow('User not found');
    });

    it('應該拒絕無效的臨時角色代碼', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockAdmin);

      // Act
      const result = await service.getCurrentRole(1, 'INVALID_ROLE');

      // Assert - 無效角色不生效
      expect(result.temp_role).toBeNull();
      expect(result.effective_role).toBe('ADMIN');
    });
  });

  describe('impersonateUser', () => {
    it('應該允許管理員模擬其他用戶', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      const mockTargetUser = createMockUserWithRelations({
        id: 2,
        username: 'targetuser',
        role: 'STUDENT',
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findUnique')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockTargetUser);
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce('target_access_token')
        .mockReturnValueOnce('target_refresh_token');

      // Act
      const result = await service.impersonateUser(1, 2);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access', 'target_access_token');
      expect(result).toHaveProperty('refresh', 'target_refresh_token');
      expect(result).toHaveProperty('message', '已切換為 targetuser 身分');
      expect(result.user.id).toBe(2);
      expect(result.user.username).toBe('targetuser');
    });

    it('應該拒絕非管理員模擬其他用戶', async () => {
      // Arrange
      const mockStudent = createMockUser({ id: 1, role: 'STUDENT' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockStudent);

      // Act & Assert
      await expect(service.impersonateUser(1, 2)).rejects.toThrow(ForbiddenException);
      await expect(service.impersonateUser(1, 2)).rejects.toThrow('只有管理員可以模擬其他用戶');
    });

    it('應該在目標用戶不存在時拋出 NotFoundException', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      jest.spyOn(prisma.accountCustomUser, 'findUnique')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.impersonateUser(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('應該為目標用戶生成正確的 JWT token', async () => {
      // Arrange
      const mockAdmin = createMockUser({ id: 1, role: 'ADMIN' });
      const mockTargetUser = createMockUserWithRelations({
        id: 2,
        username: 'targetuser',
      });
      
      jest.spyOn(prisma.accountCustomUser, 'findUnique')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockTargetUser);
      const signSpy = jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access')
        .mockReturnValueOnce('refresh');

      // Act
      await service.impersonateUser(1, 2);

      // Assert
      expect(signSpy).toHaveBeenNthCalledWith(1,
        { sub: 2, username: 'targetuser' },
        { expiresIn: '1h' }
      );
      expect(signSpy).toHaveBeenNthCalledWith(2,
        { sub: 2, username: 'targetuser' },
        { expiresIn: '7d' }
      );
    });
  });

  describe('getUsers', () => {
    it('應該回傳分頁的用戶列表', async () => {
      // Arrange
      const mockUsers = [
        createMockUserWithRelations({ id: 1 }),
        createMockUserWithRelations({ id: 2 }),
      ];
      jest.spyOn(prisma.accountCustomUser, 'findMany').mockResolvedValue(mockUsers);
      jest.spyOn(prisma.accountCustomUser, 'count').mockResolvedValue(20);

      // Act
      const result = await service.getUsers(1, 10);

      // Assert
      expect(result.count).toBe(20);
      expect(result.results).toHaveLength(2);
      expect(result.next).toBe(2);
      expect(result.previous).toBeNull();
    });

    it('應該正確計算分頁資訊', async () => {
      // Arrange
      jest.spyOn(prisma.accountCustomUser, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.accountCustomUser, 'count').mockResolvedValue(25);

      // Act
      const result = await service.getUsers(2, 10);

      // Assert
      expect(result.count).toBe(25);
      expect(result.next).toBe(3);
      expect(result.previous).toBe(1);
    });
  });

  describe('getUserById', () => {
    it('應該成功取得指定 ID 的用戶', async () => {
      // Arrange
      const mockUser = createMockUserWithRelations({ id: 1 });
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(1);

      // Assert
      expect(result.id).toBe(1);
    });

    it('應該在用戶不存在時拋出 NotFoundException', async () => {
      // Arrange
      jest.spyOn(prisma.accountCustomUser, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
      await expect(service.getUserById(999)).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('getRoles', () => {
    it('應該回傳分頁的角色列表', async () => {
      // Arrange
      const mockRoles = [
        createMockRole({ id: 1, code: 'ADMIN_ROLE' }),
        createMockRole({ id: 2, code: 'STUDENT_ROLE' }),
      ];
      jest.spyOn(prisma.accountRole, 'findMany').mockResolvedValue(mockRoles);
      jest.spyOn(prisma.accountRole, 'count').mockResolvedValue(5);

      // Act
      const result = await service.getRoles(1, 10);

      // Assert
      expect(result.count).toBe(5);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('getAuditLogs', () => {
    it('應該回傳分頁的審計日誌列表', async () => {
      // Arrange
      const mockLogs = [
        createMockAuditLog({ id: 1 }),
        createMockAuditLog({ id: 2 }),
      ];
      jest.spyOn(prisma.accountAuditLog, 'findMany').mockResolvedValue(mockLogs);
      jest.spyOn(prisma.accountAuditLog, 'count').mockResolvedValue(10);

      // Act
      const result = await service.getAuditLogs(1, 10);

      // Assert
      expect(result.count).toBe(10);
      expect(result.results).toHaveLength(2);
    });
  });
});
