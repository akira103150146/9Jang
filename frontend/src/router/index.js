import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import StudentList from '../views/StudentList.vue'
import StudentForm from '../views/StudentForm.vue'
import TeacherList from '../views/TeacherList.vue'
import TeacherForm from '../views/TeacherForm.vue'
import CourseList from '../views/CourseList.vue'
import CourseForm from '../views/CourseForm.vue'
import EnrollmentBoard from '../views/EnrollmentBoard.vue'
import EnrollmentForm from '../views/EnrollmentForm.vue'
import FeeTracker from '../views/FeeTracker.vue'
import FeeForm from '../views/FeeForm.vue'
import AttendanceTracker from '../views/AttendanceTracker.vue'
import LeaveForm from '../views/LeaveForm.vue'
import QuestionBank from '../views/QuestionBank.vue'
import LunchOrderSystem from '../views/LunchOrderSystem.vue'
import GroupOrderDetail from '../views/GroupOrderDetail.vue'
import JoinGroupOrder from '../views/JoinGroupOrder.vue'
import StudentErrorLog from '../views/StudentErrorLog.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: '營運儀表板' },
    },
    {
      path: '/students',
      name: 'student-list',
      component: StudentList,
      meta: { title: '學生資訊' },
    },
    {
      path: '/students/add',
      name: 'student-add',
      component: StudentForm,
      meta: { title: '新增學生' },
    },
    {
      path: '/students/edit/:id',
      name: 'student-edit',
      component: StudentForm,
      props: true,
      meta: { title: '編輯學生' },
    },
    {
      path: '/students/:id/errors',
      name: 'student-errors',
      component: StudentErrorLog,
      props: true,
      meta: { title: '學生錯題本' },
    },
    {
      path: '/teachers',
      name: 'teachers',
      component: TeacherList,
      meta: { title: '老師管理' },
    },
    {
      path: '/teachers/add',
      name: 'teacher-add',
      component: TeacherForm,
      meta: { title: '新增老師' },
    },
    {
      path: '/teachers/edit/:id',
      name: 'teacher-edit',
      component: TeacherForm,
      props: true,
      meta: { title: '編輯老師' },
    },
    {
      path: '/courses',
      name: 'courses',
      component: CourseList,
      meta: { title: '課程管理' },
    },
    {
      path: '/courses/add',
      name: 'course-add',
      component: CourseForm,
      meta: { title: '新增課程' },
    },
    {
      path: '/courses/edit/:id',
      name: 'course-edit',
      component: CourseForm,
      props: true,
      meta: { title: '編輯課程' },
    },
    {
      path: '/enrollments',
      name: 'enrollments',
      component: EnrollmentBoard,
      meta: { title: '報名紀錄' },
    },
    {
      path: '/enrollments/add',
      name: 'enrollment-add',
      component: EnrollmentForm,
      meta: { title: '新增報名記錄' },
    },
    {
      path: '/enrollments/edit/:id',
      name: 'enrollment-edit',
      component: EnrollmentForm,
      props: true,
      meta: { title: '編輯報名記錄' },
    },
    {
      path: '/fees',
      name: 'fees',
      component: FeeTracker,
      meta: { title: '費用追蹤' },
    },
    {
      path: '/fees/add',
      name: 'fee-add',
      component: FeeForm,
      meta: { title: '新增費用記錄' },
    },
    {
      path: '/fees/edit/:id',
      name: 'fee-edit',
      component: FeeForm,
      props: true,
      meta: { title: '編輯費用記錄' },
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: AttendanceTracker,
      meta: { title: '請假管理' },
    },
    {
      path: '/attendance/leaves/add',
      name: 'leave-add',
      component: LeaveForm,
      meta: { title: '新增請假記錄' },
    },
    {
      path: '/attendance/leaves/edit/:id',
      name: 'leave-edit',
      component: LeaveForm,
      props: true,
      meta: { title: '編輯請假記錄' },
    },
    {
      path: '/questions',
      name: 'questions',
      component: QuestionBank,
      meta: { title: '題庫管理' },
    },
    {
      path: '/lunch-orders',
      name: 'lunch-orders',
      component: LunchOrderSystem,
      meta: { title: '訂便當系統' },
    },
    {
      path: '/lunch-orders/:id',
      name: 'group-order-detail',
      component: GroupOrderDetail,
      props: true,
      meta: { title: '團購詳情' },
    },
    {
      path: '/lunch-orders/join/:link',
      name: 'join-group-order',
      component: JoinGroupOrder,
      props: true,
      meta: { title: '點餐' },
    },
  ],
})

export default router

