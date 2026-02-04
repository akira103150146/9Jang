import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  // Swagger API 文檔配置
  const config = new DocumentBuilder()
    .setTitle('9Jang 補習班管理系統 API')
    .setDescription('9Jang Cram School Management System API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '請輸入 JWT Token',
        in: 'header',
      },
      'JWT-auth', // 這個名稱會在 @ApiBearerAuth() 中使用
    )
    .addTag('account', '帳號管理 - 登入、登出、使用者資訊')
    .addTag('students', '學生管理 - 學生資料、註冊、繳費')
    .addTag('teachers', '教師管理 - 教師資料、課程')
    .addTag('courses', '課程管理 - 課程、班級、排課')
    .addTag('questions', '題庫管理 - 題目、標籤、匯入')
    .addTag('error-logs', '錯題本 - 學生錯題記錄')
    .addTag('mistake-notes', '訂正本 - 學生訂正記錄')
    .addTag('resources', '資源管理 - 教材、講義')
    .addTag('orders', '訂餐管理 - 團訂、訂單')
    .addTag('attendances', '出缺席管理 - 簽到、請假')
    .addTag('fees', '費用管理 - 學費、雜費')
    .addTag('media', '媒體管理 - 圖片上傳')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 保持授權狀態
      tagsSorter: 'alpha', // 標籤按字母排序
      operationsSorter: 'alpha', // 操作按字母排序
    },
    customSiteTitle: '9Jang API 文檔',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger API Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
