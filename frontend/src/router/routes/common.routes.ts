/**
 * 通用路由（儀表板、登入、其他）
 */

import type { RouteRecordRaw } from 'vue-router'
import Dashboard from '../../views/Dashboard.vue'
import Login from '../../views/Login.vue'
import LunchOrderSystem from '../../views/LunchOrderSystem.vue'
import GroupOrderDetail from '../../views/GroupOrderDetail.vue'
import JoinGroupOrder from '../../views/JoinGroupOrder.vue'
import RoleManagement from '../../views/RoleManagement.vue'
import AuditLog from '../../views/AuditLog.vue'

export const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登入', requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { title: '營運儀表板' }
  },
  {
    path: '/lunch-orders',
    name: 'lunch-orders',
    component: LunchOrderSystem,
    meta: { title: '訂便當系統' }
  },
  {
    path: '/lunch-orders/:id',
    name: 'group-order-detail',
    component: GroupOrderDetail,
    props: true,
    meta: { title: '團購詳情' }
  },
  {
    path: '/lunch-orders/join/:link',
    name: 'join-group-order',
    component: JoinGroupOrder,
    props: true,
    meta: { title: '點餐' }
  },
  {
    path: '/roles',
    name: 'roles',
    component: RoleManagement,
    meta: { title: '角色管理', requiresAdmin: true }
  },
  {
    path: '/audit-logs',
    name: 'audit-logs',
    component: AuditLog,
    meta: { title: '操作記錄', requiresAdmin: true }
  }
]
