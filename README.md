# 知识库平台前端 (zhishiku-app)

## 项目概述

基于 Vue 3 组合式 API 的模块化知识库学习平台前端，采用现代化技术栈构建。

## 技术栈

- **框架**: Vue 3.5 + TypeScript 5.9
- **构建工具**: Vite 7.2
- **UI 组件库**: Element Plus 2.12
- **状态管理**: Pinia 3.0
- **路由**: Vue Router 4.6
- **工具库**: VueUse、lodash-es、dayjs
- **HTTP 客户端**: Axios
- **样式预处理**: SCSS

## 项目结构

```
src/
├── api/                    # API 接口模块
│   ├── modules/
│   │   ├── user.ts         # 用户相关 API
│   │   ├── video.ts        # 视频相关 API
│   │   ├── blog.ts         # 博客相关 API
│   │   ├── admin.ts        # 后台管理 API
│   │   └── search.ts       # 搜索相关 API
│   └── index.ts            # API 统一导出
├── components/             # 公共组件
├── composables/            # 组合式函数
├── layouts/                # 布局组件
│   ├── PortalLayout.vue    # 前台展示布局
│   ├── AdminLayout.vue     # 后台管理布局
│   └── DefaultLayout.vue   # 默认布局
├── router/                 # 路由配置
├── stores/                 # Pinia 状态管理
├── styles/                 # 全局样式
├── types/                  # TypeScript 类型定义
├── utils/                  # 工具函数
│   └── request.ts          # Axios 请求封装
└── views/                  # 页面视图
    ├── auth/               # 认证页面（登录/注册）
    ├── portal/             # 前台门户页面
    ├── admin/              # 后台管理页面
    └── common/             # 公共页面（404等）
```

## 功能模块

### 1. 认证模块 (`/login`, `/register`)
- 用户登录/注册
- 验证码获取与验证
- 密码重置

### 2. 前台门户 (`/portal`)
- **首页**: 内容展示入口
- **视频教程**: 视频列表与详情播放、评论互动
- **技术博客**: 博客列表与详情阅读、评论互动
- **搜索功能**: 全站内容搜索、热门搜索词、搜索历史
- **个人中心**: 个人资料、收藏、历史、积分签到、账号设置

### 3. 后台管理 (`/admin`)
- **控制台**: 数据概览、快捷统计、趋势图表
- **用户管理**: 用户CRUD、角色权限、部门架构、用户行为分析
- **视频管理**: 视频CRUD、分类管理、内容审核
- **博客管理**: 博客CRUD、分类标签、数据分析统计
- **字典管理**: 字典类型与字典项配置
- **积分管理**: 规则配置、流水记录、积分商城、排行榜
- **系统监控**: 服务器监控、应用监控、JVM监控、缓存管理
- **审计追踪**: 审计日志、操作统计

---

## 后端 API 地址配置

### 配置位置

**主要配置文件**: `src/utils/request.ts` (第57行)

```typescript
this.instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})
```

### 配置方式

在项目根目录创建环境变量文件：

**开发环境** - `.env.development`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**生产环境** - `.env.production`:
```env
VITE_API_BASE_URL=https://your-domain.com/api
```

---

## 完整 API 端点列表

### API 模块概览

| 模块 | 前缀 | 文件位置 | 接口数量 |
|------|------|----------|----------|
| 用户 | `/user` | `src/api/modules/user.ts` | 22 个 |
| 视频 | `/video` | `src/api/modules/video.ts` | 22 个 |
| 博客 | `/blog` | `src/api/modules/blog.ts` | 24 个 |
| 搜索 | `/search` | `src/api/modules/search.ts` | 9 个 |
| 管理 | `/admin` | `src/api/modules/admin.ts` | 48 个 |

---

### 用户接口 (`/user`) - 22个

#### 认证相关
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/user/login` | 用户登录 |
| POST | `/user/register` | 用户注册 |
| POST | `/user/logout` | 登出 |
| POST | `/user/refresh-token` | 刷新Token |
| GET | `/user/captcha` | 获取图形验证码 |
| POST | `/user/captcha/verify` | 验证图形验证码 |
| POST | `/user/verify-code` | 发送验证码(邮箱/手机) |
| POST | `/user/verify` | 验证验证码 |
| POST | `/user/reset-password` | 重置密码 |

#### 用户信息
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/user/info` | 获取用户信息 |
| PUT | `/user/info` | 修改用户信息 |
| PUT | `/user/password` | 修改密码 |
| POST | `/user/avatar` | 上传头像 |
| POST | `/user/bind-email` | 绑定邮箱 |
| POST | `/user/bind-phone` | 绑定手机 |
| POST | `/user/delete-account` | 注销账号 |

