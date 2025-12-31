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
