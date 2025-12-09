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
import AttendanceTracker from '../views/AttendanceTracker.vue'
import LeaveForm from '../views/LeaveForm.vue'
import QuestionBank from '../views/QuestionBank.vue'
import LunchOrderSystem from '../views/LunchOrderSystem.vue'
import GroupOrderDetail from '../views/GroupOrderDetail.vue'
import JoinGroupOrder from '../views/JoinGroupOrder.vue'
import StudentErrorLog from '../views/StudentErrorLog.vue'
import TuitionGenerator from '../views/TuitionGenerator.vue'
import StudentFeeTracker from '../views/StudentFeeTracker.vue'
import RoleManagement from '../views/RoleManagement.vue'
import AuditLog from '../views/AuditLog.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: '登入', requiresAuth: false },
    },
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
      path: '/students/:studentId/tuition',
      name: 'tuition-generator',
      component: TuitionGenerator,
      props: true,
      meta: { title: '生成學費' },
    },
    {
      path: '/students/:studentId/fees',
      name: 'student-fees',
      component: StudentFeeTracker,
      props: true,
      meta: { title: '學生費用核銷' },
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
    {
      path: '/roles',
      name: 'roles',
      component: RoleManagement,
      meta: { title: '角色管理', requiresAdmin: true },
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: AuditLog,
      meta: { title: '操作記錄', requiresAdmin: true },
    },
  ],
})

// 路由守衛：檢查權限
router.beforeEach(async (to, from, next) => {
  // 登入頁面不需要認證
  if (to.name === 'login') {
    // 如果已經登入，跳轉到首頁
    const user = await getCurrentUser()
    if (user) {
      next('/')
      return
    }
    next()
    return
  }

  // 檢查是否已登入
  const user = await getCurrentUser()
  if (!user) {
    // 未登入，跳轉到登入頁
    next('/login')
    return
  }

  // 檢查是否需要管理員權限
  if (to.meta.requiresAdmin) {
    try {
      // 獲取當前用戶信息
      const user = await getCurrentUser()
      if (!user || user.role !== 'ADMIN') {
        alert('您沒有權限訪問此頁面')
        next('/')
        return
      }
    } catch (error) {
      console.error('獲取用戶信息失敗:', error)
      alert('無法驗證權限，請重新登入')
      next('/')
      return
    }
  }

  // 檢查頁面權限（如果不是管理員）
  if (to.meta.requiresPagePermission) {
    try {
      const user = await getCurrentUser()
      if (user && user.role !== 'ADMIN') {
        const hasPermission = await checkPagePermission(user, to.path)
        if (!hasPermission) {
          alert('您沒有權限訪問此頁面')
          next('/')
          return
        }
      }
    } catch (error) {
      console.error('檢查頁面權限失敗:', error)
    }
  }

  next()
})

// 獲取當前用戶信息
async function getCurrentUser() {
  try {
    // 檢查是否有 access token
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      return null
    }

    // 先從 localStorage 獲取用戶信息
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      // 驗證用戶數據是否有效
      if (user && user.id) {
        // 驗證 token 是否仍然有效（可選，因為 API 攔截器會自動處理）
        try {
          const { authAPI } = await import('../services/api')
          const response = await authAPI.getCurrentUser()
          // 更新用戶信息
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
          }
          return user
        } catch (error) {
          // Token 無效，清除本地存儲
          const { clearTokens } = await import('../services/api')
          clearTokens()
          return null
        }
      }
    }

    // 如果沒有本地存儲，嘗試從 API 獲取
    try {
      const { authAPI } = await import('../services/api')
      const response = await authAPI.getCurrentUser()
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        return response.data
      }
    } catch (apiError) {
      // API 可能不存在或需要認證，忽略錯誤
      console.warn('無法從 API 獲取用戶信息:', apiError)
    }

    return null
  } catch (error) {
    console.error('獲取用戶信息失敗:', error)
    return null
  }
}

// 檢查頁面權限
async function checkPagePermission(user, pagePath) {
  if (user.role === 'ADMIN') {
    return true
  }

  // 檢查自訂角色的頁面權限
  if (user.custom_role) {
    try {
      const { roleAPI } = await import('../services/api')
      const response = await roleAPI.getById(user.custom_role)
      const role = response.data

      return role.permissions?.some(
        p => p.permission_type === 'page' && p.resource === pagePath
      ) || false
    } catch (error) {
      console.error('檢查頁面權限失敗:', error)
      return false
    }
  }

  return false
}

export default router

