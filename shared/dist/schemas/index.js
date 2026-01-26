"use strict";
/**
 * Shared Schemas Export
 * 統一導出所有 schemas
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Tiptap 類型
__exportStar(require("../types/tiptap"), exports);
// 用戶和認證
__exportStar(require("./user.schema"), exports);
// 學生
__exportStar(require("./student.schema"), exports);
// 老師
__exportStar(require("./teacher.schema"), exports);
// 課程
__exportStar(require("./course.schema"), exports);
// 題目
__exportStar(require("./question.schema"), exports);
// 教學資源和模板
__exportStar(require("./resource.schema"), exports);
// 報名
__exportStar(require("./enrollment.schema"), exports);
// 學生群組
__exportStar(require("./student-group.schema"), exports);
// 請假
__exportStar(require("./leave.schema"), exports);
// 費用
__exportStar(require("./fee.schema"), exports);
// 出缺勤
__exportStar(require("./attendance.schema"), exports);
__exportStar(require("./session.schema"), exports);
// 科目
__exportStar(require("./subject.schema"), exports);
// 標籤和題目標籤
__exportStar(require("./hashtag.schema"), exports);
__exportStar(require("./question-tag.schema"), exports);
// 學生作答
__exportStar(require("./student-answer.schema"), exports);
// 錯題記錄
__exportStar(require("./error-log.schema"), exports);
__exportStar(require("./student-mistake-note.schema"), exports);
__exportStar(require("./error-log-image.schema"), exports);
__exportStar(require("./student-mistake-note-image.schema"), exports);
// 訂單相關
__exportStar(require("./restaurant.schema"), exports);
__exportStar(require("./group-order.schema"), exports);
__exportStar(require("./order.schema"), exports);
__exportStar(require("./order-item.schema"), exports);
