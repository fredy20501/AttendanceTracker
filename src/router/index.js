import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import CreateAccount from '../views/CreateAccount.vue'
import StudentHome from '../views/StudentHome.vue'
import ProfessorHome from '../views/ProfessorHome.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/create-account',
    component: CreateAccount
  },
  {
    path: '/student',
    component: StudentHome
  },
  {
    path: '/professor',
    component: ProfessorHome
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
