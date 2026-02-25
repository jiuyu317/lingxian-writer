import { createTestClient } from '@/lib/supabase/test-client'
import { NextResponse } from 'next/server'

// DELETE: 清理测试数据
export async function DELETE(request: Request) {
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
    
    // 清理所有测试数据表
    const tables = [
      'inspiration_collections',
      'drafts',
      'writing_history',
      'user_settings'
    ]
    
    const results: any = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId)
          .select()
        
        if (error) {
          results[table] = { success: false, error: error.message }
        } else {
          results[table] = { 
            success: true, 
            deletedCount: data?.length || 0 
          }
        }
      } catch (error: any) {
        results[table] = { success: false, error: error.message }
      }
    }
    
    // 统计清理结果
    const totalDeleted = Object.values(results).reduce((sum: number, result: any) => {
      return sum + (result.success ? result.deletedCount || 0 : 0)
    }, 0)
    
    const failedTables = Object.entries(results)
      .filter(([_, result]: [string, any]) => !result.success)
      .map(([table, _]) => table)
    
    if (failedTables.length > 0) {
      return NextResponse.json({
        success: false,
        error: `以下表清理失败: ${failedTables.join(', ')}`,
        results,
        totalDeleted
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `测试数据清理完成，共删除 ${totalDeleted} 条记录`,
      results,
      totalDeleted
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET: 查看测试数据统计
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
    
    // 查询各表数据统计
    const tables = [
      'user_settings',
      'writing_history',
      'drafts',
      'inspiration_collections'
    ]
    
    const stats: any = {}
    let totalRecords = 0
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        
        if (error) {
          stats[table] = { count: 0, error: error.message }
        } else {
          const tableCount = count || 0
          stats[table] = { count: tableCount }
          totalRecords += tableCount
        }
      } catch (error: any) {
        stats[table] = { count: 0, error: error.message }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        stats,
        totalRecords,
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