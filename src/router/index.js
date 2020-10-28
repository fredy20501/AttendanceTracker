import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/create-account',
    name: 'createAccount',
    component: () => import(/* webpackChunkName: "[request]" */ '../views/CreateAccount.vue')
  },
  {
    path: '/student',
    name: 'studentHome',
    meta: { requiresAuth: true, accountType: 'student' },
    component: () => import(/* webpackChunkName: "[request]" */ '../views/StudentHome.vue')
  },
  {
    path: '/professor',
    name: 'professorHome',
    meta: { requiresAuth: true, accountType: 'professor' },
    component: () => import(/* webpackChunkName: "[request]" */ '../views/ProfessorHome.vue')
  },
  {
    path: '/create-edit-section',
    name: 'createEditSection',
    meta: { requiresAuth: true, accountType: 'professor' },
    component: () => import(/* webpackChunkName: "[request]" */ '../views/CreateEditSection.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // Prevent users from accessing pages if they are not logged in
  if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.isAuthenticated) {
    // User is not authenticated, go to login page
    next({ name: 'login' })
  }
  else {
    // Continue as normal
    next()
  }
}) 

export default router
