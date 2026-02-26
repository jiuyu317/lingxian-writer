/**
 * 数据库操作服务
 * 处理与Supabase数据库的交互
 */

import { createClient } from './supabase/client'
import type {
  UserSettings,
  WritingHistory,
  Draft,
  InspirationCollection,
  WritingHistoryQuery,
  DraftsQuery,
  InspirationsQuery,
  DbResult,
  PaginatedResult
} from './db-types'

/**
 * 用户设置相关操作
 */
export class UserSettingsService {
  /**
   * 获取用户设置
   */
  static async getUserSettings(userId: string): Promise<DbResult<UserSettings>> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        // 如果没有找到设置，创建默认设置
        if (error.code === 'PGRST116') {
          return await this.createDefaultSettings(userId)
        }
        return { success: false, error: error.message }
      }
      
      // 转换数据库字段到类型字段
      const settings: UserSettings = {
        id: data.id,
        userId: data.user_id,
        writingStyle: data.writing_style || 'balanced',
        emotionIntensity: data.emotion_intensity || 50,
        creativityLevel: data.creativity_level || 70,
        defaultLength: data.default_length || 'medium',
        theme: data.theme || 'light',
        fontSize: data.font_size || 'medium',
        autoSave: data.auto_save ?? true,
        autoSaveInterval: data.auto_save_interval || 30,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
      
      return { success: true, data: settings }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取用户设置失败' 
      }
    }
  }
  
  /**
   * 保存用户设置
   */
  static async saveUserSettings(settings: UserSettings): Promise<DbResult<UserSettings>> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: settings.userId,
          writing_style: settings.writingStyle,
          emotion_intensity: settings.emotionIntensity,
          creativity_level: settings.creativityLevel,
          default_length: settings.defaultLength,
          theme: settings.theme,
          font_size: settings.fontSize,
          auto_save: settings.autoSave,
          auto_save_interval: settings.autoSaveInterval,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // 转换返回的数据
      const result: UserSettings = {
        id: data.id,
        userId: data.user_id,
        writingStyle: data.writing_style,
        emotionIntensity: data.emotion_intensity,
        creativityLevel: data.creativity_level,
        defaultLength: data.default_length,
        theme: data.theme,
        fontSize: data.font_size,
        autoSave: data.auto_save,
        autoSaveInterval: data.auto_save_interval,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存用户设置失败' 
      }
    }
  }
  
  /**
   * 创建默认用户设置
   */
  private static async createDefaultSettings(userId: string): Promise<DbResult<UserSettings>> {
    try {
      const supabase = createClient()
      
      const defaultSettings = {
        user_id: userId,
        writing_style: 'balanced',
        emotion_intensity: 50,
        creativity_level: 70,
        default_length: 'medium',
        theme: 'light',
        font_size: 'medium',
        auto_save: true,
        auto_save_interval: 30
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const settings: UserSettings = {
        id: data.id,
        userId: data.user_id,
        writingStyle: data.writing_style,
        emotionIntensity: data.emotion_intensity,
        creativityLevel: data.creativity_level,
        defaultLength: data.default_length,
        theme: data.theme,
        fontSize: data.font_size,
        autoSave: data.auto_save,
        autoSaveInterval: data.auto_save_interval,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
      
      return { success: true, data: settings }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '创建默认设置失败' 
      }
    }
  }
}

/**
 * 写作历史相关操作
 */
