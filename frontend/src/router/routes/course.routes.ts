/**
 * 課程相關路由
 */

import type { RouteRecordRaw } from 'vue-router'
import CourseList from '../../views/CourseList.vue'
import CourseForm from '../../views/CourseForm.vue'
import EnrollmentForm from '../../views/EnrollmentForm.vue'
import AttendanceTracker from '../../views/AttendanceTracker.vue'
import LeaveForm from '../../views/LeaveForm.vue'

export const courseRoutes: RouteRecordRaw[] = [
  {
    path: '/courses',
    name: 'courses',
    component: CourseList,
    meta: { title: '課程管理' }
  },
  {
    path: '/courses/add',
    name: 'course-add',
    component: CourseForm,
    meta: { title: '新增課程' }
  },
  {
    path: '/courses/edit/:id',
    name: 'course-edit',
    component: CourseForm,
    props: true,
    meta: { title: '編輯課程' }
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: AttendanceTracker,
    meta: { title: '請假管理' }
  },
  {
    path: '/attendance/leaves/add',
    name: 'leave-add',
    component: LeaveForm,
    meta: { title: '新增請假記錄' }
  },
  {
    path: '/attendance/leaves/edit/:id',
    name: 'leave-edit',
    component: LeaveForm,
    props: true,
    meta: { title: '編輯請假記錄' }
  }
]
