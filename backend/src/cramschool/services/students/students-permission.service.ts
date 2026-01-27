/**
 * Students Permission Service
 * 處理學生相關的權限檢查邏輯
 */

import { Injectable, ForbiddenException } from '@nestjs/common'

@Injectable()
export class StudentsPermissionService {
  /**
   * 檢查用戶是否有權限創建學生
   */
  checkCreatePermission(userRole: string): void {
    if (userRole !== 'ADMIN' && userRole !== 'ACCOUNTANT') {
      throw new ForbiddenException('只有管理員或會計可以創建學生')
    }
  }
}