export class WritingHistoryService {
  /**
   * 保存写作历史
   */
  static async saveWritingHistory(history: WritingHistory): Promise<DbResult<WritingHistory>> {
    try {
      const supabase = createClient()
      
      // 计算字数和字符数
      const wordCount = history.content.trim().split(/\s+/).length
      const characterCount = history.content.length
      
      const { data, error } = await supabase
        .from('writing_history')
        .insert({
          user_id: history.userId,
          topic: history.topic,
          style: history.style,
          emotion_intensity: history.emotionIntensity,
          creativity_level: history.creativityLevel,
          length: history.length,
          additional_instructions: history.additionalInstructions,
          mode: history.mode,
          content: history.content,
          tokens_used: history.tokensUsed,
          model_used: history.modelUsed,
          estimated_cost: history.estimatedCost,
          word_count: wordCount,
          character_count: characterCount
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const result: WritingHistory = {
        id: data.id,
        userId: data.user_id,
        topic: data.topic,
        style: data.style,
        emotionIntensity: data.emotion_intensity,
        creativityLevel: data.creativity_level,
        length: data.length,
        additionalInstructions: data.additional_instructions,
        mode: data.mode as 'writing' | 'inspiration',
        content: data.content,
        tokensUsed: data.tokens_used,
        modelUsed: data.model_used,
        estimatedCost: data.estimated_cost,
        wordCount: data.word_count,
        characterCount: data.character_count,
        createdAt: new Date(data.created_at)
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存写作历史失败' 
      }
    }
  }
  
  /**
   * 获取用户写作历史
   */
  static async getWritingHistory(query: WritingHistoryQuery): Promise<DbResult<PaginatedResult<WritingHistory>>> {
    try {
      const supabase = createClient()
      const page = query.page || 1
      const pageSize = query.pageSize || 20
      const start = (page - 1) * pageSize
      
      let supabaseQuery = supabase
        .from('writing_history')
        .select('*', { count: 'exact' })
        .eq('user_id', query.userId)
        .order(query.sortBy || 'created_at', { ascending: query.sortOrder === 'asc' })
        .range(start, start + pageSize - 1)
      
      // 添加筛选条件
      if (query.startDate) {
        supabaseQuery = supabaseQuery.gte('created_at', query.startDate.toISOString())
      }
      if (query.endDate) {
        supabaseQuery = supabaseQuery.lte('created_at', query.endDate.toISOString())
      }
      if (query.topic) {
        supabaseQuery = supabaseQuery.ilike('topic', `%${query.topic}%`)
      }
      if (query.mode) {
        supabaseQuery = supabaseQuery.eq('mode', query.mode)
      }
      
      const { data, error, count } = await supabaseQuery
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const items: WritingHistory[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        topic: item.topic,
        style: item.style,
        emotionIntensity: item.emotion_intensity,
        creativityLevel: item.creativity_level,
        length: item.length,
        additionalInstructions: item.additional_instructions,
        mode: item.mode as 'writing' | 'inspiration',
        content: item.content,
        tokensUsed: item.tokens_used,
        modelUsed: item.model_used,
        estimatedCost: item.estimated_cost,
        wordCount: item.word_count,
        characterCount: item.character_count,
        createdAt: new Date(item.created_at)
      }))
      
      const total = count || 0
      const totalPages = Math.ceil(total / pageSize)
      
      const result: PaginatedResult<WritingHistory> = {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取写作历史失败' 
      }
    }
  }
  
  /**
   * 删除写作历史
   */
  static async deleteWritingHistory(id: string, userId: string): Promise<DbResult<boolean>> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('writing_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '删除写作历史失败' 
      }
    }
  }
  
  /**
   * 获取用户写作统计
   */
  static async getUserStats(userId: string): Promise<DbResult<any>> {
    try {
      const supabase = createClient()
      
      // 获取总写作次数
      const { count: totalWritings, error: countError } = await supabase
        .from('writing_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      if (countError) {
        return { success: false, error: countError.message }
      }
      
      // 获取token使用统计
      const { data: tokenData, error: tokenError } = await supabase
        .from('writing_history')
        .select('tokens_used, estimated_cost')
        .eq('user_id', userId)
      
      if (tokenError) {
        return { success: false, error: tokenError.message }
      }
      
      const totalTokensUsed = tokenData.reduce((sum, item) => sum + (item.tokens_used || 0), 0)
      const totalCost = tokenData.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
      
      // 获取时间范围
      const { data: dateData, error: dateError } = await supabase
        .from('writing_history')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
      
      if (dateError) {
        return { success: false, error: dateError.message }
      }
      
      const firstWritingDate = dateData.length > 0 ? new Date(dateData[0].created_at) : null
      const lastWritingDate = new Date() // 假设最后写作时间是现在
      
      const stats = {
        userId,
        totalWritings: totalWritings || 0,
        totalTokensUsed,
        totalCost,
        firstWritingDate,
        lastWritingDate
      }
      
      return { success: true, data: stats }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取用户统计失败' 
      }
    }
  }
}

