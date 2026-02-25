/**
 * AI写作服务
 * 处理与DeepSeek API的交互
 */

export interface WritingRequest {
  topic: string
  style: string
  emotionIntensity: number
  creativityLevel: number
  length: string
  additionalInstructions?: string
  mode?: 'inspiration' | 'writing' // 新增模式参数
}

export interface WritingResponse {
  content: string
  tokensUsed: number
  model: string
  duration: number
  error?: string
}

export interface WritingSession {
  id: string
  userId: string
  request: WritingRequest
  response: WritingResponse
  createdAt: Date
  updatedAt: Date
}

/**
 * 生成写作内容（非流式）
 */
export async function generateWritingContent(
  request: WritingRequest
): Promise<WritingResponse> {
  try {
    console.log('开始生成写作内容:', request)
    
    // 构建提示词
    const prompt = buildWritingPrompt(request)
    
    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的写作助手，擅长生成各种类型的创意内容。请根据用户的要求生成高质量、有创意的写作内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: getMaxTokens(request.length, request.mode),
        temperature: getTemperature(request.creativityLevel),
        stream: false
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API错误:', errorData)
      throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0,
      model: data.model,
      duration: 0, // 实际应用中可以从响应头获取
    }
  } catch (error) {
    console.error('生成写作内容失败:', error)
    return {
      content: '',
      tokensUsed: 0,
      model: 'deepseek-chat',
      duration: 0,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 流式生成写作内容
 */
export async function* generateWritingContentStream(
  request: WritingRequest
): AsyncGenerator<string, void, unknown> {
  try {
    console.log('开始流式生成写作内容:', request)
    
    // 构建提示词
    const prompt = buildWritingPrompt(request)
    
    // 调用DeepSeek API（流式）
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的写作助手，擅长生成各种类型的创意内容。请根据用户的要求生成高质量、有创意的写作内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: getMaxTokens(request.length, request.mode),
        temperature: getTemperature(request.creativityLevel),
        stream: true
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一个数据块
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('流式生成失败:', error)
    throw error
  }
}

/**
 * 构建写作提示词
 */
function buildWritingPrompt(request: WritingRequest): string {
  const { topic, style, emotionIntensity, creativityLevel, length, additionalInstructions, mode } = request
  
  const styleMap: Record<string, string> = {
    'adventure': '热血冒险风格，充满动作和紧张感',
    'romantic': '浪漫唯美风格，情感细腻动人',
    'mystery': '悬疑推理风格，情节曲折离奇',
    'literary': '文艺深沉风格，语言优美富有哲理',
    'humorous': '幽默诙谐风格，轻松有趣',
    'balanced': '平衡风格，自然流畅',
    'creative': '创意优先，富有想象力',
    'professional': '专业正式风格，结构严谨',
    'casual': '轻松随意风格，亲切自然',
    'poetic': '诗意优美风格，语言富有韵律'
  }
  
  const lengthMap: Record<string, string> = {
    'short': '简短精炼，100-200字左右',
    'medium': '中等长度，300-500字左右',
    'long': '长篇详细，800-1000字左右',
    'detailed': '非常详细，1500字以上'
  }
  
  const emotionText = getEmotionText(emotionIntensity)
  const creativityText = getCreativityText(creativityLevel)
  
  // 如果是创意灵感模式，使用专门的提示词
  if (mode === 'inspiration') {
    let prompt = `【创意灵感模式 - 极致创意要求】
    
请生成让人眼前一亮的创意写作点子，具体要求：

🔥 核心主题：${topic || '任意创意主题'}
🎨 创意风格：${styleMap[style] || style}
💥 情感冲击：${emotionText}（强度${emotionIntensity}/100）
🚀 创意等级：${creativityText}（等级${creativityLevel}/100 - 已拉满！）
📏 字数建议：控制在200-400字左右，确保创意完整性

💡 生成要求：
1. 必须新颖独特，避免陈词滥调
2. 要有冲击力，让读者眼前一亮
3. 语言精炼，每句话都有价值
4. 创意密度高，信息量饱满
5. 确保内容完整性，不要因为字数限制而截断创意
6. 可以是一个完整的灵感点子，也可以是多个相关点子

🎯 质量标准：
- 创意性：★★★★★（必须满分）
- 新颖度：★★★★★（必须前所未见）
- 冲击力：★★★★★（必须让人印象深刻）
- 完整性：★★★★★（确保创意完整表达）
- 实用性：★★★★☆（可以实际用于写作）`

    if (additionalInstructions && additionalInstructions.trim()) {
      prompt += `\n\n📝 额外要求：${additionalInstructions}`
    }

    prompt += `\n\n请开始生成极致创意的写作灵感：`

    return prompt
  }
  
  // 普通写作模式
  let prompt = `请根据以下要求生成写作内容：

主题：${topic}
写作风格：${styleMap[style] || style}
情感强度：${emotionText}
创意等级：${creativityText}
输出长度：${lengthMap[length] || length}`

  if (additionalInstructions && additionalInstructions.trim()) {
    prompt += `\n额外要求：${additionalInstructions}`
  }

  prompt += `\n\n请生成高质量的写作内容，注意保持风格一致，情感表达恰当，创意元素丰富。`

  return prompt
}

/**
 * 根据情感强度获取描述文本
 */
function getEmotionText(intensity: number): string {
  if (intensity < 30) return '平静舒缓'
  if (intensity < 70) return '适中自然'
  return '激烈强烈'
}

/**
 * 根据创意等级获取描述文本
 */
function getCreativityText(level: number): string {
  if (level < 30) return '保守传统'
  if (level < 70) return '平衡适中'
  return '创新突破'
}

/**
 * 根据长度选择获取最大token数
 */
function getMaxTokens(length: string, mode?: string): number {
  const tokenMap: Record<string, number> = {
    'short': 500, // 放宽限制，确保内容完整性（约300-400字）
    'medium': 1000,
    'long': 2000,
    'detailed': 4000
  }
  
  // 如果是创意灵感模式，给予适当限制但保证内容完整
  if (mode === 'inspiration' && length === 'short') {
    return 400 // 适当限制，但保证创意完整性（约250-350字）
  }
  
  return tokenMap[length] || 1000
}

/**
 * 根据创意等级获取温度参数
 */
function getTemperature(creativityLevel: number): number {
  // 将0-100的创意等级映射到0.5-1.2的温度范围
  return 0.5 + (creativityLevel / 100) * 0.7
}

/**
 * 验证写作请求
 */
export function validateWritingRequest(request: WritingRequest): string[] {
  const errors: string[] = []
  
  if (!request.topic || request.topic.trim().length < 2) {
    errors.push('写作主题不能为空且至少需要2个字符')
  }
  
  if (!request.style) {
    errors.push('请选择写作风格')
  }
  
  if (request.emotionIntensity < 0 || request.emotionIntensity > 100) {
    errors.push('情感强度必须在0-100之间')
  }
  
  if (request.creativityLevel < 0 || request.creativityLevel > 100) {
    errors.push('创意等级必须在0-100之间')
  }
  
  if (!request.length) {
    errors.push('请选择输出长度')
  }
  
  return errors
}

/**
 * 保存写作会话到本地存储（临时方案）
 */
export function saveWritingSessionToLocal(session: Omit<WritingSession, 'id' | 'createdAt' | 'updatedAt'>): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const fullSession: WritingSession = {
    ...session,
    id: sessionId,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  try {
    // 获取现有会话
    const existingSessions = JSON.parse(localStorage.getItem('writing_sessions') || '[]')
    
    // 添加新会话（最多保存50个）
    const updatedSessions = [fullSession, ...existingSessions].slice(0, 50)
    
    // 保存回本地存储
    localStorage.setItem('writing_sessions', JSON.stringify(updatedSessions))
    
    return sessionId
  } catch (error) {
    console.error('保存写作会话失败:', error)
    return sessionId
  }
}

/**
 * 从本地存储获取写作会话
 */
export function getWritingSessionsFromLocal(userId: string): WritingSession[] {
  try {
    const sessions = JSON.parse(localStorage.getItem('writing_sessions') || '[]')
    return sessions.filter((session: WritingSession) => session.userId === userId)
  } catch (error) {
    console.error('获取写作会话失败:', error)
    return []
  }
}

/**
 * 删除写作会话
 */
export function deleteWritingSessionFromLocal(sessionId: string): boolean {
  try {
    const sessions = JSON.parse(localStorage.getItem('writing_sessions') || '[]')
    const updatedSessions = sessions.filter((session: WritingSession) => session.id !== sessionId)
    localStorage.setItem('writing_sessions', JSON.stringify(updatedSessions))
    return true
  } catch (error) {
    console.error('删除写作会话失败:', error)
    return false
  }
}