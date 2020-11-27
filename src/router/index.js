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
    component: () => import(/* webpackChunkName: "createAccount" */ '../views/CreateAccount.vue')
  },
  {
    // Genral "home" page which displays the dashboard for both student and professor
    path: '/home',
    name: 'home',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue')
  },
  {
    // This page requires the section id to be given as a parameter called id, as shown in the path.
    // The parameter is optional because of the question mark '?'.
    // This is because no section id means you want to create a section.
    path: '/create-section/:id?',
    name: 'createSection',
    meta: { back: true, requiresAuth: true, accountType: 'professor' },
    component: () => import(/* webpackChunkName: "createSection" */ '../views/CreateSection.vue')
  },
  {
    path: '/section/:id',
    name: 'section',
    meta: { back: true, requiresAuth: true },
    component: () => import(/* webpackChunkName: "[section]" */ '../views/SectionView.vue')
  },
  {
    // The id of the section we want to view will be given as a url parameter
    // This is shown by the ':id' in the path below
    path: '/section/:id',
    name: 'section',
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "[section]" */ '../views/SectionView.vue')
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

  // Prevent student from accessing professor pages and vice-versa
  else if (to.matched.some(record => record.meta.accountType == 'professor') && !store.getters.isProfessor) {
    next(false) // Cancel the navigation
  }
  else if (to.matched.some(record => record.meta.accountType == 'student') && store.getters.isProfessor) {
    next(false)
  }

  // Continue as normal
  else {
    next()
  }
})

export default router
