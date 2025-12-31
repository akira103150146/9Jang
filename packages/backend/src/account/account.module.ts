import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
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
  controllers: [AccountController],
  providers: [AccountService, JwtStrategy],
  exports: [AccountService],
})
export class AccountModule {}
