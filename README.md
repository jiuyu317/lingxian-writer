# 灵现 · AI写作智能体

一个专为写作者设计的AI灵感激发师网站，基于Next.js 14 (App Router) 和 Tailwind CSS构建。

## 🚀 功能特性

### 核心功能
- **智能灵感生成**：根据主题和参数生成创作灵感
- **参数化配置**：可调节文风、情绪强度、创意等级等
- **实时预览**：生成结果即时展示
- **暗色/亮色主题**：支持主题切换

### 技术特色
- 响应式设计，适配各种设备
- 流畅的动画和过渡效果
- 现代化的UI组件
- TypeScript类型安全

## 📁 项目结构

```
lingguang-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局组件
│   │   ├── page.tsx            # 主页面组件
│   │   └── globals.css         # 全局样式
│   └── components/             # 可复用组件（待开发）
├── public/                     # 静态资源
├── package.json
└── README.md
```

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **包管理**: npm

## 🚦 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

## 🎨 设计理念

### 用户体验
- **直观操作**：左侧配置，右侧实时预览
- **即时反馈**：生成过程有加载状态提示
- **个性化**：支持多种文风和参数调节

### 视觉设计
- **渐变背景**：营造创意氛围
- **卡片式布局**：信息层次清晰
- **微交互**：按钮悬停、切换动画等

## 🔧 配置说明

### 创作参数
1. **主题**：输入创作的核心主题
2. **文风**：选择适合的故事风格（热血、浪漫、悬疑等）
3. **情绪强度**：调节故事的感染力
4. **创意等级**：控制灵感的突破性
5. **文章长度**：选择生成内容的篇幅
6. **包含内容**：选择是否包含人物、情节、世界观等

### 主题切换
- 点击右上角月亮/太阳图标切换亮色/暗色主题
- 系统会自动保存主题偏好

## 📱 响应式设计

- **桌面端**：三栏布局，完整功能展示
- **平板端**：自适应布局，优化操作体验
- **移动端**：单列布局，优先核心功能

## 🚀 开发计划

### 已完成
- [x] 项目基础架构搭建
- [x] 主页面UI设计
- [x] 参数配置面板
- [x] 结果展示区域
- [x] 主题切换功能
- [x] 响应式布局
- [x] 用户系统（登录/注册）

### 待开发
- [ ] 后端API集成（OpenAI等）
- [ ] 灵感收藏功能
- [ ] 历史记录查看
- [ ] 导出功能（PDF、Markdown等）
- [ ] 更多文风模板
- [ ] 移动端优化

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目仅供学习交流使用，请勿用于商业用途。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Lucide Icons](https://lucide.dev/) - 精美的图标库
- [OpenAI](https://openai.com/) - AI模型支持

---

**灵现智能体** - 给你的大脑放烟花！ ✨

## 🚀 Vercel 部署

本项目已配置 Vercel 自动部署。每次推送到 `main` 分支都会自动部署。

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjiuyu317%2Flingxian-writer)

### 环境变量

在 Vercel 中配置以下环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `OPENAI_API_KEY` | OpenAI API 密钥 | ❌ |

### 手动部署步骤

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 登录
3. 导入 `jiuyu317/lingxian-writer` 仓库
4. 配置环境变量
5. 点击部署

### 自动部署

- ✅ 推送到 `main` 分支 → 生产环境部署
- ✅ 创建 Pull Request → 预览环境部署
- ✅ 合并 Pull Request → 自动部署到生产

### 部署状态

[![Vercel](https://vercelbadge.vercel.app/api/jiuyu317/lingxian-writer)](https://vercel.com/jiuyu317/lingxian-writer)

## 📞 支持

- GitHub Issues: [报告问题](https://github.com/jiuyu317/lingxian-writer/issues)
- 文档: 查看本 README 和项目文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
