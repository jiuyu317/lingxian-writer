'use client'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut } from '@/app/actions/auth'
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

  // 从用户信息中提取用户名
  const getUserName = () => {
    if (user.email) {
      return user.email.split('@')[0]
    }
    return user.id?.slice(0, 8) || '用户'
  }

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault()
    await signOut()
  }

  return (
    <>
      {/* 全局样式 */}
      <style jsx global>{`
        body {
          background-color: #0f172a;
          background-image: 
            radial-gradient(at 40% 20%, hsla(266,50%,20%,1) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(230,60%,20%,1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(280,40%,15%,1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(240,50%,15%,1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(260,60%,20%,1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(220,50%,20%,1) 0px, transparent 50%),
            radial-gradient(at 0% 0%, hsla(240,40%,20%,1) 0px, transparent 50%);
          background-attachment: fixed;
          min-height: 100vh;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .glass-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-4px);
          background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3);
        }
        .btn-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }
        .btn-glow:hover {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
        }
      `}</style>

      {/* 导航栏 */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="material-icons-round text-white text-xl">auto_awesome</span>
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-wide">灵现写作</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <span>{user.email || '用户'}</span>
              </div>
              <form onSubmit={handleSignOut}>
                <button type="submit" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                  <span className="material-icons-round text-lg">logout</span>
                  <span>退出登录</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* 欢迎标题 */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            欢迎回来，<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{getUserName()}</span>
          </h1>
          <p className="text-gray-400 text-lg">开始你的创意写作之旅，AI助手随时为你服务</p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 灵现写作卡片 */}
          <div className="glass-card rounded-2xl p-6 md:col-span-1 lg:col-span-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-icons-round text-blue-400 text-3xl">edit_note</span>
                <h2 className="text-xl font-bold text-white">灵现写作</h2>
              </div>
              <p className="text-gray-400 mb-8 min-h-[3rem]">让AI帮助你激发创意，生成独特的写作内容，打造沉浸式故事。</p>
              <Link href="/write" className="block w-full">
                <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium btn-glow hover:scale-[1.02] transition-transform">
                  开始创作
                </button>
              </Link>
            </div>
          </div>

          {/* 创意灵感卡片 */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-icons-round text-purple-400 text-3xl">lightbulb</span>
                <h2 className="text-xl font-bold text-white">创意灵感</h2>
              </div>
              <p className="text-gray-400 mb-8 min-h-[3rem]">获取写作灵感，激发创作思路，突破思维瓶颈。</p>
              <Link href="/write?mode=inspiration" className="block w-full">
                <button className="w-full py-3 px-4 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-all font-medium">
                  获取灵感
                </button>
              </Link>
            </div>
          </div>

          {/* 批量生成卡片 */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-icons-round text-indigo-400 text-3xl">layers</span>
                <h2 className="text-xl font-bold text-white">批量生成</h2>
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 mb-4 border border-indigo-500/20">即将推出</span>
              <p className="text-gray-400 mb-6 min-h-[3rem] text-sm">一次生成多个章节，最多20章，提高长篇创作效率。</p>
              <button className="w-full py-3 px-4 rounded-xl bg-white/5 text-gray-500 cursor-not-allowed border border-white/5 font-medium" disabled>
                暂未开放
              </button>
            </div>
          </div>

          {/* 个人资料卡片 */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-icons-round text-emerald-400 text-3xl">person</span>
                <h2 className="text-xl font-bold text-white">个人资料</h2>
              </div>
              <p className="text-gray-400 mb-8 min-h-[3rem]">管理你的账户信息和写作偏好。</p>
              <Link href="/profile" className="block w-full">
                <button className="w-full py-3 px-4 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all font-medium">
                  编辑资料
                </button>
              </Link>
            </div>
          </div>

          {/* 设置卡片 */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group md:col-span-2 lg:col-span-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-20 group-hover:bg-orange-500/10 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between h-full">
              <div className="mb-6 md:mb-0 md:pr-8 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-icons-round text-orange-400 text-3xl">settings</span>
                  <h2 className="text-xl font-bold text-white">设置</h2>
                </div>
                <p className="text-gray-400">自定义写作风格，调整AI参数，以及更多高级配置选项。</p>
              </div>
              <div className="md:w-48 flex-shrink-0">
                <Link href="/settings" className="block w-full">
                  <button className="w-full py-3 px-4 rounded-xl border border-orange-500/30 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400 transition-all font-medium">
                    前往设置
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 新用户欢迎区域 */}
        <section className="mb-12 glass-panel rounded-2xl p-8 border-l-4 border-l-amber-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons-round text-amber-500 text-2xl animate-pulse">bolt</span>
              <h2 className="text-2xl font-bold text-white">欢迎新用户!</h2>
            </div>
            <p className="text-gray-300 mb-8 text-sm uppercase tracking-wider font-semibold opacity-70">开始您的AI写作之旅</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg group-hover:bg-amber-500 group-hover:text-black transition-all">1</div>
                <div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-amber-400 transition-colors">选择订阅套餐</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">选择适合您的AI写作额度套餐，解锁全部高级功能。</p>
                </div>
              </div>
              
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg group-hover:bg-amber-500 group-hover:text-black transition-all">2</div>
                <div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-amber-400 transition-colors">开始AI写作</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">使用AI生成创意内容，提升写作效率，打破创作瓶颈。</p>
                </div>
              </div>
              
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg group-hover:bg-amber-500 group-hover:text-black transition-all">3</div>
                <div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-amber-400 transition-colors">管理您的作品</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">保存、编辑和分享您的AI生成内容，建立您的作品库。</p>
                </div>
              </div>
            </div>
            
            <Link href="/upgrade" className="block w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <span className="material-icons-round text-lg">star</span>
                立即选购套餐
              </button>
            </Link>
          </div>
        </section>

        {/* 账户信息 */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">账户信息</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">邮箱地址</p>
              <p className="text-gray-200 font-mono">{user.email || '未设置'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">用户 ID</p>
              <p className="text-gray-200 font-mono text-sm break-all">{user.id || '未知'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">注册时间</p>
              <div className="flex items-center gap-2 text-gray-200">
                <span className="material-icons-round text-gray-500 text-sm">calendar_today</span>
                <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="material-icons-round text-white text-xs">auto_awesome</span>
                </div>
                <span className="font-serif font-bold text-white">灵现写作</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                基于 AI 的智能写作辅助平台，激发你的创作灵感，提升写作效率。
              </p>
            </div>
            <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">产品</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">仪表板</Link></li>
                  <li><Link href="/write" className="hover:text-blue-400 transition-colors">开始写作</Link></li>
                  <li><Link href="/upgrade" className="hover:text-blue-400 transition-colors">升级计划</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">支持</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><Link href="/disclaimer" className="hover:text-blue-400 transition-colors">免责声明</Link></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">联系支持</a></li>
                  <li><Link href="/settings" className="hover:text-blue-400 transition-colors">账户设置</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">法律</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">用户协议</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">隐私政策</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie 政策</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">
              © 2026 灵现写作平台. 保留所有权利.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="https://github.com/jiuyu317/lingxian-writer" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-gray-700 text-center md:text-left">
            本平台使用 AI 技术辅助创作，生成内容需用户自行核实。使用即表示同意我们的 <a className="text-blue-500 hover:underline" href="#">用户协议与免责声明</a>。
          </div>
        </div>
      </footer>
    </>
  )
}