/**
 * 草稿相关操作
 */
export class DraftsService {
  /**
   * 保存草稿
   */
  static async saveDraft(draft: Draft): Promise<DbResult<Draft>> {
    try {
      const supabase = createClient()
      
      // 🔍 调试：获取当前用户信息
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('🔍 saveDraft调试信息:')
      console.log('   当前认证用户:', user?.id || '未登录')
      console.log('   草稿userId:', draft.userId)
      console.log('   认证错误:', authError?.message || '无')
      
      // 验证用户认证状态
      if (!user) {
        console.log('❌ 用户未登录，无法保存草稿')
        return { 
          success: false, 
          error: '用户未登录，请重新登录后重试'
        }
      }
      
      // 验证userId匹配
      if (user.id !== draft.userId) {
        console.log(`❌ 用户ID不匹配: 当前用户=${user.id}, 草稿用户=${draft.userId}`)
        return { 
          success: false, 
          error: `权限错误: 无法为其他用户保存草稿`
        }
      }
      
      console.log(`✅ 用户验证通过: ${user.id}`)
      
      // 计算字数和字符数
      const wordCount = draft.content.trim().split(/\s+/).length
      const characterCount = draft.content.length
      
      const draftData = {
        user_id: draft.userId, // 确保使用正确的字段名
        title: draft.title || `草稿-${new Date().toLocaleString('zh-CN')}`,
        content: draft.content,
        topic: draft.topic,
        style: draft.style,
        emotion_intensity: draft.emotionIntensity,
        creativity_level: draft.creativityLevel,
        length: draft.length,
        additional_instructions: draft.additionalInstructions,
        mode: draft.mode,
        is_auto_save: draft.isAutoSave,
        word_count: wordCount,
        character_count: characterCount,
        last_saved_at: new Date().toISOString()
      }
      
      console.log('📝 准备保存草稿数据:', {
        user_id: draftData.user_id,
        title: draftData.title,
        word_count: draftData.word_count
      })
      
      let result
      if (draft.id) {
        // 更新现有草稿
        console.log(`🔄 更新草稿 ID: ${draft.id}`)
        const { data, error } = await supabase
          .from('drafts')
          .update(draftData)
          .eq('id', draft.id)
          .eq('user_id', user.id) // 确保只更新当前用户的草稿
          .select()
          .single()
        
        if (error) {
          console.log(`❌ 更新草稿失败: ${error.message}`)
          console.log('错误详情:', error)
          return { 
            success: false, 
            error: `更新草稿失败: ${error.message}`
          }
        }
        
        result = data
        console.log(`✅ 草稿更新成功: ${data.id}`)
      } else {
        // 创建新草稿
        console.log('🆕 创建新草稿')
        const { data, error } = await supabase
          .from('drafts')
          .insert(draftData)
          .select()
          .single()
        
        if (error) {
          console.log(`❌ 创建草稿失败: ${error.message}`)
          console.log('错误详情:', error)
          console.log('尝试插入的数据:', JSON.stringify(draftData, null, 2))
          
          // 检查是否是RLS错误
          if (error.message.includes('row-level security')) {
            return { 
              success: false, 
              error: '权限错误: 无法保存草稿。请确保已登录且用户ID正确。'
            }
          }
          
          return { 
            success: false, 
            error: `保存草稿失败: ${error.message}`
          }
        }
        
        result = data
        console.log(`✅ 草稿创建成功: ${data.id}`)
      }
      
      // 转换回应用格式
      const convertedResult: Draft = {
        id: result.id,
        userId: result.user_id,
        title: result.title,
        content: result.content,
        topic: result.topic,
        style: result.style,
        emotionIntensity: result.emotion_intensity,
        creativityLevel: result.creativity_level,
        length: result.length,
        additionalInstructions: result.additional_instructions,
        mode: result.mode,
        isAutoSave: result.is_auto_save,
        wordCount: result.word_count,
        characterCount: result.character_count,
        lastSavedAt: result.last_saved_at,
        createdAt: result.created_at
      }
      
      console.log(`🎉 草稿保存完成: ${convertedResult.id}`)
      return { success: true, data: convertedResult }
      
    } catch (error) {
      console.log('💥 saveDraft捕获到异常:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存草稿时发生未知错误'
      }
    }
  }
  
