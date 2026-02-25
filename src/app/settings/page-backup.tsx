import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Settings, Bell, Globe, Moon, Shield, CreditCard, Sparkles } from 'lucide-react'

export default async function SettingsPage() {
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
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
            <p className="text-gray-600">
              自定义你的应用体验和偏好设置
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：设置导航 */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    <a href="#general" className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md">
                      <Settings className="w-4 h-4 mr-3" />
                      通用设置
                    </a>
                    <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      <Bell className="w-4 h-4 mr-3" />
                      通知设置
                    </a>
                    <a href="#appearance" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      <Moon className="w-4 h-4 mr-3" />
                      外观设置
                    </a>
                    <a href="#language" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      <Globe className="w-4 h-4 mr-3" />
                      语言与地区
                    </a>
                    <a href="#privacy" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      <Shield className="w-4 h-4 mr-3" />
                      隐私与安全
                    </a>
                    <a href="#billing" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                      <CreditCard className="w-4 h-4 mr-3" />
                      订阅与账单
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：设置内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 通用设置 */}
              <Card id="general">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    通用设置
                  </CardTitle>
                  <CardDescription>
                    应用基础设置和偏好
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">自动保存草稿</h3>
                        <p className="text-sm text-gray-500">自动保存写作过程中的草稿</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">实时预览</h3>
                        <p className="text-sm text-gray-500">在写作时实时预览生成效果</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">AI建议提示</h3>
                        <p className="text-sm text-gray-500">在写作时显示AI建议和提示</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认AI模型
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="deepseek">DeepSeek (推荐)</option>
                        <option value="openai">OpenAI GPT-4</option>
                        <option value="claude">Claude 3</option>
                        <option value="gemini">Gemini Pro</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 外观设置 */}
              <Card id="appearance">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Moon className="w-5 h-5 mr-2 text-purple-600" />
                    外观设置
                  </CardTitle>
                  <CardDescription>
                    自定义应用界面外观
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        主题模式
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <button className="flex flex-col items-center p-4 border-2 border-blue-500 rounded-lg bg-white">
                          <div className="w-full h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded mb-2"></div>
                          <span className="text-sm font-medium">浅色</span>
                        </button>
                        <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg bg-gray-900">
                          <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                          <span className="text-sm font-medium text-white">深色</span>
                        </button>
                        <button className="flex flex-col items-center p-4 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-900">
                          <div className="w-full h-20 bg-gradient-to-br from-gray-50 to-gray-800 rounded mb-2"></div>
                          <span className="text-sm font-medium">自动</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        字体大小
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="medium"
                      >
                        <option value="small">小</option>
                        <option value="medium">中 (默认)</option>
                        <option value="large">大</option>
                        <option value="xlarge">特大</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        界面密度
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="normal"
                      >
                        <option value="compact">紧凑</option>
                        <option value="normal">正常</option>
                        <option value="comfortable">宽松</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 隐私与安全 */}
              <Card id="privacy">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    隐私与安全
                  </CardTitle>
                  <CardDescription>
                    管理你的隐私设置和安全选项
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">数据收集</h3>
                        <p className="text-sm text-gray-500">允许匿名数据收集以改进服务</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">会话超时</h3>
                        <p className="text-sm text-gray-500">自动登出长时间未活动的会话</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        会话超时时间
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="60"
                      >
                        <option value="15">15分钟</option>
                        <option value="30">30分钟</option>
                        <option value="60">1小时</option>
                        <option value="120">2小时</option>
                        <option value="never">从不</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">数据导出</h3>
                      <p className="text-sm text-gray-500 mb-4">导出你的写作数据和账户信息</p>
                      <Button variant="outline" className="w-full">
                        请求数据导出
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 保存按钮 */}
              <div className="sticky bottom-6">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  保存所有设置
                </Button>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  部分设置需要刷新页面才能生效
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}