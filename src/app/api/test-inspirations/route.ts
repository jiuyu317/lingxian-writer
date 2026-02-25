import { createTestClient } from '@/lib/supabase/test-client'
import { NextResponse } from 'next/server'

// GET: 获取灵感收藏
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
      .from('inspiration_collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
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
      sourceType: item.source_type,
      sourceData: item.source_data,
      tags: item.tags || [],
      category: item.category,
      isFavorite: item.is_favorite,
      rating: item.rating,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
      favoriteCount: formattedData.filter(i => i.isFavorite).length
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: 创建灵感收藏
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      title,
      content,
      sourceType = 'ai_generated',
      sourceData = {},
      tags = [],
      category = '未分类',
      isFavorite = false,
      rating
    } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId' },
        { status: 400 }
      )
    }
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '缺少title或content' },
        { status: 400 }
      )
    }
    
    const supabase = createTestClient()
    
    const { data, error } = await supabase
      .from('inspiration_collections')
      .insert({
        user_id: userId,
        title,
        content,
        source_type: sourceType,
        source_data: sourceData,
        tags: Array.isArray(tags) ? tags : [tags],
        category,
        is_favorite: isFavorite,
        rating
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
        tags: data.tags,
        category: data.category,
        isFavorite: data.is_favorite,
        createdAt: data.created_at
      },
      message: '灵感收藏已创建'
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}