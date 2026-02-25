'use client'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, LogOut, User, Settings, Zap, Lightbulb, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          redirect('/login')
        }
        setUser(currentUser)
      } catch (error) {
        console.error('加载用户信息失败:', error)
        redirect('/login')
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 重定向中
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Sparkles className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">灵现写作</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 欢迎卡片 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">欢迎回来，{user.email}！</CardTitle>
              <CardDescription>
                开始你的创意写作之旅，AI助手随时为你服务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                      灵现写作
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      让AI帮助你激发创意，生成独特的写作内容
                    </p>
                    <Link href="/write">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        开始创作
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
                      创意灵感
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      获取写作灵感，激发创作思路
                    </p>
                    <Link href="/write?mode=inspiration">
                      <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                        获取灵感
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-indigo-600" />
                      批量生成
                    </CardTitle>
                    <CardDescription className="text-indigo-600">
                      <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                        即将推出
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      一次生成多个章节，最多20章，提高长篇创作效率
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 cursor-not-allowed opacity-70"
                      onClick={() => alert('🚧 批量生成功能暂未开放，敬请期待！\n\n这是我们后续的工程项目，将支持：\n• 一次生成最多20个章节\n• 智能章节连贯性处理\n• 批量导出和管理\n• 进度跟踪和统计')}
                    >
                      暂未开放
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      个人资料
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      管理你的账户信息和写作偏好
                    </p>
                    <Link href="/profile">
                      <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                        编辑资料
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-orange-600" />
                      设置
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      自定义写作风格和AI参数设置
                    </p>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                        前往设置
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* 新用户引导 */}
          <Card className="mb-8 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Zap className="w-5 h-5 mr-2" />
                欢迎新用户！
              </CardTitle>
              <CardDescription className="text-yellow-700">
                开始您的AI写作之旅
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-yellow-800">
                  🎉 欢迎加入灵现AI写作！为了开始使用AI写作功能，您需要：
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-yellow-800 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">选择订阅套餐</p>
                      <p className="text-yellow-700 text-sm">选择适合您的AI写作额度套餐</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-yellow-800 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">开始AI写作</p>
                      <p className="text-yellow-700 text-sm">使用AI生成创意内容，提升写作效率</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-yellow-800 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">管理您的作品</p>
                      <p className="text-yellow-700 text-sm">保存、编辑和分享您的AI生成内容</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-yellow-200">
                  <Link href="/upgrade">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      立即选择套餐
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用户信息 */}
          <Card>
            <CardHeader>
              <CardTitle>账户信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱地址
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用户ID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    注册时间
                  </label>
                  <p className="text-gray-900">
                    {new Date(user.created_at || '').toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}