import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { ApiResourcesController } from './api-resources.controller';
import { ApiResourcesService } from './api-resources.service';

@Module({
  imports: [
    PassportModule,
    DiscoveryModule, // 新增 (用於 API 資源發現)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_LIFETIME_HOURS', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AccountController,
    RolesController, // 新增
    ApiResourcesController, // 新增
  ],
  providers: [
    AccountService,
    RolesService, // 新增
    ApiResourcesService, // 新增
    JwtStrategy,
  ],
  exports: [AccountService, RolesService],
})
export class AccountModule {}
