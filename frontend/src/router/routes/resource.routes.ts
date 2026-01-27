/**
 * 資源相關路由
 */

import type { RouteRecordRaw } from 'vue-router'
import ResourceEditor from '../../views/ResourceEditor.vue'
import TemplateEditor from '../../views/TemplateEditor.vue'

export const resourceRoutes: RouteRecordRaw[] = [
  {
    path: '/resources/new',
    name: 'resource-new',
    component: ResourceEditor,
    meta: { title: '新增教學資源', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/resources/view/:id',
    name: 'resource-view',
    component: ResourceEditor,
    props: (route) => ({ id: route.params.id, viewMode: true }),
    meta: { title: '查看教學資源', allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] }
  },
  {
    path: '/resources/edit/:id',
    name: 'resource-edit',
    component: ResourceEditor,
    props: true,
    meta: { title: '編輯教學資源', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/templates/new',
    name: 'template-new',
    component: TemplateEditor,
    meta: { title: '新增模板', allowedRoles: ['TEACHER'] }
  },
  {
    path: '/templates/edit/:id',
    name: 'template-edit',
    component: TemplateEditor,
    props: true,
    meta: { title: '編輯模板', allowedRoles: ['TEACHER'] }
  }
]
