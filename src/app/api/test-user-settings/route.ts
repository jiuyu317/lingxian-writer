import { createTestClient } from '@/lib/supabase/test-client'
import { NextResponse } from 'next/server'

// GET: 获取用户设置
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      )
    }
    
    const supabase = createTestClient()
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: null,
          message: '用户设置不存在'
        })
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        userId: data.user_id,
        writingStyle: data.writing_style,
        emotionIntensity: data.emotion_intensity,
        creativityLevel: data.creativity_level,
        defaultLength: data.default_length,
        autoSave: data.auto_save,
        autoSaveInterval: data.auto_save_interval,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: 创建或更新用户设置
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      writingStyle = 'balanced',
      emotionIntensity = 50,
      creativityLevel = 70,
      defaultLength = 'medium',
      autoSave = true,
      autoSaveInterval = 30
    } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId' },
        { status: 400 }
      )
    }
    
    const supabase = createTestClient()
    
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    let result
    if (existing) {
      // 更新现有设置
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          writing_style: writingStyle,
          emotion_intensity: emotionIntensity,
          creativity_level: creativityLevel,
          default_length: defaultLength,
          auto_save: autoSave,
          auto_save_interval: autoSaveInterval,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // 创建新设置
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          writing_style: writingStyle,
          emotion_intensity: emotionIntensity,
          creativity_level: creativityLevel,
          default_length: defaultLength,
          auto_save: autoSave,
          auto_save_interval: autoSaveInterval
        })
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        userId: result.user_id,
        writingStyle: result.writing_style,
        emotionIntensity: result.emotion_intensity,
        creativityLevel: result.creativity_level,
        defaultLength: result.default_length,
        autoSave: result.auto_save,
        autoSaveInterval: result.auto_save_interval
      },
      message: existing ? '用户设置已更新' : '用户设置已创建'
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}