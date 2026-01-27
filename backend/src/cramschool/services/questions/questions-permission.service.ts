/**
 * Questions Permission Service
 * 處理題目相關的權限檢查邏輯
 */

import { Injectable, ForbiddenException } from '@nestjs/common'

@Injectable()
export class QuestionsPermissionService {
  /**
   * 檢查用戶是否有權限創建題目
   */
  checkCreatePermission(userRole: string): void {
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以創建題目')
    }
  }

  /**
   * 檢查用戶是否有權限更新題目
   */
  checkUpdatePermission(userRole: string): void {
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以更新題目')
    }
  }

  /**
   * 檢查用戶是否有權限刪除題目
   */
  checkDeletePermission(userRole: string): void {
    if (userRole !== 'TEACHER') {
      throw new ForbiddenException('只有老師可以刪除題目')
    }
  }

  /**
   * 檢查用戶是否有權限查看題目列表
   */
  checkListPermission(userRole: string): void {
    if (userRole === 'STUDENT') {
      throw new ForbiddenException('學生不能查看題目列表')
    }
  }
}
