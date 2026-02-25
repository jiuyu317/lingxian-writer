import { createTestClient } from '@/lib/supabase/test-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createTestClient()
    
    // 测试数据库连接
    const { data, error } = await supabase
      .from('user_settings')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        tables: ['user_settings', 'writing_history', 'drafts', 'inspiration_collections'],
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}