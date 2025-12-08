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
import StoreInfo from '../views/StoreInfo.vue'

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
      path: '/stores',
      name: 'stores',
      component: StoreInfo,
      meta: { title: '校區資訊' },
    },
  ],
})

export default router

