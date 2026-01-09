import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/login/callback',
    name: 'LoginCallback',
    component: () => import('@/views/login/callback/index.vue'),
    meta: { title: '登录回调', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      // 数据中心
      {
        path: '',
        meta: { title: '数据中心', icon: 'DataAnalysis' },
        children: [
          {
            path: 'dashboard',
            name: 'Dashboard',
            component: () => import('@/views/dashboard/index.vue'),
            meta: { title: '数据看板', icon: 'Monitor' }
          },
          {
            path: 'statistics',
            name: 'Statistics',
            component: () => import('@/views/statistics/index.vue'),
            meta: { title: '统计分析', icon: 'TrendCharts' }
          }
        ]
      },
      // 安全管理
      {
        path: '',
        meta: { title: '安全管理', icon: 'Warning' },
        children: [
          {
            path: 'risk',
            name: 'Risk',
            component: () => import('@/views/risk/index.vue'),
            meta: { title: '风险管理', icon: 'Warning' }
          },
          {
            path: 'danger',
            name: 'Danger',
            component: () => import('@/views/danger/index.vue'),
            meta: { title: '隐患管理', icon: 'Document' }
          },
          {
            path: 'incident',
            name: 'Incident',
            component: () => import('@/views/incident/index.vue'),
            meta: { title: '事故管理', icon: 'CircleClose' }
          },
          {
            path: 'warning',
            name: 'Warning',
            component: () => import('@/views/warning/index.vue'),
            meta: { title: '风险预警', icon: 'Bell' }
          },
          {
            path: 'supervision',
            name: 'Supervision',
            component: () => import('@/views/supervision/index.vue'),
            meta: { title: '隐患督办', icon: 'Files' }
          }
        ]
      },
      // 日常运营
      {
        path: '',
        meta: { title: '日常运营', icon: 'Operation' },
        children: [
          {
            path: 'inspection',
            name: 'Inspection',
            component: () => import('@/views/inspection/index.vue'),
            meta: { title: '巡检管理', icon: 'Checked' }
          },
          {
            path: 'emergency',
            name: 'Emergency',
            component: () => import('@/views/emergency/index.vue'),
            meta: { title: '应急管理', icon: 'Lightning' }
          },
          {
            path: 'certificates',
            name: 'Certificates',
            component: () => import('@/views/certificates/index.vue'),
            meta: { title: '证书管理', icon: 'Medal' }
          },
          {
            path: 'notifications',
            name: 'Notifications',
            component: () => import('@/views/notifications/index.vue'),
            meta: { title: '消息通知', icon: 'Bell' }
          }
        ]
      },
      // 用户中心
      {
        path: '',
        meta: { title: '用户中心', icon: 'User' },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/users/index.vue'),
            meta: { title: '用户管理', icon: 'UserFilled' }
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/views/profile/index.vue'),
            meta: { title: '个人中心', icon: 'Avatar' }
          }
        ]
      },
      // 帮助与支持
      {
        path: 'help',
        name: 'Help',
        component: () => import('@/views/help/index.vue'),
        meta: { title: '帮助与支持', icon: 'Help' }
      },
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '铁路安全管理系统'}`

  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router