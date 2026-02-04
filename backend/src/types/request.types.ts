import { Request } from 'express';

/**
 * 已認證的請求介面
 * 包含經過 JWT 驗證後的使用者資訊
 */
export interface AuthRequest extends Request {
  user: {
    id: number;
    username: string;
    role?: string;
  };
}