#### 收藏与历史
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/user/favorites` | 获取收藏列表 |
| DELETE | `/user/favorites/:id` | 取消收藏 |
| POST | `/user/favorites/batch-remove` | 批量取消收藏 |
| GET | `/user/history` | 获取观看/阅读历史 |
| DELETE | `/user/history/:id` | 删除历史记录 |
| DELETE | `/user/history/clear` | 清空历史记录 |

#### 积分相关
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/user/points` | 获取我的积分信息 |
| GET | `/user/points/records` | 获取积分明细 |
| POST | `/user/points/check-in` | 签到 |
| GET | `/user/points/check-in/status` | 获取签到状态 |

---

### 视频接口 (`/video`) - 22个

#### 基础CRUD
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/video/list` | 获取视频列表 |
| GET | `/video/:id` | 获取视频详情 |
| POST | `/video` | 创建视频 |
| PUT | `/video/:id` | 更新视频 |
| DELETE | `/video/:id` | 删除视频 |
| POST | `/video/batch-delete` | 批量删除 |
| POST | `/video/upload` | 上传视频文件 |

#### 互动功能
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/video/:id/like` | 点赞 |
| POST | `/video/:id/unlike` | 取消点赞 |
| POST | `/video/:id/collect` | 收藏 |
| POST | `/video/:id/uncollect` | 取消收藏 |
| POST | `/video/:id/play` | 增加播放量 |
| GET | `/video/recommend` | 获取推荐视频 |
| GET | `/video/hot` | 获取热门视频 |

#### 评论功能
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/video/:videoId/comments` | 获取评论列表 |
| POST | `/video/:videoId/comments` | 发表评论 |
| DELETE | `/video/:videoId/comments/:commentId` | 删除评论 |
| POST | `/video/:videoId/comments/:commentId/like` | 评论点赞 |

#### 分类与审核
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/video/categories` | 获取分类列表 |
| POST | `/video/categories` | 创建分类 |
| PUT | `/video/categories/:id` | 更新分类 |
| DELETE | `/video/categories/:id` | 删除分类 |
| GET | `/video/audit/pending` | 获取待审核列表 |
| POST | `/video/audit/:id/approve` | 审核通过 |
| POST | `/video/audit/:id/reject` | 审核拒绝 |
| GET | `/video/:id/audit-history` | 获取审核历史 |

---

### 博客接口 (`/blog`) - 24个

#### 基础CRUD
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/blog/list` | 获取博客列表 |
| GET | `/blog/:id` | 获取博客详情 |
| POST | `/blog` | 创建博客 |
| PUT | `/blog/:id` | 更新博客 |
| DELETE | `/blog/:id` | 删除博客 |
| POST | `/blog/batch-delete` | 批量删除 |
| POST | `/blog/draft` | 保存草稿 |
| POST | `/blog/:id/publish` | 发布博客 |
| POST | `/blog/:id/offline` | 下线博客 |
| POST | `/blog/upload-image` | 上传图片 |

#### 互动功能
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/blog/:id/like` | 点赞 |
| POST | `/blog/:id/unlike` | 取消点赞 |
| POST | `/blog/:id/collect` | 收藏 |
| POST | `/blog/:id/uncollect` | 取消收藏 |
| GET | `/blog/recommend` | 获取推荐博客 |
| GET | `/blog/hot` | 获取热门博客 |

#### 评论功能
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/blog/:blogId/comments` | 获取评论列表 |
| POST | `/blog/:blogId/comments` | 发表评论 |
| DELETE | `/blog/:blogId/comments/:commentId` | 删除评论 |
| POST | `/blog/:blogId/comments/:commentId/like` | 评论点赞 |

#### 分类与标签
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/blog/categories` | 获取分类列表 |
| POST | `/blog/categories` | 创建分类 |
| PUT | `/blog/categories/:id` | 更新分类 |
| DELETE | `/blog/categories/:id` | 删除分类 |
| GET | `/blog/tags` | 获取标签列表 |
| POST | `/blog/tags` | 创建标签 |
| PUT | `/blog/tags/:id` | 更新标签 |
| DELETE | `/blog/tags/:id` | 删除标签 |

#### 统计分析
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/blog/analytics` | 获取博客统计数据 |
| GET | `/blog/analytics/trends` | 获取趋势数据 |
| GET | `/blog/ranking` | 获取排行榜 |

---

### 搜索接口 (`/search`) - 9个

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/search` | 综合搜索 |
| GET | `/search/videos` | 搜索视频 |
| GET | `/search/blogs` | 搜索博客 |
| GET | `/search/users` | 搜索用户 |
| GET | `/search/hot-keywords` | 获取热门搜索词 |
| GET | `/search/suggestions` | 获取搜索建议 |
| GET | `/search/history` | 获取搜索历史 |
| DELETE | `/search/history` | 清除搜索历史 |
| DELETE | `/search/history/:keyword` | 删除单条历史 |

---

### 管理接口 (`/admin`) - 48个

