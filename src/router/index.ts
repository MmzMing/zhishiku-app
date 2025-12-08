/**
 * 路由配置入口
 * 三大门户：登录/注册、前台展示、后台管理
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuard } from './guard'

// ==================== 门户1：认证模块路由 ====================
const authRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/portal'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  }
]

// ==================== 门户2：前台展示路由 ====================
const portalRoutes: RouteRecordRaw[] = [
  {
    path: '/portal',
    name: 'Portal',
    component: () => import('@/layouts/PortalLayout.vue'),
    redirect: '/portal/home',
    meta: {
      title: '知识库平台',
      requiresAuth: false
    },
    children: [
      {
        path: 'home',
        name: 'PortalHome',
        component: () => import('@/views/portal/home/index.vue'),
        meta: {
          title: '首页',
          requiresAuth: false
        }
      },
      {
        path: 'videos',
        name: 'PortalVideos',
        component: () => import('@/views/portal/videos/index.vue'),
        meta: {
          title: '视频教程',
          requiresAuth: false
        }
      },
      {
        path: 'videos/:id',
        name: 'PortalVideoDetail',
        component: () => import('@/views/portal/videos/detail.vue'),
        meta: {
          title: '视频详情',
          requiresAuth: false
        }
      },
      {
        path: 'blogs',
        name: 'PortalBlogs',
        component: () => import('@/views/portal/blogs/index.vue'),
        meta: {
          title: '技术博客',
          requiresAuth: false
        }
      },
      {
        path: 'blogs/:id',
        name: 'PortalBlogDetail',
        component: () => import('@/views/portal/blogs/detail.vue'),
        meta: {
          title: '博客详情',
          requiresAuth: false
        }
      },
      {
        path: 'user',
        name: 'UserCenter',
        component: () => import('@/views/portal/user/index.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true
        },
        children: [
          {
            path: 'profile',
            name: 'UserProfile',
            component: () => import('@/views/portal/user/profile.vue'),
            meta: {
              title: '个人资料',
              requiresAuth: true
            }
          },
          {
            path: 'favorites',
            name: 'UserFavorites',
            component: () => import('@/views/portal/user/favorites.vue'),
            meta: {
              title: '我的收藏',
              requiresAuth: true
            }
          },
          {
            path: 'history',
            name: 'UserHistory',
            component: () => import('@/views/portal/user/history.vue'),
            meta: {
              title: '观看历史',
              requiresAuth: true
            }
          },
          {
            path: 'points',
            name: 'UserPoints',
            component: () => import('@/views/portal/user/points.vue'),
            meta: {
              title: '我的积分',
              requiresAuth: true
            }
          },
          {
            path: 'settings',
            name: 'UserSettings',
            component: () => import('@/views/portal/user/settings.vue'),
            meta: {
              title: '账号设置',
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: 'search',
        name: 'PortalSearch',
        component: () => import('@/views/portal/search/index.vue'),
        meta: {
          title: '搜索结果',
          requiresAuth: false
        }
      }
    ]
  }
]

// ==================== 门户3：后台管理路由 ====================
const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: {
      title: '管理后台',
      icon: 'Setting',
      requiresAuth: true,
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/index.vue'),
        meta: {
          title: '控制台',
          icon: 'Monitor',
          requiresAuth: true
        }
      },
      // 人员管理模块
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/users/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          requiresAuth: true,
          permissions: ['user:list']
        }
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/views/admin/users/detail.vue'),
        meta: {
          title: '用户详情',
          hidden: true,
          requiresAuth: true
        }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/admin/roles/index.vue'),
        meta: {
          title: '角色权限',
          icon: 'Key',
          requiresAuth: true,
          permissions: ['role:list']
        }
      },
      {
        path: 'departments',
        name: 'DepartmentManagement',
        component: () => import('@/views/admin/departments/index.vue'),
        meta: {
          title: '部门架构',
          icon: 'OfficeBuilding',
          requiresAuth: true,
          permissions: ['dept:list']
        }
      },
      {
        path: 'behavior',
        name: 'UserBehavior',
        component: () => import('@/views/admin/behavior/index.vue'),
        meta: {
          title: '用户行为',
          icon: 'DataAnalysis',
          requiresAuth: true,
          permissions: ['behavior:view']
        }
      },
      {
        path: 'videos',
        name: 'VideoManagement',
        component: () => import('@/views/admin/videos/index.vue'),
        meta: {
          title: '视频管理',
          icon: 'VideoPlay',
          requiresAuth: true,
          permissions: ['video:list']
        }
      },
      {
        path: 'videos/create',
        name: 'VideoCreate',
        component: () => import('@/views/admin/videos/edit.vue'),
        meta: {
          title: '发布视频',
          hidden: true,
          requiresAuth: true
        }
      },
      {
        path: 'videos/edit/:id',
        name: 'VideoEdit',
        component: () => import('@/views/admin/videos/edit.vue'),
        meta: {
          title: '编辑视频',
          hidden: true,
          requiresAuth: true
        }
      },
      {
        path: 'videos/category',
        name: 'VideoCategory',
        component: () => import('@/views/admin/videos/category.vue'),
        meta: {
          title: '视频分类',
          hidden: true,
          requiresAuth: true,
          permissions: ['video:category']
        }
      },
      {
        path: 'videos/audit',
        name: 'VideoAudit',
        component: () => import('@/views/admin/videos/audit.vue'),
        meta: {
          title: '视频审核',
          hidden: true,
          requiresAuth: true,
          permissions: ['video:audit']
        }
      },
      {
        path: 'blogs',
        name: 'BlogManagement',
        component: () => import('@/views/admin/blogs/index.vue'),
        meta: {
          title: '博客管理',
          icon: 'Document',
          requiresAuth: true,
          permissions: ['blog:list']
        }
      },
      {
        path: 'blogs/create',
        name: 'BlogCreate',
        component: () => import('@/views/admin/blogs/edit.vue'),
        meta: {
          title: '写博客',
          hidden: true,
          requiresAuth: true
        }
      },
      {
        path: 'blogs/edit/:id',
        name: 'BlogEdit',
        component: () => import('@/views/admin/blogs/edit.vue'),
        meta: {
          title: '编辑博客',
          hidden: true,
          requiresAuth: true
        }
      },
      {
        path: 'blogs/category',
        name: 'BlogCategory',
        component: () => import('@/views/admin/blogs/category.vue'),
        meta: {
          title: '分类标签',
          hidden: true,
          requiresAuth: true,
          permissions: ['blog:category']
        }
      },
      {
        path: 'blogs/analytics',
        name: 'BlogAnalytics',
        component: () => import('@/views/admin/blogs/analytics.vue'),
        meta: {
          title: '统计分析',
          hidden: true,
          requiresAuth: true,
          permissions: ['blog:analytics']
        }
      },
      {
        path: 'dict',
        name: 'DictManagement',
        component: () => import('@/views/admin/dict/index.vue'),
        meta: {
          title: '字典管理',
          icon: 'Collection',
          requiresAuth: true,
          permissions: ['dict:list']
        }
      },
      {
        path: 'points',
        name: 'PointsRules',
        component: () => import('@/views/admin/points/index.vue'),
        meta: {
          title: '积分规则',
          icon: 'Medal',
          requiresAuth: true,
          permissions: ['points:list']
        }
      },
      {
        path: 'points/records',
        name: 'PointsRecords',
        component: () => import('@/views/admin/points/records.vue'),
        meta: {
          title: '积分流水',
          hidden: true,
          requiresAuth: true,
          permissions: ['points:records']
        }
      },
      {
        path: 'points/mall',
        name: 'PointsMall',
        component: () => import('@/views/admin/points/mall.vue'),
        meta: {
          title: '积分商城',
          hidden: true,
          requiresAuth: true,
          permissions: ['points:mall']
        }
      },
      {
        path: 'points/rank',
        name: 'PointsRank',
        component: () => import('@/views/admin/points/rank.vue'),
        meta: {
          title: '排行榜',
          hidden: true,
          requiresAuth: true,
          permissions: ['points:rank']
        }
      },
      {
        path: 'monitor',
        name: 'ServerMonitor',
        component: () => import('@/views/admin/monitor/index.vue'),
        meta: {
          title: '服务器监控',
          icon: 'TrendCharts',
          requiresAuth: true,
          permissions: ['monitor:view']
        }
      },
      {
        path: 'monitor/app',
        name: 'AppMonitor',
        component: () => import('@/views/admin/monitor/app.vue'),
        meta: {
          title: '应用监控',
          hidden: true,
          requiresAuth: true,
          permissions: ['monitor:app']
        }
      },
      {
        path: 'monitor/logs',
        name: 'LogsMonitor',
        component: () => import('@/views/admin/monitor/logs.vue'),
        meta: {
          title: '日志管理',
          hidden: true,
          requiresAuth: true,
          permissions: ['monitor:logs']
        }
      },
      {
        path: 'monitor/audit',
        name: 'AuditMonitor',
        component: () => import('@/views/admin/monitor/audit.vue'),
        meta: {
          title: '审计追踪',
          hidden: true,
          requiresAuth: true,
          permissions: ['monitor:audit']
        }
      }
    ]
  }
]

// ==================== 公共路由 ====================
const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/common/404.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  }
]

// 404 重定向（必须放在最后）
const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  redirect: '/404'
}

// 合并所有路由
const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...portalRoutes,
  ...adminRoutes,
  ...commonRoutes,
  notFoundRoute
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 设置路由守卫
setupRouterGuard(router)

export default router
