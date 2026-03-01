'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/app/actions/auth'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  Sparkles, 
  User, 
  CheckCircle, 
  XCircle,
  Info
} from 'lucide-react'

export default function NewLoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    setTheme(savedTheme)
    document.body.classList.add(savedTheme)
    document.body.classList.remove(savedTheme === 'light' ? 'dark' : 'light')
  }, [])

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.classList.remove(theme)
    document.body.classList.add(newTheme)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // 验证表单
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('两次输入的密码不匹配')
        setLoading(false)
        return
      }
      if (!agreed) {
        setError('请同意用户协议和隐私政策')
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        const result = await signInWithEmail(email, password)
        if (result.success) {
          setSuccess('登录成功！正在跳转...')
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          setError(result.error || '登录失败')
        }
      } else {
        const result = await signUpWithEmail(email, password)
        if (result.success) {
          setSuccess('注册成功！请检查邮箱确认邮件。')
          setIsLogin(true) // 切换到登录模式
        } else {
          setError(result.error || '注册失败')
        }
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        setError(result.error || 'Google登录失败')
      }
    } catch (err) {
      setError('Google登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // 这里可以添加更复杂的通知系统
    if (type === 'success') {
      setSuccess(message)
      setError(null)
    } else {
      setError(message)
      setSuccess(null)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      {/* 主题切换按钮 */}
      <button
        onClick={toggleTheme}
        className={`fixed top-8 right-8 p-3 rounded-full backdrop-blur-md border ${
          theme === 'dark' 
            ? 'bg-gray-800/60 border-gray-700 text-gray-300' 
            : 'bg-white/70 border-gray-200 text-gray-600'
        } hover:scale-110 transition-transform z-50`}
        aria-label="切换主题"
      >
        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* 主内容 */}
      <main className="flex-grow flex flex-col items-center justify-center w-full px-4 pt-16 pb-24">
        {/* Hero Section */}
        <div className="mb-10 text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl mb-6 animate-pulse ${
            theme === 'dark' ? 'shadow-blue-500/20' : 'shadow-blue-500/30'
          }`}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold font-serif ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } tracking-tight`}>
            灵现写作
          </h1>
          <p className={`font-light tracking-widest uppercase text-sm md:text-base ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            开启你的创意写作之旅
          </p>
          <p className={`max-w-2xl mx-auto mt-6 text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            基于 AI 的智能写作辅助平台，激发创作灵感，提升写作效率。让每一段文字都充满灵性。
          </p>
        </div>

        {/* 登录卡片 */}
        <div className={`w-full max-w-md rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group backdrop-blur-md border ${
          theme === 'dark'
            ? 'bg-gray-800/60 border-gray-700'
            : 'bg-white/70 border-gray-200'
        }`}>
          {/* 背景装饰 */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-colors duration-500" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[80px] rounded-full group-hover:bg-purple-500/30 transition-colors duration-500" />
          
          <div className="relative z-10">
            {/* Tab Navigation */}
            <div className={`flex p-1.5 rounded-2xl mb-10 ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/50'
            }`}>
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                  isLogin
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                  !isLogin
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                注册
              </button>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    用户名
                  </label>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border border-gray-800 text-white'
                          : 'bg-white/50 border border-gray-200'
                      }`}
                      placeholder="选择用户名"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border border-gray-800 text-white'
                        : 'bg-white/50 border border-gray-200'
                    }`}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  密码
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border border-gray-800 text-white'
                        : 'bg-white/50 border border-gray-200'
                    }`}
                    placeholder={isLogin ? "••••••••" : "至少8个字符"}
                    required
                    minLength={isLogin ? 6 : 8}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    密码至少需要8个字符
                  </p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border border-gray-800 text-white'
                          : 'bg-white/50 border border-gray-200'
                      }`}
                      placeholder="再次输入密码"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* 错误/成功提示 */}
              {error && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                }`}>
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-600'
                  }`}>
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                }`}>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-600'
                  }`}>
                    {success}
                  </p>
                </div>
              )}

              {/* 协议复选框 */}
              {!isLogin && (
                <label className="flex items-start gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className={`mt-1 rounded ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                    }`}
                    required={!isLogin}
                    disabled={loading}
                  />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    我同意 <Link href="/terms" className="text-blue-500 hover:text-blue-600 transition-colors">服务条款</Link> 和 <Link href="/privacy" className="text-blue-500 hover:text-blue-600 transition-colors">隐私政策</Link>
                  </span>
                </label>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading || (!isLogin && !agreed)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isLogin ? '登录中...' : '注册中...'}
                    </span>
                  ) : (
                    isLogin ? '登录账户' : '创建账户'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            {/* 分割线 */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                }`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-4 ${
                  theme === 'dark' ? 'bg-gray-800/60 text-gray-400' : 'bg-transparent text-gray-400'
                }`}>
                  或
                </span>
              </div>
            </div>

            {/* Google登录 */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all group/social ${
                theme === 'dark'
                  ?