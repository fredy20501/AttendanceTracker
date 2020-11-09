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
    // The meta tag "back" determines if the back button is shown in the footer for this page
    meta: { back: true },
    component: () => import(/* webpackChunkName: "[request]" */ '../views/CreateAccount.vue')
  },
  {
    // Genral "home" page which redirects to the proper student or 
    // professor home page depending on the user
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
    // We use the meta tag to know whether you need to be logged in to access it (requiresAuth) 
    // and what account it is associated with (accountType)
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
    meta: { back: true, requiresAuth: true, accountType: 'professor' },
    component: () => import(/* webpackChunkName: "[request]" */ '../views/CreateSection.vue')
  },
  {
    path: '/course',
    name: 'course',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "[course]" */ '../views/CourseView.vue')
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

// This beforeEach method is called whenever the router is being switched to a different page
router.beforeEach((to, from, next) => {

  // Prevent users from accessing pages if they are not logged in
  if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.isAuthenticated) {
    // User is not authenticated, go to login page
    next({ name: 'login' })
  }

  // If the user is already logged in and going to the login or create-account page, redirect to home page
  else if (to.matched.some(record => !record.meta.requiresAuth) && store.getters.isAuthenticated) {
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
