import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof ZodError) {
      // 處理 Zod 驗證錯誤
      status = HttpStatus.BAD_REQUEST;
      const errors = exception.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      message = {
        detail: '驗證失敗',
        errors,
      };
    }

    // 對應 Django 的錯誤響應格式
    const errorResponse: any = {
      detail: typeof message === 'string' ? message : (message as any).detail || (message as any).message || 'An error occurred',
    };

    // 如果是對象，合併其他字段（保留 errors 等）
    if (typeof message === 'object' && message !== null) {
      if ((message as any).errors) {
        errorResponse.errors = (message as any).errors;
      }
      // 保留其他字段
      Object.keys(message).forEach((key) => {
        if (key !== 'detail' && key !== 'message') {
          errorResponse[key] = (message as any)[key];
        }
      });
    }

    response.status(status).json(errorResponse);
  }
}
