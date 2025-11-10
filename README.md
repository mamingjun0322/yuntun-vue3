# 云吞点餐系统 - 管理后台

基于 Vue 3 + TypeScript + Element Plus 开发的现代化管理后台系统。

## ✨ 特性

- 🎨 **现代化设计** - 参考苹果设计风格，简洁优雅
- 📊 **数据可视化** - 集成 ECharts，提供丰富的图表展示
- 🔐 **权限认证** - 完善的登录认证和路由守卫
- 📱 **响应式布局** - 适配各种屏幕尺寸
- 🚀 **高性能** - Vite 构建，快速的开发体验
- 💾 **状态持久化** - Pinia + 持久化插件

## 🛠️ 技术栈

- **前端框架**: Vue 3.5+
- **类型支持**: TypeScript 5.9+
- **UI框架**: Element Plus 2.8+
- **图表库**: ECharts 5.5+
- **状态管理**: Pinia 3.0+
- **路由管理**: Vue Router 4.6+
- **HTTP客户端**: Axios 1.7+
- **构建工具**: Vite 7.1+

## 📦 功能模块

### 1. 数据看板
- 📈 今日数据统计（订单量、营业额、待处理订单）
- 📊 订单趋势图表
- 🥧 订单类型分布
- 📝 最近订单列表

### 2. 商品管理
- ➕ 添加/编辑商品
- 🗑️ 删除商品
- 🔄 上下架管理
- 🔍 搜索和筛选
- 📄 分页展示

### 3. 订单管理
- 📋 订单列表（堂食/外卖）
- 🔄 订单状态更新
- 👀 订单详情查看
- 🔍 订单搜索和筛选

### 4. 用户管理
- 👥 用户列表
- 📊 用户等级管理
- 💰 积分查看

### 5. 系统设置
- ⚙️ 基本设置（店铺信息）
- 🚚 配送设置（配送费、起送金额）
- ℹ️ 系统信息

## 🚀 快速开始

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### 1. 安装依赖

```sh
npm install
```

### 2. 配置环境变量

项目已包含开发环境配置文件 `.env.development`，默认后端地址为 `http://localhost:8080`。
如需修改，请编辑该文件。

### 3. 启动开发服务器

```sh
npm run dev
```

访问 `http://localhost:5173` 即可看到登录页面。

**默认管理员账号**：
- 用户名：`admin`
- 密码：`admin123`

### 4. 构建生产版本

```sh
npm run build
```

### 5. 代码检查

```sh
npm run lint
```

## 📁 项目结构

```
src/
├── api/              # API接口
│   ├── request.ts    # Axios封装
│   ├── auth.ts       # 认证接口
│   ├── goods.ts      # 商品接口
│   ├── order.ts      # 订单接口
│   └── user.ts       # 用户接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── layout/           # 布局组件
│   └── index.vue     # 主布局
├── router/           # 路由配置
│   └── index.ts      # 路由定义
├── stores/           # 状态管理
│   ├── app.ts        # 应用状态
│   └── user.ts       # 用户状态
├── utils/            # 工具函数
│   ├── format.ts     # 格式化工具
│   └── storage.ts    # 存储工具
├── views/            # 页面视图
│   ├── Login.vue     # 登录页
│   ├── Dashboard.vue # 数据看板
│   ├── Goods.vue     # 商品管理
│   ├── Order.vue     # 订单管理
│   ├── User.vue      # 用户管理
│   └── Settings.vue  # 系统设置
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 🔌 后端对接

本项目需要配合后端 `yuntun-java` 使用。

### 后端接口地址

- **管理端登录**: `POST /admin/auth/login`
- **获取管理员信息**: `GET /admin/auth/info`
- **商品管理**: `/admin/goods/*`
- **订单管理**: `/admin/order/*`
- **用户管理**: `/admin/user/*`

### 启动后端

```sh
cd ../yuntun-java
mvn spring-boot:run
```

确保后端服务运行在 `http://localhost:8080`。

## 🎨 UI设计说明

界面设计参考苹果设计风格，特点：

- **简洁优雅** - 去除多余装饰，突出内容
- **扁平化** - 现代感的视觉效果
- **渐变色** - 紫色系渐变配色
- **圆角设计** - 柔和的视觉体验
- **阴影效果** - 层次分明的卡片设计

## 📝 开发说明

### API请求

所有API请求都通过 `src/api/request.ts` 统一封装，自动处理：
- Token认证
- 错误拦截
- 响应格式化

### 状态管理

使用Pinia进行状态管理，并通过 `pinia-plugin-persistedstate` 实现持久化。

### 路由守卫

在 `src/router/index.ts` 中配置了路由守卫，未登录用户会自动跳转到登录页。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License
