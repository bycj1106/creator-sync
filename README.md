# CreatorSync - 创作者内容管理平台

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-blue" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-Database-orange" alt="SQLite">
  <img src="https://img.shields.io/badge/WebSocket-Real--time-blueviolet" alt="WebSocket">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

CreatorSync 是一款专为内容创作者打造的内容管理工具，帮助创作者规划视频内容、管理待办事项、记录创作灵感，支持多用户数据同步。

---

## ✨ 为什么选择 CreatorSync？

- 🖥️ **简洁易用** - 界面清爽，上手即用，无需复杂配置
- 📱 **多端支持** - Web 端适配移动端和桌面端，数据实时同步
- 🔒 **数据自主** - 可私有化部署，数据完全掌控
- 🚀 **快速部署** - 5 分钟内完成搭建
- 💰 **完全免费** - 开源免费，无任何付费功能

---

## 📑 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速上手](#快速上手)
- [项目结构](#项目结构)
- [操作手册](#操作手册)
- [部署指南](#部署指南)
- [API 接口](#api-接口)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

---



## 功能特性

### 📹 视频规划
- 📅 日历视图展示视频发布时间线
- ✏️ 支持设置视频标题、开始/结束日期
- 📊 制作进度管理（创意→脚本→拍摄→剪辑→发布）
- 🌐 多平台发布支持（YouTube、TikTok、Bilibili）

### ✅ 待办清单
- 📂 任务分类管理（视频相关、日常运营）
- 📈 进度百分比展示
- ✔️ 快速标记完成状态

### 💡 热点灵感
- ✨ 快速记录创作灵感
- 🏷️ 标签分类管理
- 🔄 一键转为视频规划

### 👥 多用户支持
- 🔐 用户注册/登录
- 🔁 实时数据同步
- ⚡ WebSocket 实时推送更新

---

## 技术栈

### 前端
| 技术 | 说明 |
|------|------|
| [React 19](https://react.dev/) | UI 框架 |
| [React Router](https://reactrouter.com/) | 路由管理 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [Tailwind CSS](https://tailwindcss.com/) | 样式框架 |
| [Socket.io Client](https://socket.io/) | 实时通信 |

### 后端
| 技术 | 说明 |
|------|------|
| [Node.js](https://nodejs.org/) | 运行时 |
| [Express](https://expressjs.com/) | Web 框架 |
| [SQLite](https://www.sqlite.org/) | 轻量级数据库 |
| [Socket.io](https://socket.io/) | WebSocket 服务 |
| [JWT](https://jwt.io/) | 用户认证 |

### 开发工具
| 技术 | 说明 |
|------|------|
| [ESLint](https://eslint.org/) | 代码检查 |
| [Vitest](https://vitest.dev/) | 单元测试 |

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

编辑 `server/.env` 文件，配置必要参数。详见 [部署指南](#部署指南)。

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
├── src/                         # 前端源代码
│   ├── components/              # 公共组件
│   │   └── Layout.jsx           # 布局组件
│   ├── contexts/                # React Context
│   │   └── AuthContext.jsx      # 认证上下文
│   ├── hooks/                   # 自定义 Hooks
│   │   └── useLocalStorage.js   # 本地存储 Hook
│   ├── pages/                   # 页面组件
│   │   ├── Planning.jsx         # 视频规划
│   │   ├── Tasks.jsx            # 待办清单
│   │   ├── Inspiration.jsx      # 热点灵感
│   │   ├── Profile.jsx          # 个人中心
│   │   └── Login.jsx            # 登录/注册
│   ├── services/                # API 服务
│   │   ├── api.js               # HTTP 请求
│   │   ├── dataState.js         # 前端数据变更规则
│   │   ├── localStorage.js      # 本地存储服务
│   │   ├── session.js           # 会话管理
│   │   └── socket.js            # WebSocket
│   ├── test/                    # 单元测试
│   ├── utils/                   # 工具函数
│   │   └── date.js              # 日期工具
│   ├── App.jsx                  # 根组件
│   └── main.jsx                 # 入口文件
│
├── server/                      # 后端服务
│   └── src/
│       ├── middleware/          # 中间件
│       │   └── auth.js          # JWT 认证
│       ├── models/              # 数据模型
│       │   └── db.js            # SQLite 配置
│       ├── routes/              # 路由
│       │   ├── auth.js          # 认证接口
│       │   ├── data.js          # 数据接口
│       │   └── data-helpers.js  # 数据验证与转换
│       └── index.js             # 服务入口
│
├── dist/                        # 生产构建产物
├── capacitor.config.json       # Capacitor 配置
├── vite.config.js              # Vite 配置
└── package.json                 # 项目配置
```

### 目录说明

| 目录 | 说明 |
|------|------|
| `src/components` | 可复用的布局组件 |
| `src/contexts` | React 上下文，用于全局状态管理 |
| `src/hooks` | 自定义 Hooks，封装复用逻辑 |
| `src/pages` | 页面级组件，对应路由页面 |
| `src/services` | API 服务层，处理网络请求、本地存储、数据状态管理 |
| `src/utils` | 工具函数库 |
| `server/src/middleware` | Express 中间件 |
| `server/src/models` | 数据模型和数据库操作 |
| `server/src/routes` | API 路由定义 |

---

## 操作手册

### 1. 用户注册与登录

CreatorSync 支持两种账号类型：

#### 本地账号
- 无需网络，数据存储在浏览器本地
- 适合单机使用或隐私要求较高的用户
- 点击「或使用本地账号登录」→「直接登录」即可使用

#### 云端账号
- 数据存储在服务器，支持多设备同步
- 需要邀请码注册（请参考邀请码管理章节）
- 点击「没有账号？点击注册」

**注册步骤：**
1. 打开应用，进入登录页面
2. 点击「没有账号？点击注册」
3. 输入用户名、密码和邀请码
4. 点击「注册」，注册成功后自动登录

> 💡 **提示**：如果没有邀请码，请通过数据库方式创建，详见 [邀请码管理](#邀请码管理)。

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

### 快速部署（5分钟上手）

```bash
# 1. 克隆项目
git clone https://github.com/bycj1106/creator-sync.git
cd creator-sync

# 2. 安装依赖
npm install
cd server && npm install && cd ..

# 3. 配置环境变量
cp server/.env.example server/.env
# 编辑 .env，设置 JWT_SECRET（必需）

# 4. 启动服务
# 终端1：后端
cd server && npm start

# 终端2：前端
npm run dev
```

访问 http://localhost:5173 即可使用！

### 邀请码管理

云端用户注册需要邀请码。由于暂未提供管理后台，需要通过数据库直接创建邀请码：

```bash
cd server
node -e "
import Database from 'better-sqlite3';
const db = new Database('./data.db');
const result = db.prepare('INSERT INTO invitation_codes (code, maxUses, expiresAt) VALUES (?, ?, ?)').run('YOURCODE', 100, '2026-12-31');
console.log('Created invite code, ID:', result.lastInsertRowid);
db.close();
"
```

参数说明：
| 参数 | 说明 | 示例 |
|------|------|------|
| `YOURCODE` | 邀请码（自定义） | `VIP2026` |
| `100` | 最大使用次数 | `10` |
| `2026-12-31` | 过期日期 | `2027-12-31` |

### 生产环境配置

编辑 `server/.env` 文件，配置以下项：

| 变量 | 说明 | 示例 |
|------|------|------|
| `JWT_SECRET` | JWT 密钥（**必需**） | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | 服务端口 | `3001` |
| `CORS_ORIGIN` | CORS 允许的来源（生产环境建议填入实际域名） | `https://your-domain.com` |

### 后端部署（推荐 PM2）

PM2 是 Node.js 进程管理器，支持进程守护、自动重启、负载均衡等功能。

```bash
# 全局安装 PM2（如果未安装）
npm install -g pm2

# 进入后端目录
cd server

# 启动服务
pm2 start src/index.js --name creator-sync

# 查看状态
pm2 status

# 查看日志
pm2 logs creator-sync

# 重启服务
pm2 restart creator-sync

# 停止服务
pm2 stop creator-sync

# 设置开机自启
pm2 startup
pm2 save
```

### 前端部署

#### 方式一：静态服务器托管

```bash
# 1. 构建生产版本
npm run build

# 2. 将 dist/ 目录上传到服务器的 Web 目录
scp -r dist/* user@your-server:/var/www/creator-sync/
```

#### 方式二：完整云服务器部署（推荐）

适合已使用 PM2 部署后端的场景：

**Step 1: 构建前端**
```bash
npm run build
```

**Step 2: 上传到服务器**
```bash
scp -r dist/* user@your-server:/var/www/creator-sync/
```

**Step 3: 配置 Nginx**
```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/conf.d/creator-sync.conf
```

写入以下内容：
```nginx
server {
    listen 80;
    server_name _;

    root /var/www/creator-sync;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**Step 4: 重启 Nginx**
```bash
sudo nginx -t && sudo nginx -s reload
```

**Step 5: 开放防火墙端口（如需要）**
```bash
# 云服务器需在控制台安全组开放 80 端口
```

**后续更新前端：**
```bash
# 重新构建后，上传即可
npm run build && scp -r dist/* user@your-server:/var/www/creator-sync/
```

#### HTTPS 配置（可选）

使用 Let's Encrypt 免费证书：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Nginx 配置示例

如果您使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/creator-sync/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## API 接口

### 认证接口

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| POST | /api/auth/register | 用户注册（需邀请码） | `{ username, password, invitationCode }` |
| POST | /api/auth/login | 用户登录 | `{ username, password }` |

### 数据接口

#### 视频规划

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | /api/data/plans | 获取所有规划 | - |
| POST | /api/data/plans | 创建规划 | `{ title, startDate, endDate, platforms, status }` |
| PUT | /api/data/plans/:id | 更新规划 | `{ title, startDate, endDate, platforms, status }` |
| DELETE | /api/data/plans/:id | 删除规划 | - |

#### 待办任务

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | /api/data/tasks | 获取所有任务 | - |
| POST | /api/data/tasks | 创建任务 | `{ content, category, progress }` |
| PUT | /api/data/tasks/:id | 更新任务 | `{ content, category, progress, completed }` |
| DELETE | /api/data/tasks/:id | 删除任务 | - |

#### 灵感

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| GET | /api/data/inspirations | 获取所有灵感 | - |
| POST | /api/data/inspirations | 创建灵感 | `{ content, tags }` |
| PUT | /api/data/inspirations/:id | 更新灵感 | `{ content, tags, pinned }` |
| DELETE | /api/data/inspirations/:id | 删除灵感 | - |

> ⚠️ 所有数据接口需要在请求头中携带 JWT Token：`Authorization: Bearer <token>`

---

## 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规则
- 使用有意义的变量命名
- 推荐使用函数组件和 Hooks

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
# 运行 ESLint
npm run lint

# 修复 ESLint 自动修复的问题
npm run lint -- --fix
```

### 添加新的页面

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/App.jsx` 中添加路由配置
3. 如需认证保护，在路由中添加认证检查

### 添加新的 API 接口

1. 在 `server/src/routes/` 目录下创建或编辑路由文件
2. 在 `server/src/index.js` 中注册路由
3. 如需认证保护，添加 auth 中间件

---

## 常见问题

### Q: 如何修改后端端口？
编辑 `server/.env` 中的 `PORT` 值，例如：`PORT=8080`

### Q: 如何修改数据库位置？
编辑 `server/src/models/db.js` 中的 `dbPath` 变量。

### Q: 本地账号和云端账号有什么区别？

| 特性 | 本地账号 | 云端账号 |
|------|----------|----------|
| 数据存储 | 浏览器 localStorage | 服务器 SQLite |
| 多设备同步 | ❌ 不支持 | ✅ 支持 |
| 邀请码 | 不需要 | 需要 |
| 数据导出/导入 | ✅ 支持 | ❌ 暂不支持 |

### Q: 如何备份云端账号数据？
复制 `server/data.db` 文件即可。建议定期备份。

### Q: APP 无法连接服务器？
1. 检查服务器防火墙是否开放端口
2. 检查前端 `.env` 中的 API 地址是否正确
3. 确认 CORS_ORIGIN 配置正确

### Q: JWT 过期怎么办？
用户需要重新登录。可以在客户端实现 token 刷新机制。

### Q: 如何重置密码？
目前版本不支持自助重置密码，需手动修改数据库中的用户信息。

### Q: 如何查看服务器日志？
```bash
# PM2 日志
pm2 logs creator-sync

# 实时日志
pm2 logs creator-sync --lines 100 --nostream
```

---

## 许可证

MIT License

---

<p align="center">Made with ❤️ by 四夕云升</p>
