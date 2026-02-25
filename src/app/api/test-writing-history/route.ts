import { createTestClient } from '@/lib/supabase/test-client'
import { NextResponse } from 'next/server'

// GET: 获取写作历史
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
      .from('writing_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    const formattedData = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      topic: item.topic,
      style: item.style,
      emotionIntensity: item.emotion_intensity,
      creativityLevel: item.creativity_level,
      length: item.length,
      additionalInstructions: item.additional_instructions,
      mode: item.mode,
      content: item.content,
      tokensUsed: item.tokens_used,
      modelUsed: item.model_used,
      estimatedCost: item.estimated_cost,
      wordCount: item.word_count,
      characterCount: item.character_count,
      createdAt: item.created_at
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: 创建写作历史
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      topic,
      style = 'balanced',
      emotionIntensity = 50,
      creativityLevel = 70,
      length = 'medium',
      additionalInstructions = '',
      mode = 'writing',
      content,
      tokensUsed = 0,
      modelUsed = 'test-model',
      estimatedCost = 0,
      wordCount = 0,
      characterCount = 0
    } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId' },
        { status: 400 }
      )
    }
    
    if (!topic || !content) {
      return NextResponse.json(
        { success: false, error: '缺少topic或content' },
        { status: 400 }
      )
    }
    
    // 计算字数和字符数（如果未提供）
    const finalWordCount = wordCount || content.trim().split(/\s+/).length
    const finalCharacterCount = characterCount || content.length
    
    const supabase = createTestClient()
    
    const { data, error } = await supabase
      .from('writing_history')
      .insert({
        user_id: userId,
        topic,
        style,
        emotion_intensity: emotionIntensity,
        creativity_level: creativityLevel,
        length,
        additional_instructions: additionalInstructions,
        mode,
        content,
        tokens_used: tokensUsed,
        model_used: modelUsed,
        estimated_cost: estimatedCost,
        word_count: finalWordCount,
        character_count: finalCharacterCount
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
        topic: data.topic,
        content: data.content,
        wordCount: data.word_count,
        createdAt: data.created_at
      },
      message: '写作历史已创建'
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}