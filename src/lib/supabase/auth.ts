import { createClient } from './server'

/**
 * 获取当前用户会话
 */
export async function getSession() {
  const supabase = await createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('获取会话失败:', error)
    return null
  }
}

/**
 * 获取当前用户信息
 */
export async function getUser() {
  const session = await getSession()
  if (!session) return null
  
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}

/**
 * 获取用户ID
 */
export async function getUserId() {
  const user = await getUser()
  return user?.id || null
}

/**
 * 获取用户邮箱
 */
export async function getUserEmail() {
  const user = await getUser()
  return user?.email || null
}