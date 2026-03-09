# 创作者同步助手 - 技术规格文档

## 1. 项目概述
- **项目名称**: 创作者同步助手
- **项目类型**: 移动端Web App (PWA)
- **核心功能**: 视频更新规划、日程代办、灵感热点管理
- **目标用户**: 自媒体视频创作者

## 2. UI/UX 规格

### 2.1 布局结构
- **底部Tab导航**: 固定底部，高度56px
- **主内容区**: 占据剩余空间，可滚动
- **弹出模态框**: 从底部滑入，占据80%视窗高度
- **页面结构**: Header(标题) + Content(可滚动) + TabBar(底部)

### 2.2 视觉设计

#### 颜色系统
```
--primary: #3B82F6      /* 电光蓝 - 主色 */
--primary-light: #60A5FA
--success: #10B981     /* 成功绿 - 辅助色 */
--danger: #EF4444      /* 热点红 - 警示色 */
--warning: #F59E0B     /* 警告黄 */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
--white: #FFFFFF
--border: #E5E7EB
```

#### 字体
- **主字体**: system-ui, -apple-system, sans-serif
- **标题**: 18px, font-weight: 600
- **正文**: 14px, font-weight: 400
- **小字**: 12px, font-weight: 400

#### 间距系统
- **基础单位**: 4px
- **页面边距**: 16px
- **卡片内边距**: 16px
- **元素间距**: 8px / 12px / 16px

#### 卡片样式
- 背景: #FFFFFF
- 边框: 1px solid #E5E7EB
- 圆角: 12px
- 阴影: none (扁平化)

### 2.3 组件规格

#### 底部导航栏
- 高度: 56px
- 背景: #FFFFFF
- 上边框: 1px solid #E5E7EB
- 图标大小: 24px
- 文字大小: 12px
- 选中颜色: #3B82F6
- 未选中颜色: #9CA3AF

#### 卡片组件
- 背景: #FFFFFF
- 边框: 1px solid #E5E7EB
- 圆角: 12px
- 内边距: 16px
- 间距: 12px

#### 按钮
- **主按钮**: 背景#3B82F6, 白色文字, 圆角8px, 高度44px
- **次按钮**: 背景透明, 边框#3B82F6, 文字#3B82F6
- **危险按钮**: 背景#EF4444, 白色文字
- **悬浮按钮**: 56px圆形, 背景#3B82F6, 阴影

#### 进度条
- 高度: 8px
- 背景: #E5E7EB
- 填充: #3B82F6
- 圆角: 4px

#### 模态框
- 背景: #FFFFFF
- 顶部圆角: 16px
- 最大高度: 80vh
- 遮罩: rgba(0,0,0,0.5)

### 2.4 页面规格

#### 首页 - 视频规划 (规划Tab)
- **Header**: "视频规划" 标题
- **日历组件**: 
  - 顶部月份切换 (< 2024年1月 >)
  - 星期行 (日一二三四五六)
  - 日期网格 (7列)
  - 有计划的日期显示小圆点
- **当日计划列表**: 选中日期显示当天规划
- **规划卡片**: 标题、进度条、状态标签

#### 第二页 - 代办清单 (清单Tab)
- **Header**: "待办清单" 标题 + 添加按钮
- **分类标签**: 全部 / 核心内容 / 日常运营
- **任务列表**:
  - 复选框 + 任务标题
  - 分类标签
  - 删除按钮
- **完成统计**: 已完成/总数

#### 第三页 - 热点备忘录 (灵感Tab)
- **Header**: "灵感热点" 标题
- **标签筛选**: 全部 + 用户标签
- **灵感卡片**:
  - 内容摘要
  - 标签
  - 置顶图标
  - 创建时间
  - 转换为规划按钮

#### 第四页 - 我的 (我的Tab)
- **用户信息**: 头像、昵称
- **统计卡片**: 
  - 规划总数
  - 完成任务数
  - 灵感总数
- **设置项**: 清除数据

## 3. 功能规格

### 3.1 视频规划功能

#### 数据模型
```typescript
interface VideoPlan {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  progress: '创意' | '脚本' | '素材' | '剪辑' | '发布';
  status: 'pending' | 'published';
  createdAt: string;
}
```

#### 核心功能
- 查看日历选择日期
- 创建新视频规划
- 编辑规划（标题、进度）
- 删除规划
- 进度状态切换

### 3.2 待办清单功能

#### 数据模型
```typescript
interface Task {
  id: string;
  title: string;
  category: 'core' | 'daily'; // 核心内容 / 日常运营
  completed: boolean;
  createdAt: string;
}
```

#### 核心功能
- 创建任务
- 切换完成状态
- 删除任务
- 分类筛选
- 统计完成数量

### 3.3 灵感热点功能

#### 数据模型
```typescript
interface Inspiration {
  id: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
}
```

#### 核心功能
- 记录灵感
- 添加标签
- 置顶/取消置顶
- 筛选标签
- 转换为视频规划

## 4. 技术实现

### 4.1 技术栈
- React 18
- Tailwind CSS
- Vite (构建工具)
- localStorage (数据持久化)
- React Hooks (状态管理)

### 4.2 项目结构
```
src/
  components/
    Layout.jsx
    TabBar.jsx
    Modal.jsx
    Card.jsx
    Button.jsx
  pages/
    Planning.jsx
    Tasks.jsx
    Inspiration.jsx
    Profile.jsx
  hooks/
    useLocalStorage.js
  utils/
    date.js
  App.jsx
  index.css
```

### 4.3 数据持久化
- 使用 localStorage 存储所有数据
- Key: 'creator-sync-data'
- 数据结构: { plans, tasks, inspirations }

## 5. 验收标准

### 功能验收
- [ ] 可以创建、编辑、删除视频规划
- [ ] 日历正确显示有规划的日期
- [ ] 可以切换视频制作进度
- [ ] 可以创建、完成、删除待办任务
- [ ] 任务可以按分类筛选
- [ ] 可以记录灵感并添加标签
- [ ] 灵感可以置顶
- [ ] 可以将灵感转换为视频规划
- [ ] 数据在页面刷新后保持

### UI验收
- [ ] 底部Tab导航正常工作
- [ ] 配色符合规格 (#3B82F6, #10B981, #EF4444)
- [ ] 卡片样式符合规格 (白色+细边框+圆角)
- [ ] 底部弹出模态框正常工作
- [ ] 响应式适配移动端
