import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AccountModule } from './account/account.module';
import { CramschoolModule } from './cramschool/cramschool.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AccountModule,
    CramschoolModule,
  ],
})
export class AppModule {}
