/**
 * 題目相關路由
 */

import type { RouteRecordRaw } from 'vue-router'
import QuestionBank from '../../views/QuestionBank.vue'
import QuestionForm from '../../views/QuestionForm.vue'
import QuestionImport from '../../views/QuestionImport.vue'
import BlockEditorTest from '../../views/BlockEditorTest.vue'

export const questionRoutes: RouteRecordRaw[] = [
  {
    path: '/questions',
    name: 'questions',
    component: QuestionBank,
    meta: { title: '題庫與資源管理', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/questions/new',
    name: 'question-new',
    component: QuestionForm,
    meta: { title: '新增題目', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/questions/edit/:id',
    name: 'question-edit',
    component: QuestionForm,
    props: true,
    meta: { title: '編輯題目', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/questions/import',
    name: 'question-import',
    component: QuestionImport,
    meta: { title: '匯入題目', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/block-editor-test',
    name: 'block-editor-test',
    component: BlockEditorTest,
    meta: { title: 'Block Editor 測試', allowedRoles: ['TEACHER'] }
  }
]
