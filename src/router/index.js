import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import PageNotFound from '../views/PageNotFound.vue'
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
    path: '/home',
    name: 'home',
    redirect: () => {
      if (store.getters.isProfessor) {
        return { name: 'professorHome' }
      }
      else {
        return { name: 'studentHome' }
      }
    }
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
    path: '/create-section',
    name: 'createSection',
    meta: { requiresAuth: true, accountType: 'professor' },
    component: () => import(/* webpackChunkName: "[request]" */ '../views/CreateSection.vue')
  },

  // Default to page not found if url doesn't match any routes
  {
    path: '/:pathMatch(.*)*',
    name: 'pageNotFound',
    component: PageNotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  console.log("Authenticated:",store.getters.isAuthenticated);

  // Prevent users from accessing pages if they are not logged in
  if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.isAuthenticated) {
    // User is not authenticated, go to login page
    next({ name: 'login' })
  }

  // If the user is already logged in and going to login or create-account pages, redirect to home page
  else if (to.matched.some(record => !record.meta.requiresAuth) && store.getters.isAuthenticated) {
    // User is not authenticated, go to login page
    next({ name: 'home' })
  }

  // Prevent student from accessing professor view and vice-versa
  else if (to.matched.some(record => record.meta.accountType == 'professor') && !store.getters.isProfessor) {
    next({ name: 'studentHome' })
  }
  else if (to.matched.some(record => record.meta.accountType == 'student') && store.getters.isProfessor) {
    next({ name: 'professorHome' })
  }

  // Continue as normal
  else {
    next()
  }
})

export default router
