import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // 测试登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('API登录错误:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          status: error.status 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at
        },
        session: !!data.session
      }
    });
    
  } catch (error: any) {
    console.error('API异常:', error);
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: '登录测试API',
    endpoints: {
      POST: '测试登录功能'
    },
    env: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      site_url: process.env.NEXT_PUBLIC_SITE_URL,
      node_env: process.env.NODE_ENV
    }
  });
}