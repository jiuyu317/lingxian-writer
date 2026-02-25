/**
 * 测试专用的Supabase客户端
 * 使用服务端密钥绕过RLS进行测试
 */

import { createClient } from '@supabase/supabase-js'

// 创建使用服务端密钥的客户端
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('缺少Supabase配置。请确保设置了NEXT_PUBLIC_SUPABASE_URL和SUPABASE_SERVICE_ROLE_KEY环境变量。')
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  })
}

// 类型导出
export type TestSupabaseClient = ReturnType<typeof createTestClient>