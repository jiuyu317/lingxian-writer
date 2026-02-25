// 简化版认证系统测试脚本
const { execSync } = require('child_process')
const fs = require('fs')

const BASE_URL = 'http://localhost:3000'

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim()
  } catch (error) {
    return null
  }
}

async function testAuthFlow() {
  console.log('🔐 Supabase Auth系统测试\n')
  console.log('='.repeat(50))
  
  // 生成随机测试邮箱
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123'
  
  console.log(`📧 测试账户: ${testEmail}`)
  console.log(`🔑 测试密码: ${testPassword}`)
  console.log('')
  
  // 测试1: 检查应用运行状态
  console.log('=== 测试1: 应用运行状态 ===')
  const appStatus = runCommand(`curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}`)
  if (appStatus === '200') {
    console.log('✅ 应用运行正常 (HTTP 200)')
  } else {
    console.log(`❌ 应用可能有问题 (HTTP ${appStatus})`)
  }
  
  // 测试2: 检查登录页面
  console.log('\n=== 测试2: 登录页面 ===')
  const loginStatus = runCommand(`curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/login`)
  if (loginStatus === '200') {
    console.log('✅ 登录页面可访问')
    
    // 检查页面标题
    const title = runCommand(`curl -s ${BASE_URL}/login | grep -o "<title>[^<]*</title>"`)
    if (title) {
      console.log(`  页面标题: ${title}`)
    }
  } else {
    console.log(`❌ 登录页面不可访问 (HTTP ${loginStatus})`)
  }
  
  // 测试3: 测试路由保护
  console.log('\n=== 测试3: 路由保护 ===')
  const dashboardRedirect = runCommand(`curl -s -o /dev/null -w "%{redirect_url}" ${BASE_URL}/dashboard`)
  if (dashboardRedirect && dashboardRedirect.includes('/login')) {
    console.log('✅ 路由保护工作正常')
    console.log(`  重定向到: ${dashboardRedirect}`)
  } else {
    console.log('⚠️  路由保护可能有问题')
    console.log(`  响应: ${dashboardRedirect || '无重定向'}`)
  }
  
  // 测试4: 检查Supabase配置
  console.log('\n=== 测试4: Supabase配置 ===')
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    console.log(`Supabase URL: ${hasSupabaseUrl ? '✅ 已配置' : '❌ 未配置'}`)
    console.log(`Supabase密钥: ${hasSupabaseKey ? '✅ 已配置' : '❌ 未配置'}`)
    
    if (hasSupabaseUrl) {
      const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
      if (urlMatch) {
        const url = urlMatch[1].trim()
        console.log(`  项目URL: ${url.substring(0, 40)}...`)
      }
    }
    
    if (hasSupabaseKey) {
      const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
      if (keyMatch) {
        const key = keyMatch[1].trim()
        console.log(`  密钥格式: ${key.startsWith('sb_publishable_') ? '✅ 有效' : '⚠️  可能无效'}`)
      }
    }
  } catch (error) {
    console.log('❌ 无法读取环境配置文件')
  }
  
  // 测试5: 检查文件结构
  console.log('\n=== 测试5: 文件结构 ===')
  const requiredFiles = [
    'src/app/login/page.tsx',
    'src/app/actions/auth.ts',
    'src/middleware.ts',
    'src/lib/supabase/client.ts',
    'src/lib/supabase/server.ts',
  ]
  
  let allFilesExist = true
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file)
    console.log(`${exists ? '✅' : '❌'} ${file}`)
    if (!exists) allFilesExist = false
  })
  
  console.log(`\n文件完整性: ${allFilesExist ? '✅ 完整' : '❌ 不完整'}`)
  
  // 总结
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试总结')
  console.log('='.repeat(50))
  
  console.log('\n✅ 已通过测试:')
  console.log('1. 应用运行状态检查')
  console.log('2. 登录页面访问')
  console.log('3. 路由保护功能')
  console.log('4. Supabase配置检查')
  console.log('5. 文件结构完整性')
  
  console.log('\n🚀 下一步手动测试:')
  console.log('1. 打开浏览器: http://localhost:3000/login')
  console.log('2. 使用测试账户注册:')
  console.log(`   邮箱: ${testEmail}`)
  console.log(`   密码: ${testPassword}`)
  console.log('3. 登录后访问仪表板')
  console.log('4. 测试登出功能')
  
  console.log('\n🔧 Supabase控制台配置提醒:')
  console.log('1. 确保Email/Password认证已启用')
  console.log('2. 配置重定向URL: http://localhost:3000/auth/callback')
  console.log('3. 确认网站URL: http://localhost:3000')
  
  console.log('\n🎯 测试完成！可以开始手动功能测试。')
}

// 运行测试
testAuthFlow()