  /**
   * 获取用户草稿列表
   */
  static async getDrafts(query: DraftsQuery): Promise<DbResult<PaginatedResult<Draft>>> {
    try {
      const supabase = createClient()
      const page = query.page || 1
      const pageSize = query.pageSize || 20
      const start = (page - 1) * pageSize
      
      let supabaseQuery = supabase
        .from('drafts')
        .select('*', { count: 'exact' })
        .eq('user_id', query.userId)
        .order(query.sortBy || 'last_saved_at', { ascending: query.sortOrder === 'asc' })
        .range(start, start + pageSize - 1)
      
      // 添加筛选条件
      if (query.isAutoSave !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_auto_save', query.isAutoSave)
      }
      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`)
      }
      
      const { data, error, count } = await supabaseQuery
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const items: Draft[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        content: item.content,
        topic: item.topic,
        style: item.style,
        emotionIntensity: item.emotion_intensity,
        creativityLevel: item.creativity_level,
        length: item.length,
        additionalInstructions: item.additional_instructions,
        mode: item.mode as 'writing' | 'inspiration',
        isAutoSave: item.is_auto_save,
        wordCount: item.word_count,
        characterCount: item.character_count,
        lastSavedAt: new Date(item.last_saved_at),
        createdAt: new Date(item.created_at)
      }))
      
      const total = count || 0
      const totalPages = Math.ceil(total / pageSize)
      
      const result: PaginatedResult<Draft> = {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取草稿列表失败' 
      }
    }
  }
  
  /**
   * 获取单个草稿
   */
  static async getDraft(id: string, userId: string): Promise<DbResult<Draft>> {
    try {
      const supabase = createClient()
      
      // 验证用户认证
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: '用户未登录' }
      }
      
      // 验证用户ID匹配
      if (user.id !== userId) {
        console.log(`⚠️  用户ID不匹配: 当前用户=${user.id}, 请求用户=${userId}`)
        return { success: false, error: '权限错误: 无法访问其他用户的草稿' }
      }
      
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)  // 确保只查询当前用户的草稿
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // 转换格式
      const draft: Draft = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        topic: data.topic,
        style: data.style,
        emotionIntensity: data.emotion_intensity,
        creativityLevel: data.creativity_level,
        length: data.length,
        additionalInstructions: data.additional_instructions,
        mode: data.mode,
        isAutoSave: data.is_auto_save,
        wordCount: data.word_count,
        characterCount: data.character_count,
        lastSavedAt: data.last_saved_at,
        createdAt: data.created_at
      }
      
      return { success: true, data: draft }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取草稿失败'
      }
    }
  }
  
  /**
   * 删除草稿
   */
  static async deleteDraft(id: string, userId: string): Promise<DbResult<boolean>> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '删除草稿失败' 
      }
    }
  }
  
  /**
   * 清理旧的自动保存草稿
   */
  static async cleanupOldAutoSaveDrafts(userId: string, daysToKeep: number = 7): Promise<DbResult<number>> {
    try {
      const supabase = createClient()
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      const { data, error } = await supabase
        .from('drafts')
        .delete()
        .eq('user_id', userId)
        .eq('is_auto_save', true)
        .lt('last_saved_at', cutoffDate.toISOString())
        .select()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data?.length || 0 }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '清理草稿失败' 
      }
    }
  }
}

/**
 * 灵感收藏相关操作
 */
export class InspirationService {
  /**
   * 保存灵感收藏
   */
  static async saveInspiration(inspiration: InspirationCollection): Promise<DbResult<InspirationCollection>> {
    try {
      const supabase = createClient()
      
      const inspirationData = {
        user_id: inspiration.userId,
        title: inspiration.title,
        content: inspiration.content,
        source_type: inspiration.sourceType,
        source_data: inspiration.sourceData,
        tags: inspiration.tags,
        category: inspiration.category,
        is_favorite: inspiration.isFavorite,
        rating: inspiration.rating
      }
      
      let result
      if (inspiration.id) {
        // 更新现有灵感
        const { data, error } = await supabase
          .from('inspiration_collections')
          .update(inspirationData)
          .eq('id', inspiration.id)
          .eq('user_id', inspiration.userId)
          .select()
          .single()
        
        if (error) {
          return { success: false, error: error.message }
        }
        result = data
      } else {
        // 创建新灵感
        const { data, error } = await supabase
          .from('inspiration_collections')
          .insert(inspirationData)
          .select()
          .single()
        
        if (error) {
          return { success: false, error: error.message }
        }
        result = data
      }
      
      const savedInspiration: InspirationCollection = {
        id: result.id,
        userId: result.user_id,
        title: result.title,
        content: result.content,
        sourceType: result.source_type as 'ai_generated' | 'manual' | 'imported',
        sourceData: result.source_data,
        tags: result.tags || [],
        category: result.category,
        isFavorite: result.is_favorite,
        rating: result.rating,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at)
      }
      
      return { success: true, data: savedInspiration }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '保存灵感失败' 
      }
    }
  }
  
  /**
   * 获取灵感收藏列表
   */
  static async getInspirations(query: InspirationsQuery): Promise<DbResult<PaginatedResult<InspirationCollection>>> {
    try {
      const supabase = createClient()
      const page = query.page || 1
      const pageSize = query.pageSize || 20
      const start = (page - 1) * pageSize
      
      let supabaseQuery = supabase
        .from('inspiration_collections')
        .select('*', { count: 'exact' })
        .eq('user_id', query.userId)
        .order(query.sortBy || 'created_at', { ascending: query.sortOrder === 'asc' })
        .range(start, start + pageSize - 1)
      
      // 添加筛选条件
      if (query.isFavorite !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_favorite', query.isFavorite)
      }
      if (query.category) {
        supabaseQuery = supabaseQuery.eq('category', query.category)
      }
      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.contains('tags', query.tags)
      }
      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`)
      }
      
