import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/create-account',
    component: () => import('../views/CreateAccount.vue')
  },
  {
    path: '/student',
    component: () => import('../views/StudentHome.vue')
  },
  {
    path: '/professor',
    component: () => import('../views/ProfessorHome.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
