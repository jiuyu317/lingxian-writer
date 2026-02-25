#!/usr/bin/env node

/**
 * 简化版AI连接测试
 */

const fs = require('fs')
const path = require('path')

async function testAIConnection() {
  console.log('🔍 AI连接测试')
  console.log('='.repeat(50))
  
  // 检查环境文件
  console.log('\n1. 📋 检查环境文件:')
  const envPath = path.join(__dirname, '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.log('   ❌ 找不到 .env.local 文件')
    return false
  }
  
  console.log('   ✅ .env.local 文件存在')
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const hasDeepseekKey = envContent.includes('DEEPSEEK_API_KEY=')
  const hasRealAI = envContent.includes('ENABLE_REAL_AI=true')
  
  console.log(`   DeepSeek密钥: ${hasDeepseekKey ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`   启用真实AI: ${hasRealAI ? '✅ 是' : '❌ 否'}`)
  
  if (!hasDeepseekKey) {
    console.log('\n❌ 错误: 未配置DeepSeek API密钥')
    return false
  }
  
  // 提取API密钥
  const keyMatch = envContent.match(/DEEPSEEK_API_KEY=(.+)/)
  const apiKey = keyMatch ? keyMatch[1].trim() : ''
  
  if (!apiKey) {
    console.log('\n❌ 错误: API密钥为空')
    return false
  }
  
  console.log(`   API密钥格式: ${apiKey.startsWith('sk-') ? '✅ 有效' : '⚠️  可能无效'}`)
  
  // 测试API连接
  console.log('\n2. 🌐 测试API连接:')
  try {
    const testData = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手，请用一句话回复"AI连接测试成功"'
        },
        {
          role: 'user',
          content: '测试连接'
        }
      ],
      max_tokens: 20,
      temperature: 0.7,
      stream: false
    }
    
    console.log('   发送测试请求到DeepSeek API...')
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(testData)
    })
    
    if (!response.ok) {
      console.log(`   ❌ API请求失败 (${response.status})`)
      try {
        const errorData = await response.json()
        console.log(`      错误信息: ${JSON.stringify(errorData)}`)
      } catch {
        console.log(`      错误详情: ${await response.text()}`)
      }
      return false
    }
    
    const data = await response.json()
    console.log('   ✅ API连接成功！')
    console.log(`      模型: ${data.model}`)
    console.log(`      回复: ${data.choices[0]?.message?.content || '无内容'}`)
    console.log(`      Token使用: ${data.usage?.total_tokens || '未知'}`)
    
  } catch (error) {
    console.log(`   ❌ API连接失败:`)
    console.log(`      错误: ${error.message}`)
    console.log(`      提示: 请检查网络连接和API密钥`)
    return false
  }
  
  // 检查文件结构
  console.log('\n3. 📁 检查文件结构:')
  const requiredFiles = [
    'src/lib/ai-writing-service.ts',
    'src/app/actions/writing.ts',
    'src/app/write/page.tsx'
  ]
  
  let allFilesExist = true
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file))
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
    if (!exists) allFilesExist = false
  })
  
  if (!allFilesExist) {
    console.log('   ❌ 缺少必要的文件')
    return false
  }
  
  console.log('   ✅ 所有必需文件都存在')
  
  // 检查应用状态
  console.log('\n4. 🖥️  检查应用状态:')
  try {
    const { execSync } = require('child_process')
    const isRunning = execSync('lsof -ti:3000 2>/dev/null || echo ""', { encoding: 'utf8' }).trim()
    
    if (isRunning) {
      console.log('   ✅ 应用正在运行 (端口3000)')
      
      // 快速HTTP测试
      try {
        execSync('curl -s -f http://localhost:3000 > /dev/null 2>&1', { encoding: 'utf8' })
        console.log('   ✅ 网站可正常访问')
      } catch {
        console.log('   ⚠️  网站可能无法访问')
      }
    } else {
      console.log('   ⚠️  应用未运行')
      console.log('      启动命令: npm run dev')
    }
    
  } catch (error) {
    console.log(`   ⚠️  无法检查应用状态: ${error.message}`)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('🎯 测试完成')
  console.log('='.repeat(50))
  
  console.log('\n✅ 关键检查通过:')
  console.log('1. 环境配置正确')
  console.log('2. DeepSeek API连接成功')
  console.log('3. 所有必需文件存在')
  
  console.log('\n🚀 立即测试:')
  console.log('1. 访问: http://localhost:3000')
  console.log('2. 登录账户')
  console.log('3. 点击"创意灵感"进入写作页面')
  console.log('4. 填写表单并点击"开始AI写作"')
  
  console.log('\n💡 使用提示:')
  console.log('- 写作主题要具体明确')
  console.log('- 可以调整情绪强度和创意等级')
  console.log('- 生成的内容可以复制或保存')
  
  console.log('\n✨ AI写作功能已准备就绪！')
  return true
}

// 运行测试
testAIConnection().then(success => {
  if (success) {
    console.log('\n🎉 可以开始使用AI写作功能了！')
    process.exit(0)
  } else {
    console.log('\n❌ 需要修复上述问题')
    process.exit(1)
  }
}).catch(error => {
  console.error('测试错误:', error)
  process.exit(1)
})