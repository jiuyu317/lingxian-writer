'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserSettings, saveUserSettings } from '@/app/actions/db-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, Settings, Bell, Globe, Moon, Shield, CreditCard, 
  Sparkles, Save, Check, AlertCircle, Database, History, FileText 
} from 'lucide-react'

export default function SettingsPageEnhanced() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 用户设置状态
  const [settings, setSettings] = useState({
    // 写作偏好
    writingStyle: 'balanced',
    emotionIntensity: 50,
    creativityLevel: 70,
    defaultLength: 'medium',
    
    // 界面偏好
    theme: 'light',
    fontSize: 'medium',
    uiDensity: 'normal',
    
    // 功能设置
    autoSave: true,
    autoSaveInterval: 30,
    realTimePreview: true,
    aiSuggestions: true,
    
    // 隐私与安全
    dataCollection: false,
    sessionTimeout: true,
    sessionTimeoutMinutes: 60,
    
    // AI设置
    defaultModel: 'deepseek',
    maxTokens: 1000,
    temperature: 0.7
  })
  
  // 加载用户设置
  useEffect(() => {
    loadUserSettings()
  }, [])
  
  const loadUserSettings = async () => {
    setLoading(true)
    try {
      const response = await getUserSettings()
      if (response.success && response.data) {
        setSettings(prev => ({
          ...prev,
          writingStyle: response.data!.writingStyle,
          emotionIntensity: response.data!.emotionIntensity,
          creativityLevel: response.data!.creativityLevel,
          defaultLength: response.data!.defaultLength,
          theme: response.data!.theme || 'light',
          fontSize: response.data!.fontSize || 'medium',
          autoSave: response.data!.autoSave,
          autoSaveInterval: response.data!.autoSaveInterval
        }))
      }
    } catch (err) {
      setError('加载设置失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 保存用户设置
  const saveSettings = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await saveUserSettings({
        writingStyle: settings.writingStyle,
        emotionIntensity: settings.emotionIntensity,
        creativityLevel: settings.creativityLevel,
        defaultLength: settings.defaultLength,
        theme: settings.theme,
        fontSize: settings.fontSize,
        autoSave: settings.autoSave,
        autoSaveInterval: settings.autoSaveInterval
      })
      
      if (response.success) {
        setSuccess('设置已保存成功！')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || '保存设置失败')
      }
    } catch (err) {
      setError('保存设置失败')
    } finally {
      setSaving(false)
    }
  }
  
  // 处理设置变化
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }
  
  // 重置为默认设置
  const resetToDefaults = () => {
    setSettings({
      writingStyle: 'balanced',
      emotionIntensity: 50,
      creativityLevel: 70,
      defaultLength: 'medium',
      theme: 'light',
      fontSize: 'medium',
      uiDensity: 'normal',
      autoSave: true,
      autoSaveInterval: 30,
      realTimePreview: true,
      aiSuggestions: true,
      dataCollection: false,
      sessionTimeout: true,
      sessionTimeoutMinutes: 60,
      defaultModel: 'deepseek',
      maxTokens: 1000,
      temperature: 0.7
    })
    setSuccess('已重置为默认设置')
    setTimeout(() => setSuccess(''), 3000)
  }
  
  // 导出用户数据
  const exportUserData = () => {
    const data = {
      settings,
      exportTime: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `灵现设置备份_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setSuccess('设置已导出为JSON文件')
    setTimeout(() => setSuccess(''), 3000)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    )
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
                <span className="text-white text-sm font-medium">U</span>
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
          
          {/* 错误和成功提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：设置导航 */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    <button
                      onClick={() => document.getElementById('writing')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      写作设置
                    </button>
                    <button
                      onClick={() => document.getElementById('appearance')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Moon className="w-4 h-4 mr-3" />
                      外观设置
                    </button>
                    <button
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      功能设置
                    </button>
                    <button
                      onClick={() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      隐私与安全
                    </button>
                    <button
                      onClick={() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Sparkles className="w-4 h-4 mr-3" />
                      AI设置
                    </button>
                  </nav>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-2">
                      <Button
                        onClick={saveSettings}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存所有设置
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={resetToDefaults}
                        variant="outline"
                        className="w-full"
                      >
                        恢复默认设置
                      </Button>
                      
                      <Button
                        onClick={exportUserData}
                        variant="outline"
                        className="w-full"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        导出设置
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 右侧：设置内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 写作设置 */}
              <Card id="writing">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    写作设置
                  </CardTitle>
                  <CardDescription>
                    自定义你的写作偏好和默认参数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认写作风格
                      </label>
                      <select
                        value={settings.writingStyle}
                        onChange={(e) => handleSettingChange('writingStyle', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="balanced">平衡风格</option>
                        <option value="creative">创意优先</option>
                        <option value="professional">专业正式</option>
                        <option value="casual">轻松随意</option>
                        <option value="poetic">诗意优美</option>
                        <option value="adventure">热血冒险</option>
                        <option value="romantic">浪漫唯美</option>
                        <option value="mystery">悬疑推理</option>
                        <option value="humorous">幽默诙谐</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认情绪强度: {settings.emotionIntensity}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.emotionIntensity}
                        onChange={(e) => handleSettingChange('emotionIntensity', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>平静</span>
                        <span>中等</span>
                        <span>激烈</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认创意等级: {settings.creativityLevel}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.creativityLevel}
                        onChange={(e) => handleSettingChange('creativityLevel', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>保守</span>
                        <span>平衡</span>
                        <span>创新</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认输出长度
                      </label>
                      <select
                        value={settings.defaultLength}
                        onChange={(e) => handleSettingChange('defaultLength', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="short">简短 (100-200字)</option>
                        <option value="medium">中等 (300-500字)</option>
                        <option value="long">长篇 (800-1000字)</option>
                        <option value="detailed">详细 (1500字以上)</option>
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
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        主题模式
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => handleSettingChange('theme', 'light')}
                          className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                            settings.theme === 'light'
                              ? 'border-2 border-blue-500 bg-white shadow-sm'
                              : 'border border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="w-full h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded mb-2"></div>
                          <span className="text-sm font-medium">浅色</span>
                        </button>
                        <button
                          onClick={() => handleSettingChange('theme', 'dark')}
                          className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                            settings.theme === 'dark'
                              ? 'border-2 border-blue-500 bg-gray-900 shadow-sm'
                              : 'border border-gray-300 bg-gray-900 hover:border-gray-400'
                          }`}
                        >
                          <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                          <span className="text-sm font-medium text-white">深色</span>
                        </button>
                        <button
                          onClick={() => handleSettingChange('theme', 'auto')}
                          className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                            settings.theme === 'auto'
                              ? 'border-2 border-blue-500 bg-gradient-to-br from-gray-50 to-gray-900 shadow-sm'
                              : 'border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-900 hover:border-gray-400'
                          }`}
                        >
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
                        value={settings.fontSize}
                        onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        value={settings.uiDensity}
                        onChange={(e) => handleSettingChange('uiDensity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="compact">紧凑</option>
                        <option value="normal">正常</option>
                        <option value="comfortable">宽松</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* 功能设置 */}
              <Card id="features">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                    功能设置
                  </CardTitle>
                  <CardDescription>
                    管理应用功能和行为
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">自动保存草稿</h3>
                        <p className="text-sm text-gray-500">自动保存写作过程中的草稿</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoSave}
                          onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {settings.autoSave && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          自动保存间隔: {settings.autoSaveInterval}秒
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="120"
                          step="10"
                          value={settings.autoSaveInterval}
                          onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>10秒</span>
                          <span>65秒</span>
                          <span>120秒</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">实时预览</h3>
                        <p className="text-sm text-gray-500">在写作时实时预览生成效果</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.realTimePreview}
                          onChange={(e) => handleSettingChange('realTimePreview', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">AI建议提示</h3>
                        <p className="text-sm text-gray-500">在写作时显示AI建议和提示</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.aiSuggestions}
                          onChange={(e) => handleSettingChange('aiSuggestions', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* 隐私与安全 */}
              <Card id="privacy">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-600" />
                    隐私与安全
                  </CardTitle>
                  <CardDescription>
                    管理你的隐私设置和安全选项
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">数据收集</h3>
                        <p className="text-sm text-gray-500">允许匿名数据收集以改进服务</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.dataCollection}
                          onChange={(e) => handleSettingChange('dataCollection', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">会话超时</h3>
                        <p className="text-sm text-gray-500">自动登出长时间未活动的会话</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.sessionTimeout}
                          onChange={(e) => handleSettingChange('sessionTimeout', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {settings.sessionTimeout && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          会话超时时间
                        </label>
                        <select
                          value={settings.sessionTimeoutMinutes}
                          onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="15">15分钟</option>
                          <option value="30">30分钟</option>
                          <option value="60">1小时</option>
                          <option value="120">2小时</option>
                          <option value="never">从不</option>
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">数据管理</h3>
                      <p className="text-sm text-gray-500 mb-4">管理你的个人数据和隐私</p>
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full" onClick={exportUserData}>
                          <Database className="w-4 h-4 mr-2" />
                          导出数据
                        </Button>
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:border-red-300">
                          删除账户
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI设置 */}
              <Card id="ai">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                    AI设置
                  </CardTitle>
                  <CardDescription>
                    配置AI模型和生成参数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认AI模型
                      </label>
                      <select
                        value={settings.defaultModel}
                        onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="deepseek">DeepSeek (推荐)</option>
                        <option value="openai">OpenAI GPT-4</option>
                        <option value="claude">Claude 3</option>
                        <option value="gemini">Gemini Pro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大Token数: {settings.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={settings.maxTokens}
                        onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>100</span>
                        <span>2050</span>
                        <span>4000</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        控制AI生成内容的最大长度（约{Math.round(settings.maxTokens * 0.75)}字）
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        温度参数: {settings.temperature.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>保守 (0.0)</span>
                        <span>平衡 (1.0)</span>
                        <span>创意 (2.0)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        控制AI的创意程度，值越高越有创意但可能不准确
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* 底部保存按钮 */}
              <div className="sticky bottom-6 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">设置已修改</p>
                    <p className="text-xs text-gray-500">部分设置需要刷新页面才能生效</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetToDefaults}
                    >
                      恢复默认
                    </Button>
                    <Button
                      onClick={saveSettings}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          保存设置
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}