      const { data, error, count } = await supabaseQuery
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const items: InspirationCollection[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        content: item.content,
        sourceType: item.source_type as 'ai_generated' | 'manual' | 'imported',
        sourceData: item.source_data,
        tags: item.tags || [],
        category: item.category,
        isFavorite: item.is_favorite,
        rating: item.rating,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }))
      
      const total = count || 0
      const totalPages = Math.ceil(total / pageSize)
      
      const result: PaginatedResult<InspirationCollection> = {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取灵感列表失败' 
      }
    }
  }
  
  /**
   * 获取单个灵感
   */
  static async getInspiration(id: string, userId: string): Promise<DbResult<InspirationCollection>> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('inspiration_collections')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      const inspiration: InspirationCollection = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        sourceType: data.source_type as 'ai_generated' | 'manual' | 'imported',
        sourceData: data.source_data,
        tags: data.tags || [],
        category: data.category,
        isFavorite: data.is_favorite,
        rating: data.rating,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
      
      return { success: true, data: inspiration }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取灵感失败' 
      }
    }
  }
  
  /**
   * 删除灵感
   */
  static async deleteInspiration(id: string, userId: string): Promise<DbResult<boolean>> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('inspiration_collections')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '删除灵感失败' 
      }
    }
  }
  
  /**
   * 获取用户的灵感标签
   */
  static async getUserTags(userId: string): Promise<DbResult<string[]>> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('inspiration_collections')
        .select('tags')
        .eq('user_id', userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // 提取所有标签并去重
      const allTags = data.flatMap(item => item.tags || [])
      const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim())
      
      return { success: true, data: uniqueTags }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取标签失败' 
      }
    }
  }
  
  /**
   * 获取用户的灵感分类
   */
  static async getUserCategories(userId: string): Promise<DbResult<string[]>> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('inspiration_collections')
        .select('category')
        .eq('user_id', userId)
        .not('category', 'is', null)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // 提取所有分类并去重
      const categories = data.map(item => item.category).filter(Boolean)
      const uniqueCategories = [...new Set(categories)] as string[]
      
      return { success: true, data: uniqueCategories }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取分类失败' 
      }
    }
  }
}

/**
 * 导出所有服务
 */
export const dbService = {
  userSettings: UserSettingsService,
  writingHistory: WritingHistoryService,
  drafts: DraftsService,
  inspirations: InspirationService
}