import { createRouter, createWebHistory } from 'vue-router'
import StudentList from '../views/StudentList.vue'
import StudentForm from '../views/StudentForm.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'student-list',
      component: StudentList
    },
    {
      path: '/students/add',
      name: 'student-add',
      component: StudentForm
    },
    {
      path: '/students/edit/:id',
      name: 'student-edit',
      component: StudentForm,
      props: true
    }
  ]
})

export default router

