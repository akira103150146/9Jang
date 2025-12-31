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

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) loginDto: LoginRequestDto,
  ): Promise<LoginResponse> {
    return this.accountService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    // JWT 是無狀態的，登出主要是客戶端刪除 token
    // 如果需要 token 黑名單，可以在這裡實現
    return { message: '登出成功' };
  }

  @Post('token/refresh')
  async refreshToken(
    @Body(new ZodValidationPipe(RefreshTokenRequestSchema))
    refreshTokenDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponse> {
    return this.accountService.refreshToken(refreshTokenDto);
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req): Promise<User> {
    return this.accountService.getCurrentUser(req.user.id);
  }

  @Get('current-role')
  @UseGuards(JwtAuthGuard)
  async getCurrentRole(@Request() req): Promise<{ role: string }> {
    const user = await this.accountService.getCurrentUser(req.user.id);
    return { role: user.role };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body(new ZodValidationPipe(ChangePasswordRequestSchema))
    changePasswordDto: ChangePasswordRequestDto,
  ): Promise<{ message: string }> {
    await this.accountService.changePassword(req.user.id, changePasswordDto);
    return { message: '密碼修改成功' };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.accountService.getUsers(page, pageSize);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.accountService.getUserById(id);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  async getRoles(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.accountService.getRoles(page, pageSize);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  async getAuditLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true })) pageSize: number = 10,
  ) {
    return this.accountService.getAuditLogs(page, pageSize);
  }
}
