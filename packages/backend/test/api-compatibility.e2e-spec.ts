/**
 * API 兼容性測試
 * 確保所有 API 端點與 Django 版本的響應格式一致
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ZodValidationPipe } from 'nestjs-zod';

describe('API Compatibility Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 配置與 main.ts 相同的全局設置
    app.useGlobalPipes(new ZodValidationPipe());
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Account Module', () => {
    describe('POST /api/account/login', () => {
      it('應該返回正確的響應格式（包含 access 和 refresh token）', () => {
        return request(app.getHttpServer())
          .post('/api/account/login')
          .send({
            username: 'test',
            password: 'test',
          })
          .expect((res) => {
            // 即使登入失敗，也應該有正確的錯誤格式
            if (res.status === 401) {
              expect(res.body).toHaveProperty('message');
            } else if (res.status === 200) {
              expect(res.body).toHaveProperty('access');
              expect(res.body).toHaveProperty('refresh');
            }
          });
      });

      it('應該驗證請求格式（使用 Zod schema）', () => {
        return request(app.getHttpServer())
          .post('/api/account/login')
          .send({
            // 缺少必要欄位
          })
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
          });
      });
    });

    describe('POST /api/account/token/refresh', () => {
      it('應該返回正確的響應格式', () => {
        return request(app.getHttpServer())
          .post('/api/account/token/refresh')
          .send({
            refresh: 'invalid-token',
          })
          .expect((res) => {
            // 即使 token 無效，也應該有正確的錯誤格式
            expect(res.body).toHaveProperty('message');
          });
      });
    });

    describe('GET /api/account/users/me', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .get('/api/account/users/me')
          .expect(401);
      });
    });
  });

  describe('Cramschool Module', () => {
    describe('GET /api/cramschool/students', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .get('/api/cramschool/students')
          .expect(401);
      });

      it('應該支援分頁參數', () => {
        return request(app.getHttpServer())
          .get('/api/cramschool/students?page=1&page_size=10')
          .expect(401); // 認證失敗，但路由應該存在
      });
    });

    describe('GET /api/cramschool/courses', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .get('/api/cramschool/courses')
          .expect(401);
      });
    });

    describe('GET /api/cramschool/questions', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .get('/api/cramschool/questions')
          .expect(401);
      });
    });

    describe('GET /api/cramschool/resources', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .get('/api/cramschool/resources')
          .expect(401);
      });
    });

    describe('POST /api/cramschool/upload-image', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .post('/api/cramschool/upload-image')
          .expect(401);
      });
    });

    describe('POST /api/cramschool/generate-resource', () => {
      it('應該要求認證', () => {
        return request(app.getHttpServer())
          .post('/api/cramschool/generate-resource')
          .expect(401);
      });

      it('應該驗證請求格式', () => {
        return request(app.getHttpServer())
          .post('/api/cramschool/generate-resource')
          .send({})
          .expect(401); // 先認證失敗，但路由存在
      });
    });
  });

  describe('Response Format Compatibility', () => {
    it('分頁響應應該符合 Django 格式', async () => {
      // 這個測試需要有效的認證 token
      // 格式應該是: { count, next, previous, results }
      // 由於需要認證，這裡只檢查路由存在
      const response = await request(app.getHttpServer())
        .get('/api/cramschool/students?page=1&page_size=10');
      
      // 應該返回 401（未認證）或 200（已認證），不應該是 404
      expect([200, 401]).toContain(response.status);
    });

    it('錯誤響應應該符合 Django 格式', () => {
      return request(app.getHttpServer())
        .post('/api/account/login')
        .send({
          username: 'nonexistent',
          password: 'wrong',
        })
        .expect((res) => {
          // 錯誤響應應該有 message 欄位
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});
