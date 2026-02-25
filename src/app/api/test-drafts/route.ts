import { createTestClient } from '@/lib/supabase/test-client'
import { NextResponse } from 'next/server'

// GET: 获取草稿
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
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .order('last_saved_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    const formattedData = data.map(item => ({
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
      mode: item.mode,
      isAutoSave: item.is_auto_save,
      wordCount: item.word_count,
      characterCount: item.character_count,
      lastSavedAt: item.last_saved_at,
      createdAt: item.created_at
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
      manualCount: formattedData.filter(d => !d.isAutoSave).length,
      autoCount: formattedData.filter(d => d.isAutoSave).length
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: 创建草稿
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      title = '未命名草稿',
      content,
      topic = '',
      style = 'balanced',
      emotionIntensity = 50,
      creativityLevel = 70,
      length = 'medium',
      additionalInstructions = '',
      mode = 'writing',
      isAutoSave = false,
      draftType = 'manual' // 'manual' 或 'auto'
    } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId' },
        { status: 400 }
      )
    }
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少content' },
        { status: 400 }
      )
    }
    
    const supabase = createTestClient()
    
    // 根据draftType调整设置
    const finalIsAutoSave = draftType === 'auto' ? true : isAutoSave
    const finalTitle = draftType === 'auto' ? `自动保存草稿 ${new Date().toLocaleString('zh-CN')}` : title
    
    // 计算字数和字符数
    const wordCount = content.trim().split(/\s+/).length
    const characterCount = content.length
    
    const { data, error } = await supabase
      .from('drafts')
      .insert({
        user_id: userId,
        title: finalTitle,
        content,
        topic,
        style,
        emotion_intensity: emotionIntensity,
        creativity_level: creativityLevel,
        length,
        additional_instructions: additionalInstructions,
        mode,
        is_auto_save: finalIsAutoSave,
        word_count: wordCount,
        character_count: characterCount,
        last_saved_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
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
        title: data.title,
        content: data.content,
        isAutoSave: data.is_auto_save,
        wordCount: data.word_count,
        lastSavedAt: data.last_saved_at
      },
      message: `草稿已${finalIsAutoSave ? '自动' : '手动'}保存`
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}