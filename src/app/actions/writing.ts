'use server'

import { generateWritingContent, validateWritingRequest, type WritingRequest } from '@/lib/ai-writing-service'
import { getCurrentUser } from './auth'

/**
 * 生成AI写作内容（Server Action）
 */
export async function generateAIContent(formData: FormData) {
  try {
    console.log('收到写作请求:', Object.fromEntries(formData.entries()))
    
    // 验证用户登录状态
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '请先登录',
        content: '',
        sessionId: ''
      }
    }
    
    // 解析表单数据
    const request: WritingRequest = {
      topic: formData.get('topic') as string || '',
      style: formData.get('style') as string || 'balanced',
      emotionIntensity: parseInt(formData.get('emotionIntensity') as string || '50'),
      creativityLevel: parseInt(formData.get('creativityLevel') as string || '70'),
      length: formData.get('length') as string || 'medium',
      additionalInstructions: formData.get('additionalInstructions') as string || '',
      mode: (formData.get('mode') as 'inspiration' | 'writing') || undefined
    }
    
    // 验证请求数据
    const validationErrors = validateWritingRequest(request)
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(', '),
        content: '',
        sessionId: ''
      }
    }
    
    // 调用AI服务生成内容
    console.log('调用AI服务生成内容...')
    const startTime = Date.now()
    
    const response = await generateWritingContent(request)
    
    const duration = Date.now() - startTime
    console.log(`生成完成，耗时: ${duration}ms, token使用: ${response.tokensUsed}`)
    
    if (response.error) {
      return {
        success: false,
        error: response.error,
        content: '',
        sessionId: ''
      }
    }
    
    // 生成会话ID（在实际应用中应该保存到数据库）
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      success: true,
      error: null,
      content: response.content,
      sessionId,
      metadata: {
        tokensUsed: response.tokensUsed,
        model: response.model,
        duration: response.duration || duration
      }
    }
    
  } catch (error) {
    console.error('生成AI内容失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成内容时发生错误',
      content: '',
      sessionId: ''
    }
  }
}

/**
 * 获取写作历史（临时使用本地存储，实际应该用数据库）
 */
export async function getWritingHistory() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '请先登录',
        sessions: []
      }
    }
    
    // 在实际应用中，这里应该从数据库获取
    // 临时返回空数组
    return {
      success: true,
      error: null,
      sessions: []
    }
    
  } catch (error) {
    console.error('获取写作历史失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取历史记录时发生错误',
      sessions: []
    }
  }
}

/**
 * 保存写作草稿
 */
export async function saveDraft(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '请先登录'
      }
    }
    
    const title = formData.get('title') as string || '未命名草稿'
    const content = formData.get('content') as string || ''
    
    if (!content.trim()) {
      return {
        success: false,
        error: '内容不能为空'
      }
    }
    
    // 在实际应用中，这里应该保存到数据库
    // 临时返回成功
    console.log('保存草稿:', { title, contentLength: content.length })
    
    return {
      success: true,
      error: null,
      draftId: `draft_${Date.now()}`
    }
    
  } catch (error) {
    console.error('保存草稿失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存草稿时发生错误'
    }
  }
}

/**
 * 测试AI连接
 */
export async function testAIConnection() {
  try {
    // 检查环境变量
    if (!process.env.DEEPSEEK_API_KEY) {
      return {
        success: false,
        error: '未配置DeepSeek API密钥',
        connected: false
      }
    }
    
    // 简单的API测试
    const testRequest: WritingRequest = {
      topic: '测试连接',
      style: 'balanced',
      emotionIntensity: 50,
      creativityLevel: 50,
      length: 'short'
    }
    
    const response = await generateWritingContent(testRequest)
    
    if (response.error) {
      return {
        success: false,
        error: response.error,
        connected: false
      }
    }
    
    return {
      success: true,
      error: null,
      connected: true,
      testResponse: response.content.substring(0, 100) + '...'
    }
    
  } catch (error) {
    console.error('测试AI连接失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '测试连接时发生错误',
      connected: false
    }
  }
}

/**
 * 获取写作统计
 */
export async function getWritingStats() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '请先登录',
        stats: null
      }
    }
    
    // 在实际应用中，这里应该从数据库获取统计数据
    // 临时返回模拟数据
    return {
      success: true,
      error: null,
      stats: {
        totalSessions: 0,
        totalWords: 0,
        favoriteStyle: 'balanced',
        averageCreativity: 70,
        lastSession: null
      }
    }
    
  } catch (error) {
    console.error('获取写作统计失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取统计时发生错误',
      stats: null
    }
  }
}