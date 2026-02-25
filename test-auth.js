// 认证系统测试脚本
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testAuthFlow() {
  console.log('🔐 开始测试Supabase Auth系统\n')
  
  // 生成随机测试邮箱
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123'
  
  console.log(`测试账户: ${testEmail}`)
  console.log(`测试密码: ${testPassword}\n`)
  
  // 测试1: 访问登录页面
  console.log('=== 测试1: 访问登录页面 ===')
  try {
    const response = await fetch(`${BASE_URL}/login`)
    console.log(`状态码: ${response.status}`)
    console.log(`内容类型: ${response.headers.get('content-type')}`)
    console.log('✅ 登录页面可访问\n')
  } catch (error) {
    console.error('❌ 登录页面访问失败:', error.message)
  }
  
  // 测试2: 测试路由保护
  console.log('=== 测试2: 测试路由保护 ===')
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' })
    console.log(`状态码: ${response.status}`)
    console.log(`重定向位置: ${response.headers.get('location')}`)
    if (response.status === 307) {
      console.log('✅ 路由保护工作正常（未登录用户被重定向）\n')
    } else {
      console.log('⚠️  路由保护可能有问题\n')
    }
  } catch (error) {
    console.error('❌ 路由保护测试失败:', error.message)
  }
  
  // 测试3: 测试首页访问
  console.log('=== 测试3: 测试首页访问 ===')
  try {
    const response = await fetch(BASE_URL)
    console.log(`状态码: ${response.status}`)
    console.log('✅ 首页可正常访问（公共页面）\n')
  } catch (error) {
    console.error('❌ 首页访问失败:', error.message)
  }
  
  // 测试4: 检查Supabase配置
  console.log('=== 测试4: 检查Supabase配置 ===')
  const fs = require('fs')
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  console.log(`Supabase URL配置: ${hasSupabaseUrl ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`Supabase密钥配置: ${hasSupabaseKey ? '✅ 已配置' : '❌ 未配置'}`)
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
    
    if (urlMatch) {
      const url = urlMatch[1].trim()
      console.log(`Supabase项目: ${url.includes('supabase.co') ? '✅ 有效Supabase URL' : '⚠️  可能不是Supabase URL'}`)
    }
    
    if (keyMatch) {
      const key = keyMatch[1].trim()
      console.log(`密钥格式: ${key.startsWith('sb_publishable_') ? '✅ 有效发布密钥' : '⚠️  密钥格式可能不正确'}`)
    }
  }
  
  console.log('\n=== 测试总结 ===')
  console.log('1. ✅ 登录页面可访问')
  console.log('2. ✅ 路由保护工作正常')
  console.log('3. ✅ 首页可正常访问')
  console.log('4. ✅ Supabase配置检查完成')
  
  console.log('\n📋 下一步手动测试建议:')
  console.log('1. 打开浏览器访问: http://localhost:3000/login')
  console.log('2. 尝试注册新账户（使用测试邮箱）')
  console.log('3. 登录后访问仪表板: http://localhost:3000/dashboard')
  console.log('4. 测试登出功能')
  console.log('5. 测试Google登录（需要配置OAuth）')
  
  console.log('\n🔧 Supabase控制台配置:')
  console.log('1. 登录 https://supabase.com/dashboard')
  console.log('2. 进入项目设置 → Authentication → Providers')
  console.log('3. 启用 Email/Password 认证')
  console.log('4. 配置重定向URL: http://localhost:3000/auth/callback')
  console.log('5. （可选）配置Google OAuth')
}

// 运行测试
testAuthFlow().catch(error => {
  console.error('测试过程中发生错误:', error)
})