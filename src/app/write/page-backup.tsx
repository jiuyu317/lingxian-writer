'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { generateAIContent } from '@/app/actions/writing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Sparkles, Brain, Copy, Save, RefreshCw, Check, Zap, AlertCircle, Lightbulb, Plus, X } from 'lucide-react'

export default function WritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isInspirationMode, setIsInspirationMode] = useState(false)
  const [isPlusMode, setIsPlusMode] = useState(false) // "+"模式状态
  const [element1, setElement1] = useState('') // 第一个元素
  const [element2, setElement2] = useState('') // 第二个元素
  
  // 检查URL参数
  useEffect(() => {
    const mode = searchParams.get('mode')
    setIsInspirationMode(mode === 'inspiration')
  }, [searchParams])
  
  // 表单状态 - 根据模式设置不同的默认值
  const [formData, setFormData] = useState({
    topic: '',
    style: 'creative',
    emotionIntensity: 60,
    creativityLevel: 90,
    length: 'short',
    additionalInstructions: ''
  })

  // 根据模式更新表单默认值
  useEffect(() => {
    if (isInspirationMode) {
      setFormData({
        topic: '',
        style: 'creative',
        emotionIntensity: 80, // 提高情绪强度，增加感染力
        creativityLevel: 100, // 创意值拉满到100
        length: 'short', // 确保200字以下
        additionalInstructions: '请生成让人眼前一亮的创意写作点子，字数控制在200字以内，要求创意十足、新颖独特、有冲击力'
      })
    }
  }, [isInspirationMode])

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'emotionIntensity' || name === 'creativityLevel' ? parseInt(value) : value
    }))
  }

  // 处理滑块变化
  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 提交表单生成内容
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setResult('')

    try {
      // 验证输入
      if (isInspirationMode && isPlusMode) {
        if (!element1.trim() || !element2.trim()) {
          setError('请填写两个创意元素')
          setLoading(false)
          return
        }
      } else if (isInspirationMode && !isPlusMode) {
        if (!formData.topic.trim()) {
          setError('请输入灵感主题')
          setLoading(false)
          return
        }
      } else {
        if (!formData.topic.trim()) {
          setError('请输入写作主题')
          setLoading(false)
          return
        }
      }

      const formDataObj = new FormData()
      
      // 如果是"+"模式，使用组合主题
      if (isInspirationMode && isPlusMode && element1 && element2) {
        // 组合两个元素作为主题
        const combinedTopic = `${element1} + ${element2}`
        formDataObj.append('topic', combinedTopic)
        
        // 设置其他参数为创意灵感模式的默认值
        formDataObj.append('style', 'creative')
        formDataObj.append('emotionIntensity', '80')
        formDataObj.append('creativityLevel', '100')
        formDataObj.append('length', 'short')
        formDataObj.append('additionalInstructions', `请将"${element1}"和"${element2}"这两个看似无关的元素创意地结合起来，生成让人眼前一亮的灵感点子，字数控制在200-400字左右，确保创意完整性`)
      } else {
        // 普通模式或创意灵感普通模式
        Object.entries(formData).forEach(([key, value]) => {
          formDataObj.append(key, value.toString())
        })
      }
      
      // 添加模式参数
      if (isInspirationMode) {
        formDataObj.append('mode', 'inspiration')
      }

      console.log('提交表单数据:', {
        isInspirationMode,
        isPlusMode,
        element1,
        element2,
        formData: Object.fromEntries(formDataObj.entries())
      })

      const response = await generateAIContent(formDataObj)

      if (response.success) {
        setResult(response.content)
        setSuccess('内容生成成功！')
        
        // 计算字数
        const words = response.content.trim().split(/\s+/).length
        setWordCount(words)
      } else {
        setError(response.error || '生成内容失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误')
    } finally {
      setLoading(false)
    }
  }

  // 复制结果到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('复制失败')
    }
  }

  // 保存草稿
  const handleSaveDraft = () => {
    // 这里可以添加保存草稿的逻辑
    setSuccess('已保存为草稿')
  }

  // 重新生成
  const handleRegenerate = () => {
    setResult('')
    setSuccess('')
    handleSubmit(new Event('submit') as any)
  }

  // 清空表单
  const handleClear = () => {
    setFormData({
      topic: '',
      style: 'balanced',
      emotionIntensity: 50,
      creativityLevel: 70,
      length: 'medium',
      additionalInstructions: ''
    })
    setResult('')
    setError('')
    setSuccess('')
  }

  // 切换"+"模式
  const togglePlusMode = () => {
    setIsPlusMode(!isPlusMode)
    if (!isPlusMode) {
      // 进入"+"模式时清空元素
      setElement1('')
      setElement2('')
    }
  }

  // 处理元素输入变化
  const handleElementChange = (element: 'element1' | 'element2', value: string) => {
    if (element === 'element1') {
      setElement1(value)
    } else {
      setElement2(value)
    }
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
                  U
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 欢迎标题 */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              {isInspirationMode ? (
                <>
                  <Lightbulb className="w-8 h-8 text-purple-600 mr-3" />
                  <h1 className="text-3xl font-bold text-gray-900">创意灵感生成器</h1>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-3xl font-bold text-gray-900">AI写作助手</h1>
                </>
              )}
            </div>
            <p className="text-gray-600">
              {isInspirationMode 
                ? '获取写作灵感，激发创作思路，让创意源源不断'
                : '输入你的创意主题，让AI为你生成独特的写作内容'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：写作表单 */}
            <div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {isInspirationMode ? (
                      <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
                    ) : (
                      <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    )}
                    {isInspirationMode ? '创意灵感生成' : '创意灵感生成'}
                  </CardTitle>
                  <CardDescription>
                    {isInspirationMode
                      ? '输入灵感主题，AI将自动生成极致创意的写作点子'
                      : '填写以下信息，AI将为你生成独特的写作内容'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 创意灵感模式 */}
                    {isInspirationMode ? (
                      <div className="space-y-6">
                        {/* "+"模式切换按钮 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                              {isPlusMode ? '创意组合模式' : '创意灵感模式'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={togglePlusMode}
                            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isPlusMode 
                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {isPlusMode ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                关闭组合
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                创意组合
                              </>
                            )}
                          </button>
                        </div>

                        {/* "+"模式：两个元素输入 */}
                        {isPlusMode ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                第一个元素 *
                              </label>
                              <input
                                type="text"
                                value={element1}
                                onChange={(e) => handleElementChange('element1', e.target.value)}
                                placeholder="输入第一个元素，如：时间旅行、机器人、魔法..."
                                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                                disabled={loading}
                              />
                            </div>

                            <div className="flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-purple-600" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                第二个元素 *
                              </label>
                              <input
                                type="text"
                                value={element2}
                                onChange={(e) => handleElementChange('element2', e.target.value)}
                                placeholder="输入第二个元素，如：咖啡馆、爱情、未来科技..."
                                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                                disabled={loading}
                              />
                            </div>

                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm text-purple-700">
                                💡 AI将创意地组合"<span className="font-semibold">{element1 || '元素1'}</span>" 
                                和"<span className="font-semibold">{element2 || '元素2'}</span>"， 
                                生成让人眼前一亮的跨界灵感！
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* 普通创意灵感模式：只保留主题输入 */
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              灵感主题 *
                            </label>
                            <input
                              type="text"
                              name="topic"
                              value={formData.topic}
                              onChange={handleInputChange}
                              placeholder="输入你想要的灵感主题，如：时间旅行、未来城市、奇幻冒险..."
                              className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              required
                              disabled={loading}
                            />
                            <p className="mt-2 text-sm text-purple-600">
                              💡 AI将自动使用极致创意参数生成让人眼前一亮的灵感点子
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* 普通写作模式：完整表单 */
                      <>
                        {/* 写作主题 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            写作主题 *
                          </label>
                          <input
                            type="text"
                            name="topic"
                            value={formData.topic}
                            onChange={handleInputChange}
                            placeholder="例如：未来科技、武侠江湖、爱情故事..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={loading}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            清晰的主题能让AI生成更相关的内容
                          </p>
                        </div>

                        {/* 写作风格 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            写作风格 *
                          </label>
                          <select
                            name="style"
                            value={formData.style}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
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

                        {/* 情绪强度和创意等级 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              情绪强度: {formData.emotionIntensity}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.emotionIntensity}
                              onChange={(e) => handleSliderChange('emotionIntensity', parseInt(e.target.value))}
                              className="w-full"
                              disabled={loading}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>平静</span>
                              <span>中等</span>
                              <span>激烈</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              创意等级: {formData.creativityLevel}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.creativityLevel}
                              onChange={(e) => handleSliderChange('creativityLevel', parseInt(e.target.value))}
                              className="w-full"
                              disabled={loading}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>保守</span>
                              <span>平衡</span>
                              <span>创新</span>
                            </div>
                          </div>
                        </div>

                        {/* 输出长度 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            输出长度 *
                          </label>
                          <select
                            name="length"
                            value={formData.length}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                          >
                            <option value="short">简短 (100-200字)</option>
                            <option value="medium">中等 (300-500字)</option>
                            <option value="long">长篇 (800-1000字)</option>
                            <option value="detailed">详细 (1500字以上)</option>
                          </select>
                        </div>

                        {/* 额外要求 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            额外要求（可选）
                          </label>
                          <textarea
                            name="additionalInstructions"
                            value={formData.additionalInstructions}
                            onChange={handleInputChange}
                            placeholder="例如：需要包含对话、使用比喻手法、设置反转结局等..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            disabled={loading}
                          />
                        </div>
                      </>
                    )}

                    {/* 错误和成功提示 */}
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    )}
                    {success && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600">{success}</p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="submit"
                        disabled={loading || !formData.topic.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            {isInspirationMode ? (
                              <Lightbulb className="w-4 h-4 mr-2" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            {isInspirationMode 
                              ? (isPlusMode ? '创意组合' : '生成灵感')
                              : '开始AI写作'
                            }
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={handleClear}
                        variant="outline"
                        disabled={loading}
                        className="flex-1"
                      >
                        清空表单
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：结果显示 */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>生成结果</span>
                    {result && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {wordCount} 字
                        </span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {result 
                      ? (isInspirationMode ? '生成的灵感点子如下' : 'AI生成的写作内容如下')
                      : (isInspirationMode ? '填写左侧表单并点击"生成灵感"' : '填写左侧表单并点击"开始AI写作"')
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-4">
                      {/* 结果内容 */}
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        <div className="prose prose-blue max-w-none">
                          {result.split('\n').map((line, index) => (
                            <p key={index} className="mb-3">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          className="flex-1 min-w-[120px]"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              复制内容
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={handleSaveDraft}
                          variant="outline"
                          className="flex-1 min-w-[120px]"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          保存草稿
                        </Button>
                        
                        <Button
                          onClick={handleRegenerate}
                          className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          重新生成
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        等待生成内容
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        {isInspirationMode
                          ? '填写左侧的灵感设置，然后点击"生成灵感"按钮，AI将为你生成创意写作点子。'
                          : '填写左侧的写作表单，然后点击"开始AI写作"按钮，AI将为你生成独特的写作内容。'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 写作提示 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-gray-600" />
                写作提示与技巧
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">💡 提示1：明确主题</h3>
                  <p className="text-blue-700 text-sm">
                    清晰具体的主题能让AI更好地理解你的需求，生成更相关的内容。
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">🎨 提示2：选择风格</h3>
                  <p className="text-purple-700 text-sm">
                    不同的写作风格会产生截然不同的效果，根据内容选择合适的风格。
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">⚡ 提示3：调整参数</h3>
                  <p className="text-green-700 text-sm">
                    情绪强度和创意等级可以微调生成内容的情感和创新程度。
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