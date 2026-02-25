import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Mail, Calendar, Edit, Save, Sparkles } from 'lucide-react'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回仪表板
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <Sparkles className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">灵现写作</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">个人资料</h1>
            <p className="text-gray-600">
              管理你的账户信息和写作偏好设置
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：个人信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本信息卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    基本信息
                  </CardTitle>
                  <CardDescription>
                    管理你的账户基本信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          邮箱地址
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          邮箱地址用于登录和接收通知
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          显示名称
                        </label>
                        <input
                          type="text"
                          defaultValue={user.email?.split('@')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="输入显示名称"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="介绍一下你自己..."
                        defaultValue="热爱写作的创作者，喜欢探索不同的文学风格和表达方式。"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 写作偏好 */}
              <Card>
                <CardHeader>
                  <CardTitle>写作偏好设置</CardTitle>
                  <CardDescription>
                    自定义你的AI写作助手偏好
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认写作风格
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="balanced"
                      >
                        <option value="balanced">平衡风格</option>
                        <option value="creative">创意优先</option>
                        <option value="professional">专业正式</option>
                        <option value="casual">轻松随意</option>
                        <option value="poetic">诗意优美</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认输出长度
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="medium"
                      >
                        <option value="short">简短 (100-200字)</option>
                        <option value="medium">中等 (300-500字)</option>
                        <option value="long">长篇 (800-1000字)</option>
                        <option value="detailed">详细 (1500字以上)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          创意强度 (0-100)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="75"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>保守</span>
                          <span>中等</span>
                          <span>创新</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          语言复杂度 (0-100)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="60"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>简单</span>
                          <span>适中</span>
                          <span>复杂</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：账户信息 */}
            <div className="space-y-6">
              {/* 账户概览 */}
              <Card>
                <CardHeader>
                  <CardTitle>账户概览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">用户ID</span>
                      <span className="font-mono text-sm text-gray-900">{user.id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">注册时间</span>
                      <span className="text-gray-900">
                        {new Date(user.created_at || '').toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">账户状态</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        正常
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">邮箱验证</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        已验证
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 头像设置 */}
              <Card>
                <CardHeader>
                  <CardTitle>头像设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      当前使用邮箱首字母作为头像
                    </p>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      上传新头像
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 保存按钮 */}
              <div className="sticky top-6">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  保存所有更改
                </Button>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  更改将立即生效
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}