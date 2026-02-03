import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 啟用 CORS
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : isDevelopment
    ? true // 開發環境允許所有來源
    : ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'accept',
      'accept-encoding',
      'authorization',
      'content-type',
      'dnt',
      'origin',
      'user-agent',
      'x-csrftoken',
      'x-requested-with',
      'x-temp-role',
      'x-impersonated-by',
    ],
  });

  // 使用 Zod 驗證（從共享 schema）
  app.useGlobalPipes(new ZodValidationPipe());

  // 全局異常過濾器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局審計日誌攔截器
  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(new AuditLogInterceptor(prismaService));

  // API 前綴
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
