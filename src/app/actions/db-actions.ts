'use server'

import { createClient } from '@/lib/supabase/server'
import { dbService } from '@/lib/db-service'
import type {
  UserSettings,
  WritingHistory,
  Draft,
  InspirationCollection,
  WritingHistoryQuery,
  DraftsQuery,
  InspirationsQuery
} from '@/lib/db-types'

/**
 * 用户设置相关Server Actions
 */
export async function getUserSettings(): Promise<{
  success: boolean;
  data?: UserSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.userSettings.getUserSettings(user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户设置失败'
    }
  }
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<{
  success: boolean;
  data?: UserSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    // 获取当前设置
    const currentSettings = await dbService.userSettings.getUserSettings(user.id)
    if (!currentSettings.success) {
      return currentSettings
    }
    
    // 合并设置
    const mergedSettings: UserSettings = {
      ...currentSettings.data!,
      ...settings,
      userId: user.id
    }
    
    return await dbService.userSettings.saveUserSettings(mergedSettings)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存用户设置失败'
    }
  }
}

/**
 * 写作历史相关Server Actions
 */
export async function saveWritingHistory(history: Omit<WritingHistory, 'userId'>): Promise<{
  success: boolean;
  data?: WritingHistory;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const fullHistory: WritingHistory = {
      ...history,
      userId: user.id
    }
    
    return await dbService.writingHistory.saveWritingHistory(fullHistory)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存写作历史失败'
    }
  }
}

export async function getWritingHistory(query: Omit<WritingHistoryQuery, 'userId'>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const fullQuery: WritingHistoryQuery = {
      ...query,
      userId: user.id
    }
    
    return await dbService.writingHistory.getWritingHistory(fullQuery)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取写作历史失败'
    }
  }
}

export async function deleteWritingHistory(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.writingHistory.deleteWritingHistory(id, user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除写作历史失败'
    }
  }
}

export async function getUserWritingStats(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.writingHistory.getUserStats(user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户统计失败'
    }
  }
}

/**
 * 草稿相关Server Actions
 */
export async function saveDraft(draft: Omit<Draft, 'userId'>): Promise<{
  success: boolean;
  data?: Draft;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const fullDraft: Draft = {
      ...draft,
      userId: user.id
    }
    
    return await dbService.drafts.saveDraft(fullDraft)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存草稿失败'
    }
  }
}

export async function getDrafts(query: Omit<DraftsQuery, 'userId'>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const fullQuery: DraftsQuery = {
      ...query,
      userId: user.id
    }
    
    return await dbService.drafts.getDrafts(fullQuery)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取草稿列表失败'
    }
  }
}

export async function getDraft(id: string): Promise<{
  success: boolean;
  data?: Draft;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.drafts.getDraft(id, user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取草稿失败'
    }
  }
}

export async function deleteDraft(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.drafts.deleteDraft(id, user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除草稿失败'
    }
  }
}

export async function autoSaveDraft(draftData: {
  content: string;
  topic?: string;
  style?: string;
  emotionIntensity?: number;
  creativityLevel?: number;
  length?: string;
  additionalInstructions?: string;
  mode?: 'writing' | 'inspiration';
}): Promise<{
  success: boolean;
  data?: Draft;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const draft: Draft = {
      userId: user.id,
      content: draftData.content,
      topic: draftData.topic,
      style: draftData.style,
      emotionIntensity: draftData.emotionIntensity,
      creativityLevel: draftData.creativityLevel,
      length: draftData.length,
      additionalInstructions: draftData.additionalInstructions,
      mode: draftData.mode,
      isAutoSave: true,
      wordCount: 0,
      characterCount: 0
    }
    
    return await dbService.drafts.saveDraft(draft)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '自动保存草稿失败'
    }
  }
}

/**
 * 灵感收藏相关Server Actions
 */
export async function saveInspiration(inspiration: Omit<InspirationCollection, 'userId'>): Promise<{
  success: boolean;
  data?: InspirationCollection;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const fullInspiration: InspirationCollection = {
      ...inspiration,
      userId: user.id
    }
    
    return await dbService.inspirations.saveInspiration(fullInspiration)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存灵感失败'
    }
  }
}

export async function getInspirations(query: Omit<InspirationsQuery, 'userId'>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const fullQuery: InspirationsQuery = {
      ...query,
      userId: user.id
    }
    
    return await dbService.inspirations.getInspirations(fullQuery)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取灵感列表失败'
    }
  }
}

export async function getInspiration(id: string): Promise<{
  success: boolean;
  data?: InspirationCollection;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.inspirations.getInspiration(id, user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取灵感失败'
    }
  }
}

export async function deleteInspiration(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.inspirations.deleteInspiration(id, user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除灵感失败'
    }
  }
}

export async function getUserTags(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.inspirations.getUserTags(user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取标签失败'
    }
  }
}

export async function getUserCategories(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    return await dbService.inspirations.getUserCategories(user.id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取分类失败'
    }
  }
}

/**
 * 收藏当前AI生成内容
 */
export async function saveCurrentAIResult(resultData: {
  title: string;
  content: string;
  sourceData?: Record<string, any>;
  tags?: string[];
  category?: string;
}): Promise<{
  success: boolean;
  data?: InspirationCollection;
  error?: string;
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '用户未登录' }
    }
    
    const inspiration: InspirationCollection = {
      userId: user.id,
      title: resultData.title,
      content: resultData.content,
      sourceType: 'ai_generated',
      sourceData: resultData.sourceData,
      tags: resultData.tags || [],
      category: resultData.category,
      isFavorite: false
    }
    
    return await dbService.inspirations.saveInspiration(inspiration)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '收藏AI结果失败'
    }
  }
}