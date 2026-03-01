# 环境变量设置指南

## Vercel 部署环境变量配置

在 Vercel Dashboard 中设置以下环境变量：

### 🔧 必需的环境变量

| 变量名 | 值示例 | 获取方式 |
|--------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxx.supabase.co` | [Supabase 项目设置](https://supabase.com/dashboard/project/_/settings/api) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | [Supabase 项目设置](https://supabase.com/dashboard/project/_/settings/api) |

### 📝 可选的环境变量

| 变量名 | 值示例 | 获取方式 |
|--------|--------|----------|
| `OPENAI_API_KEY` | `sk-xxxxxx` | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `DEEPSEEK_API_KEY` | `sk-xxxxxx` | [DeepSeek API Keys](https://platform.deepseek.com/api_keys) |
| `NEXT_PUBLIC_SITE_URL` | `https://lingxian-writer.vercel.app` | 你的 Vercel 部署域名 |
| `STRIPE_SECRET_KEY` | `sk_test_xxxxxx` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxxx` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxxx` | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |

## 本地开发环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local` 文件，填入你的实际 API 密钥。

## Supabase 项目设置

### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 点击 "New project"
3. 填写项目名称和数据库密码
4. 选择区域（推荐：亚太地区）
5. 点击 "Create new project"

### 2. 获取 API 密钥
1. 进入项目 Dashboard
2. 点击左侧菜单 "Settings" → "API"
3. 复制：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 配置数据库表
项目已包含 SQL 文件 `supabase-tables.sql`，可以在 Supabase SQL Editor 中运行。

## 测试部署

### 最小配置测试
如果只想测试部署，可以只设置：
- `NEXT_PUBLIC_SUPABASE_URL` (必需)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (必需)

其他功能（AI 写作、支付等）将在缺少密钥时显示降级界面。

### 验证配置
部署后访问：
- `https://your-domain.vercel.app/login` - 测试登录功能
- `https://your-domain.vercel.app/write` - 测试写作功能
- `https://your-domain.vercel.app/debug` - 调试页面

## 故障排除

### 常见问题

#### 1. Supabase 连接失败
**症状**: 登录页面显示连接错误
**解决方案**:
- 检查环境变量是否正确
- 验证 Supabase 项目是否激活
- 检查网络连接

#### 2. AI 功能不可用
**症状**: 写作页面显示 "AI 服务不可用"
**解决方案**:
- 设置 `OPENAI_API_KEY` 或 `DEEPSEEK_API_KEY`
- 或设置 `ENABLE_REAL_AI=false` 使用模拟数据

#### 3. 支付功能不可用
**症状**: 升级页面显示支付错误
**解决方案**:
- 设置 Stripe 相关环境变量
- 或暂时隐藏支付功能

## 安全建议

### 环境变量安全
- ✅ 不要在代码中硬编码密钥
- ✅ 使用 Vercel 环境变量管理
- ✅ 定期轮换 API 密钥
- ✅ 使用不同的密钥用于开发和生产

### 访问控制
- 限制 Supabase 行级安全策略
- 设置 API 速率限制
- 启用 Supabase 审计日志

## 更新环境变量

### 在 Vercel 中更新
1. 进入 Vercel Dashboard
2. 选择你的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加或修改变量
5. 点击 "Save"
6. 重新部署项目

### 重新部署
```bash
# 通过 GitHub 推送触发
git commit -m "chore: 更新环境变量"
git push origin main
```

## 支持

如有环境变量配置问题，请：
1. 检查 Vercel 部署日志
2. 查看浏览器控制台错误
3. 访问 `/debug` 页面查看配置状态
4. 在 GitHub Issues 中报告问题