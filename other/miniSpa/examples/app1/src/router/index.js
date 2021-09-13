import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)


export const constantRoutes = [
  {
    path: '/',
    component: () => import('@/App')
  }
]


const createRouter = () => new Router({
  mode: 'history', 
  routes: constantRoutes
})

const router = createRouter()


export default router
