import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // 交换code获取session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 重定向到仪表板
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}