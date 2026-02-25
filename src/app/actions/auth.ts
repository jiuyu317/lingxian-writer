'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 邮箱密码注册
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('注册错误:', error.message)
      return {
        success: false,
        error: getErrorMessage(error.message),
        data: null,
      }
    }

    // 注册成功
    return {
      success: true,
      error: null,
      data: {
        user: data.user,
        session: data.session,
        requiresEmailConfirmation: !data.session, // 需要邮箱确认
      },
    }
  } catch (error) {
    console.error('注册异常:', error)
    return {
      success: false,
      error: '注册过程中发生错误',
      data: null,
    }
  }
}

/**
 * 邮箱密码登录
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('登录错误:', error.message)
      return {
        success: false,
        error: getErrorMessage(error.message),
        data: null,
      }
    }

    // 登录成功，重新验证路径
    revalidatePath('/', 'layout')
    
    return {
      success: true,
      error: null,
      data: {
        user: data.user,
        session: data.session,
      },
    }
  } catch (error) {
    console.error('登录异常:', error)
    return {
      success: false,
      error: '登录过程中发生错误',
      data: null,
    }
  }
}

/**
 * Google OAuth登录
 */
export async function signInWithGoogle() {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google登录错误:', error.message)
      return {
        success: false,
        error: getErrorMessage(error.message),
        data: null,
      }
    }

    // 重定向到Google授权页面
    if (data.url) {
      redirect(data.url)
    }

    return {
      success: true,
      error: null,
      data,
    }
  } catch (error) {
    console.error('Google登录异常:', error)
    return {
      success: false,
      error: 'Google登录过程中发生错误',
      data: null,
    }
  }
}

/**
 * 登出
 */
export async function signOut() {
  try {
    const supabase = await createServerClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('登出错误:', error.message)
      return {
        success: false,
        error: getErrorMessage(error.message),
        data: null,
      }
    }

    // 登出成功，重新验证路径并重定向
    revalidatePath('/', 'layout')
    redirect('/login')
    
    return {
      success: true,
      error: null,
      data: null,
    }
  } catch (error) {
    console.error('登出异常:', error)
    return {
      success: false,
      error: '登出过程中发生错误',
      data: null,
    }
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('获取用户错误:', error.message)
      return null
    }

    return user
  } catch (error) {
    console.error('获取用户异常:', error)
    return null
  }
}

/**
 * 获取当前会话
 */
export async function getCurrentSession() {
  try {
    const supabase = await createServerClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('获取会话错误:', error.message)
      return null
    }

    return session
  } catch (error) {
    console.error('获取会话异常:', error)
    return null
  }
}

/**
 * 错误消息处理
 */
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '请先验证您的邮箱',
    'User already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码至少需要6个字符',
    'Invalid email': '请输入有效的邮箱地址',
    'Email rate limit exceeded': '请求过于频繁，请稍后重试',
    'User not found': '用户不存在',
    'Network error': '网络错误，请检查连接',
  }

  return errorMessages[error] || error || '操作失败，请重试'
}

/**
 * 检查用户是否已登录
 */
export async function checkAuth() {
  const session = await getCurrentSession()
  return {
    isAuthenticated: !!session,
    user: session?.user || null,
  }
}