/**
 * 學生相關路由
 */

import type { RouteRecordRaw } from 'vue-router'
import StudentList from '../../views/StudentList.vue'
import StudentForm from '../../views/StudentForm.vue'
import StudentErrorLog from '../../views/StudentErrorLog.vue'
import TuitionGenerator from '../../views/TuitionGenerator.vue'
import StudentFeeTracker from '../../views/StudentFeeTracker.vue'
import StudentHome from '../../views/StudentHome.vue'
import StudentMistakeBook from '../../views/StudentMistakeBook.vue'
import StudentMyCourses from '../../views/StudentMyCourses.vue'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/student-home',
    name: 'student-home',
    component: StudentHome,
    meta: { title: '學生首頁' }
  },
  {
    path: '/student-mistake-book',
    name: 'student-mistake-book',
    component: StudentMistakeBook,
    meta: { title: '我的錯題本', allowedRoles: ['STUDENT'] }
  },
  {
    path: '/my-courses',
    name: 'my-courses',
    component: StudentMyCourses,
    meta: { title: '我的課程', allowedRoles: ['STUDENT'] }
  },
  {
    path: '/students',
    name: 'student-list',
    component: StudentList,
    meta: { title: '學生資訊' }
  },
  {
    path: '/students/add',
    name: 'student-add',
    component: StudentForm,
    meta: { title: '新增學生' }
  },
  {
    path: '/students/edit/:id',
    name: 'student-edit',
    component: StudentForm,
    props: true,
    meta: { title: '編輯學生' }
  },
  {
    path: '/students/:id/errors',
    name: 'student-errors',
    component: StudentErrorLog,
    props: true,
    meta: { title: '學生錯題本' }
  },
  {
    path: '/students/:studentId/tuition',
    name: 'tuition-generator',
    component: TuitionGenerator,
    props: true,
    meta: { title: '生成學費' }
  },
  {
    path: '/students/:studentId/fees',
    name: 'student-fees',
    component: StudentFeeTracker,
    props: true,
    meta: { title: '學生費用核銷' }
  }
]
