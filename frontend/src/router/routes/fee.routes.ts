/**
 * 費用相關路由
 */

import type { RouteRecordRaw } from 'vue-router'
import FeeTracker from '../../views/FeeTracker.vue'
import FeeForm from '../../views/FeeForm.vue'

export const feeRoutes: RouteRecordRaw[] = [
  {
    path: '/fees',
    name: 'fees',
    component: FeeTracker,
    meta: { title: '所有費用', allowedRoles: ['ACCOUNTANT'] }
  },
  {
    path: '/fees/add',
    name: 'fee-add',
    component: FeeForm,
    meta: { title: '新增費用記錄', allowedRoles: ['ACCOUNTANT'] }
  },
  {
    path: '/fees/edit/:id',
    name: 'fee-edit',
    component: FeeForm,
    props: true,
    meta: { title: '編輯費用記錄', allowedRoles: ['ACCOUNTANT'] }
  }
]
