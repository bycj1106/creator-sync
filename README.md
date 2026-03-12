# CreatorSync - 创作者内容管理平台

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-blue" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-Database-orange" alt="SQLite">
  <img src="https://img.shields.io/badge/WebSocket-Real--time-blueviolet" alt="WebSocket">
</p>

CreatorSync 是一款专为内容创作者打造的内容管理工具，帮助创作者规划视频内容、管理待办事项、记录创作灵感，支持多用户数据同步。

---

## 功能特性

### 📹 视频规划
- 日历视图展示视频发布时间线
- 支持设置视频标题、开始/结束日期
- 制作进度管理（创意→脚本→拍摄→剪辑→发布）
- 多平台发布支持（YouTube、TikTok、Bilibili）

### ✅ 待办清单
- 任务分类管理（视频相关、日常运营）
- 进度百分比展示
- 快速标记完成状态

### 💡 热点灵感
- 快速记录创作灵感
- 标签分类管理
- 一键转为视频规划

### 👥 多用户支持
- 用户注册/登录
- 实时数据同步
- WebSocket 实时推送更新

### 📱 APP 支持
- 支持打包为 Android/iOS APP
- 跨平台数据同步

---

## 技术栈

### 前端
- **React 19** - UI 框架
- **React Router** - 路由管理
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Socket.io Client** - 实时通信

### 后端
- **Node.js** - 运行时
- **Express** - Web 框架
- **SQLite** - 轻量级数据库
- **Socket.io** - WebSocket 服务
- **JWT** - 用户认证

### 开发工具
- **ESLint** - 代码检查
- **Vitest** - 单元测试
- **Capacitor** - 跨平台打包

---

## 快速上手

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/bycj1106/creator-sync.git
cd creator-sync

# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 环境配置

```bash
# 复制环境变量配置文件
cp server/.env.example server/.env
```

编辑 `server/.env` 文件，配置以下必需项：

| 变量 | 说明 | 示例 |
|------|------|------|
| `JWT_SECRET` | JWT 密钥（必需） | 使用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成 |
| `PORT` | 服务端口（可选，默认 3001） | `3001` |
| `CORS_ORIGIN` | CORS 允许的来源（可选） | `*` 或具体域名 |

### 启动开发服务器

```bash
# 启动后端（终端1）
cd server
npm start

# 启动前端（终端2）
npm run dev
```

访问 http://localhost:5173

---

## 项目结构

```
creator-sync/
├── src/                    # 前端源代码
│   ├── components/         # 公共组件
│   │   ├── Layout.jsx      # 布局组件
│   │   ├── Modal.jsx       # 弹窗组件
│   │   ├── TabBar.jsx      # 标签栏
│   │   └── UI.jsx          # UI 组件库
│   ├── contexts/           # React Context
│   │   └── AuthContext.jsx # 认证上下文
│   ├── hooks/              # 自定义 Hooks
│   │   └── useLocalStorage.js
│   ├── pages/              # 页面组件
│   │   ├── Planning.jsx     # 视频规划
│   │   ├── Tasks.jsx       # 待办清单
│   │   ├── Inspiration.jsx  # 热点灵感
│   │   ├── Profile.jsx     # 个人中心
│   │   └── Login.jsx       # 登录/注册
│   ├── services/           # API 服务
│   │   ├── api.js          # HTTP 请求
│   │   └── socket.js       # WebSocket
│   ├── test/               # 单元测试
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   │   └── date.js
│   ├── App.jsx             # 根组件
│   └── main.jsx            # 入口文件
│
├── server/                 # 后端服务
│   └── src/
│       ├── middleware/      # 中间件
│       │   └── auth.js     # JWT 认证
│       ├── models/         # 数据模型
│       │   └── db.js       # SQLite 配置
│       ├── routes/         # 路由
│       │   ├── auth.js     # 认证接口
│       │   └── data.js     # 数据接口
│       └── index.js        # 服务入口
│
├── android/                # Android 原生项目
├── dist/                  # 生产构建产物
├── capacitor.config.json   # Capacitor 配置
├── vite.config.js          # Vite 配置
└── package.json            # 项目配置
```

---

## 操作手册

### 1. 用户注册与登录

1. 打开应用，进入登录页面
2. 点击「没有账号？点击注册」
3. 输入用户名和密码，点击「注册」
4. 注册成功后自动登录

### 2. 视频规划

**创建规划：**
1. 进入「视频规划」页面
2. 点击右下角「+」按钮
3. 填写视频标题、开始/结束日期
4. 选择发布平台
5. 点击「保存」

**管理进度：**
- 点击进度步骤按钮切换状态
- 点击规划卡片「编辑」修改内容
- 点击「删除」移除规划

### 3. 待办清单

**添加任务：**
1. 进入「待办清单」页面
2. 点击右下角「+」按钮
3. 输入任务内容
4. 选择分类（视频相关/日常运营）
5. 点击「保存」

**完成任务：**
- 点击任务左侧圆形按钮标记完成
- 已完成任务显示删除线

### 4. 热点灵感

**记录灵感：**
1. 进入「热点灵感」页面
2. 点击右下角「+」按钮
3. 输入灵感内容
4. 添加标签（用逗号分隔）
5. 点击「保存」

**使用灵感：**
- 点击「转为规划」将灵感转化为视频规划
- 点击星标按钮置顶灵感
- 点击「删除」移除灵感

---

## 部署指南

### 生产环境配置

编辑 `server/.env` 文件，配置以下项：

| 变量 | 说明 | 示例 |
|------|------|------|
| `JWT_SECRET` | JWT 密钥（必需） | 使用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成 |
| `PORT` | 服务端口 | `3001` |
| `CORS_ORIGIN` | CORS 允许的来源（建议填入实际域名） | `https://your-domain.com` |

### 后端部署

```bash
# 进入后端目录
cd server

# 使用 PM2 运行
pm2 start src/index.js --name creator-sync

# 查看状态
pm2 status

# 查看日志
pm2 logs creator-sync
```

### 前端部署

```bash
# 构建生产版本
npm run build

# 预览
npm run preview
```

### 打包 APP

详见 [部署指南.md](./部署指南.md)

---

## API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |

### 数据接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/data | 获取用户所有数据 |
| POST | /api/data/plans | 创建视频规划 |
| PUT | /api/data/plans/:id | 更新视频规划 |
| DELETE | /api/data/plans/:id | 删除视频规划 |
| POST | /api/data/tasks | 创建待办任务 |
| PUT | /api/data/tasks/:id | 更新待办任务 |
| DELETE | /api/data/tasks/:id | 删除待办任务 |
| POST | /api/data/inspirations | 创建灵感 |
| PUT | /api/data/inspirations/:id | 更新灵感 |
| DELETE | /api/data/inspirations/:id | 删除灵感 |

---

## 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规则
- 使用有意义的变量命名

### 运行测试

```bash
# 运行测试
npm run test

# 运行测试（UI 模式）
npm run test:ui

# 运行测试并生成覆盖率
npm run test:run
```

### 代码检查

```bash
npm run lint
```

---

## 常见问题

### Q: 如何修改后端端口？
编辑 `server/.env` 中的 `PORT` 值。

### Q: 如何修改数据库位置？
编辑 `server/src/models/db.js` 中的 `dbPath`。

### Q: APP 无法连接服务器？
1. 检查服务器防火墙是否开放端口
2. 检查前端 `.env` 中的 API 地址是否正确

### Q: 如何备份数据？
复制 `server/data.db` 文件即可。

---

## 贡献指南

欢迎提交 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

---

## 许可证

MIT License

---

<p align="center">Made with ❤️ by CreatorSync</p>
