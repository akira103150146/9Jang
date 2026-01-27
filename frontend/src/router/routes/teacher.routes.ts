/**
 * 老師相關路由
 */

import type { RouteRecordRaw } from 'vue-router'
import TeacherList from '../../views/TeacherList.vue'
import TeacherForm from '../../views/TeacherForm.vue'

export const teacherRoutes: RouteRecordRaw[] = [
  {
    path: '/teachers',
    name: 'teachers',
    component: TeacherList,
    meta: { title: '老師管理' }
  },
  {
    path: '/teachers/add',
    name: 'teacher-add',
    component: TeacherForm,
    meta: { title: '新增老師' }
  },
  {
    path: '/teachers/edit/:id',
    name: 'teacher-edit',
    component: TeacherForm,
    props: true,
    meta: { title: '編輯老師' }
  }
]
