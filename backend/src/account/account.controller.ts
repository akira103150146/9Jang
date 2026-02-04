import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthRequest } from '@/types/request.types';
import { AccountService } from './account.service';
import {
  LoginRequestDto,
  LoginResponse,
  User,
  ChangePasswordRequestDto,
  RefreshTokenRequestDto,
  RefreshTokenResponse,
} from '@9jang/shared';
import {
  LoginRequestSchema,
  ChangePasswordRequestSchema,
  RefreshTokenRequestSchema,
} from '@9jang/shared';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Post('login')
  @ApiOperation({ summary: '使用者登入', description: '使用帳號密碼登入系統，返回 JWT token' })
  @ApiResponse({ status: 200, description: '登入成功', })
  @ApiResponse({ status: 401, description: '帳號或密碼錯誤' })
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) loginDto: LoginRequestDto,
  ): Promise<LoginResponse> {
    return this.accountService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '使用者登出', description: '登出系統（客戶端需刪除 token）' })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async logout() {
    /**
     * JWT 登出流程說明：
     * 
     * 1. 前端呼叫此 API（authAPI.logout()）
     * 2. JwtAuthGuard 驗證使用者身分（確保是已登入用戶）
     * 3. 後端回傳成功訊息
     * 4. 前端在 finally 區塊執行 clearTokens()，刪除：
     *    - localStorage 中的 access_token
     *    - localStorage 中的 refresh_token
     *    - localStorage 中的 user 資訊
     * 
     * 注意：
     * - Token 的刪除完全由前端（瀏覽器）處理
     * - 後端不維護 token 黑名單（保持無狀態設計）
     * - Token 在過期前仍然有效（access: 1小時, refresh: 7天）
     * - 如需更高安全性，可實作 Redis 黑名單機制
     */
    return { message: '登出成功' };
  }

  @Post('token/refresh')
  @ApiOperation({ summary: '刷新 Token', description: '使用 refresh token 獲取新的 access token' })
  @ApiResponse({ status: 200, description: '刷新成功', })
  @ApiResponse({ status: 401, description: 'Refresh token 無效或過期' })
  async refreshToken(
    @Body(new ZodValidationPipe(RefreshTokenRequestSchema))
    refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponse> {
    return this.accountService.refreshToken(refreshTokenDto);
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得當前使用者資訊', description: '取得目前登入使用者的詳細資料' })
  @ApiResponse({ status: 200, description: '成功', })
  @ApiResponse({ status: 401, description: '未授權' })
  async getCurrentUser(@Request() req: AuthRequest): Promise<User> {
    return this.accountService.getCurrentUser(req.user.id);
  }

  @Get('current-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得當前角色', description: '取得使用者的原始角色和臨時角色資訊' })
  @ApiQuery({ name: 'temp_role', required: false, description: '臨時角色代碼' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getCurrentRole(
    @Request() req: AuthRequest,
    @Query('temp_role') tempRole?: string,
  ): Promise<{
    original_role: string;
    original_role_display: string;
    temp_role: string | null;
    temp_role_display: string | null;
    effective_role: string;
    effective_role_display: string;
  }> {
    return this.accountService.getCurrentRole(req.user.id, tempRole);
  }

  @Post('switch-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '切換角色', description: '切換到臨時角色（用於測試或特殊權限）' })
  @ApiResponse({ status: 200, description: '切換成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限切換到此角色' })
  async switchRole(
    @Request() req: AuthRequest,
    @Body() body: { role: string },
  ): Promise<{ message: string; temp_role: string; original_role: string }> {
    return this.accountService.switchRole(req.user.id, body.role);
  }

  @Post('reset-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '重置角色', description: '將臨時角色重置為原始角色' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async resetRole(
    @Request() req: AuthRequest,
  ): Promise<{ message: string; current_role: string }> {
    return this.accountService.resetRole(req.user.id);
  }

  @Post('impersonate-user')
  @UseGuards(JwtAuthGuard)
  async impersonateUser(
    @Request() req: AuthRequest,
    @Body() body: { user_id: number },
  ): Promise<{
    user: User;
    access: string;
    refresh: string;
    message: string;
  }> {
    return this.accountService.impersonateUser(req.user.id, body.user_id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改密碼', description: '修改當前使用者的密碼' })
  @ApiResponse({ status: 200, description: '密碼修改成功' })
  @ApiResponse({ status: 400, description: '舊密碼錯誤或新密碼不符合規則' })
  @ApiResponse({ status: 401, description: '未授權' })
  async changePassword(
    @Request() req: AuthRequest,
    @Body(new ZodValidationPipe(ChangePasswordRequestSchema))
    changePasswordDto: ChangePasswordRequestDto,
  ): Promise<{ message: string }> {
    await this.accountService.changePassword(req.user.id, changePasswordDto);
    return { message: '密碼修改成功' };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得使用者列表', description: '分頁查詢所有使用者' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1 })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10 })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.accountService.getUsers(page, pageSize);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得單一使用者', description: '根據 ID 查詢使用者詳細資料' })
  @ApiParam({ name: 'id', description: '使用者 ID' })
  @ApiResponse({ status: 200, description: '成功', })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '使用者不存在' })
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.accountService.getUserById(id);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得角色列表', description: '分頁查詢所有系統角色' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1 })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10 })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getRoles(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.accountService.getRoles(page, pageSize);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '取得審計日誌', description: '分頁查詢系統操作記錄' })
  @ApiQuery({ name: 'page', required: false, description: '頁碼', example: 1 })
  @ApiQuery({ name: 'page_size', required: false, description: '每頁筆數', example: 10 })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  async getAuditLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.accountService.getAuditLogs(page, pageSize);
  }
}