#### 控制台
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/dashboard/stats` | 获取控制台统计 |
| GET | `/admin/dashboard/quick-stats` | 获取快捷统计 |
| GET | `/admin/dashboard/trends` | 获取趋势图表 |

#### 用户管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/users` | 获取用户列表 |
| GET | `/admin/users/:id` | 获取用户详情 |
| POST | `/admin/users` | 创建用户 |
| PUT | `/admin/users/:id` | 更新用户 |
| DELETE | `/admin/users/:id` | 删除用户 |
| POST | `/admin/users/batch-delete` | 批量删除 |
| POST | `/admin/users/:id/reset-password` | 重置密码 |
| PUT | `/admin/users/:id/status` | 修改用户状态 |

#### 角色权限
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/roles` | 获取角色列表 |
| GET | `/admin/roles/:id` | 获取角色详情 |
| POST | `/admin/roles` | 创建角色 |
| PUT | `/admin/roles/:id` | 更新角色 |
| DELETE | `/admin/roles/:id` | 删除角色 |
| GET | `/admin/permissions` | 获取权限列表 |

#### 部门管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/departments/tree` | 获取部门树 |
| GET | `/admin/departments` | 获取部门列表 |
| GET | `/admin/departments/:id` | 获取部门详情 |
| POST | `/admin/departments` | 创建部门 |
| PUT | `/admin/departments/:id` | 更新部门 |
| DELETE | `/admin/departments/:id` | 删除部门 |

#### 用户行为分析
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/behavior/stats` | 获取行为统计 |
| GET | `/admin/behavior/list` | 获取行为列表 |
| GET | `/admin/behavior/trends` | 获取活跃趋势 |

#### 字典管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/dict/types` | 获取字典类型列表 |
| POST | `/admin/dict/types` | 创建字典类型 |
| PUT | `/admin/dict/types/:id` | 更新字典类型 |
| DELETE | `/admin/dict/types/:id` | 删除字典类型 |
| GET | `/admin/dict/items` | 获取字典项列表 |
| POST | `/admin/dict/items` | 创建字典项 |
| PUT | `/admin/dict/items/:id` | 更新字典项 |
| DELETE | `/admin/dict/items/:id` | 删除字典项 |

#### 积分管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/points/rules` | 获取积分规则 |
| POST | `/admin/points/rules` | 创建积分规则 |
| PUT | `/admin/points/rules/:id` | 更新积分规则 |
| DELETE | `/admin/points/rules/:id` | 删除积分规则 |
| GET | `/admin/points/records` | 获取积分流水 |
| GET | `/admin/points/ranking` | 获取积分排行榜 |
| POST | `/admin/points/adjust` | 手动调整积分 |

#### 积分商城
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/points/mall/products` | 获取商品列表 |
| POST | `/admin/points/mall/products` | 创建商品 |
| PUT | `/admin/points/mall/products/:id` | 更新商品 |
| DELETE | `/admin/points/mall/products/:id` | 删除商品 |
| GET | `/admin/points/mall/orders` | 获取兑换订单 |
| POST | `/admin/points/mall/orders/:id/process` | 处理订单 |

#### 系统监控
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/monitor/system` | 获取系统信息 |
| GET | `/admin/monitor/app` | 获取应用监控 |
| GET | `/admin/monitor/jvm` | 获取JVM信息 |
| GET | `/admin/monitor/cache` | 获取缓存统计 |
| POST | `/admin/monitor/cache/clear` | 清除缓存 |
| GET | `/admin/monitor/online-users` | 获取在线用户 |
| POST | `/admin/monitor/force-logout` | 强制下线用户 |

#### 日志管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/logs/operation` | 获取操作日志 |
| GET | `/admin/logs/login` | 获取登录日志 |

#### 审计追踪
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/admin/audit/logs` | 获取审计日志 |
| GET | `/admin/audit/stats` | 获取审计统计 |

---

## 快速开始

```bash
# 安装依赖
npm install

# 配置后端地址 - 创建 .env.development 文件
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env.development

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 响应数据格式约定

后端接口需返回统一格式：

```typescript
{
  code: number,     // 0 表示成功，其他为错误码
  message: string,  // 提示信息
  data: T           // 业务数据
}
```

### 业务错误码

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 10001 | Token 过期 |
| 10002 | Token 无效 |
| 10003 | 权限不足 |

---

## Token 认证

前端会在请求头中携带 Token：
```
Authorization: Bearer <token>
```

后端需在登录接口返回 token，并在需要认证的接口中验证该 token。

---

## 分页参数约定

分页请求参数：
```typescript
{
  pageNum: number,   // 页码，从1开始
  pageSize: number   // 每页条数
}
```

分页响应数据：
```typescript
{
  list: T[],         // 数据列表
  total: number,     // 总条数
  pageNum: number,   // 当前页码
  pageSize: number,  // 每页条数
  pages: number      // 总页数
}
```
