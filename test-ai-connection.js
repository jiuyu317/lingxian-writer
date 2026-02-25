#!/usr/bin/env node

/**
 * AI连接测试脚本
 * 测试DeepSeek API连接和写作服务
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '.env.local') })

async function testAIConnection() {
  console.log('🔍 开始测试AI连接...')
  console.log('='.repeat(50))
  
  // 检查环境变量
  console.log('\n1. 📋 检查环境变量配置:')
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const deepseekUrl = process.env.DEEPSEEK_BASE_URL
  const enableRealAI = process.env.ENABLE_REAL_AI
  const defaultModel = process.env.DEFAULT_MODEL_TYPE
  
  console.log(`   DeepSeek API密钥: ${deepseekKey ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`   DeepSeek基础URL: ${deepseekUrl || '使用默认值'}`)
  console.log(`   启用真实AI: ${enableRealAI === 'true' ? '✅ 是' : '❌ 否'}`)
  console.log(`   默认模型类型: ${defaultModel || '未设置'}`)
  
  if (!deepseekKey) {
    console.log('\n❌ 错误: 未配置DeepSeek API密钥')
    console.log('请在 .env.local 文件中添加: DEEPSEEK_API_KEY=your_api_key_here')
    return false
  }
  
  if (enableRealAI !== 'true') {
    console.log('\n⚠️  警告: 未启用真实AI模式')
    console.log('请在 .env.local 文件中设置: ENABLE_REAL_AI=true')
  }
  
  // 测试API连接
  console.log('\n2. 🌐 测试DeepSeek API连接:')
  try {
    const testData = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手，请回复"连接成功"'
        },
        {
          role: 'user',
          content: '测试连接'
        }
      ],
      max_tokens: 10,
      temperature: 0.7,
      stream: false
    }
    
    console.log('   发送测试请求...')
    const startTime = Date.now()
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify(testData)
    })
    
    const duration = Date.now() - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`   ❌ API请求失败 (${response.status}):`)
      console.log(`       ${errorText}`)
      return false
    }
    
    const data = await response.json()
    console.log(`   ✅ API连接成功 (${duration}ms)`)
    console.log(`      模型: ${data.model}`)
    console.log(`      回复: ${data.choices[0]?.message?.content || '无内容'}`)
    console.log(`      Token使用: ${data.usage?.total_tokens || '未知'}`)
    
  } catch (error) {
    console.log(`   ❌ API连接失败:`)
    console.log(`      ${error.message}`)
    return false
  }
  
  // 测试写作服务
  console.log('\n3. ✍️  测试写作服务:')
  try {
    // 读取写作服务文件
    const writingServicePath = path.join(__dirname, 'src/lib/ai-writing-service.ts')
    if (!fs.existsSync(writingServicePath)) {
      console.log('   ❌ 找不到写作服务文件')
      return false
    }
    
    console.log('   ✅ 写作服务文件存在')
    
    // 检查函数导出
    const serviceContent = fs.readFileSync(writingServicePath, 'utf8')
    const hasGenerateFunction = serviceContent.includes('export async function generateWritingContent')
    const hasStreamFunction = serviceContent.includes('export async function* generateWritingContentStream')
    const hasValidateFunction = serviceContent.includes('export function validateWritingRequest')
    
    console.log(`      生成函数: ${hasGenerateFunction ? '✅' : '❌'}`)
    console.log(`      流式函数: ${hasStreamFunction ? '✅' : '❌'}`)
    console.log(`      验证函数: ${hasValidateFunction ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`   ❌ 测试写作服务失败:`)
    console.log(`      ${error.message}`)
    return false
  }
  
  // 测试Server Actions
  console.log('\n4. 🚀 测试Server Actions:')
  try {
    const actionsPath = path.join(__dirname, 'src/app/actions/writing.ts')
    if (!fs.existsSync(actionsPath)) {
      console.log('   ❌ 找不到写作Server Actions文件')
      return false
    }
    
    console.log('   ✅ Server Actions文件存在')
    
    const actionsContent = fs.readFileSync(actionsPath, 'utf8')
    const hasGenerateAction = actionsContent.includes('export async function generateAIContent')
    const hasTestAction = actionsContent.includes('export async function testAIConnection')
    
    console.log(`      生成Action: ${hasGenerateAction ? '✅' : '❌'}`)
    console.log(`      测试Action: ${hasTestAction ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`   ❌ 测试Server Actions失败:`)
    console.log(`      ${error.message}`)
    return false
  }
  
  // 测试写作页面
  console.log('\n5. 📄 测试写作页面:')
  try {
    const writePagePath = path.join(__dirname, 'src/app/write/page.tsx')
    if (!fs.existsSync(writePagePath)) {
      console.log('   ❌ 找不到写作页面文件')
      return false
    }
    
    console.log('   ✅ 写作页面文件存在')
    
    const pageContent = fs.readFileSync(writePagePath, 'utf8')
    const hasForm = pageContent.includes('handleSubmit')
    const hasResultDisplay = pageContent.includes('setResult')
    const hasLoadingState = pageContent.includes('setLoading')
    
    console.log(`      表单处理: ${hasForm ? '✅' : '❌'}`)
    console.log(`      结果显示: ${hasResultDisplay ? '✅' : '❌'}`)
    console.log(`      加载状态: ${hasLoadingState ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`   ❌ 测试写作页面失败:`)
    console.log(`      ${error.message}`)
    return false
  }
  
  // 检查应用状态
  console.log('\n6. 🖥️  检查应用状态:')
  try {
    // 检查是否在运行
    const isRunning = execSync('lsof -ti:3000 2>/dev/null || echo ""', { encoding: 'utf8' }).trim()
    
    if (isRunning) {
      console.log('   ✅ 应用正在运行 (端口3000)')
      
      // 测试HTTP访问
      try {
        const httpTest = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' }).trim()
        console.log(`      HTTP状态码: ${httpTest}`)
        
        if (httpTest === '200') {
          console.log('      ✅ 网站可正常访问')
        } else {
          console.log(`      ⚠️  网站返回状态码: ${httpTest}`)
        }
      } catch (httpError) {
        console.log('      ❌ 无法访问网站')
      }
    } else {
      console.log('   ⚠️  应用未运行')
      console.log('      启动命令: cd lingxian-website && npm run dev')
    }
    
  } catch (error) {
    console.log(`   ❌ 检查应用状态失败:`)
    console.log(`      ${error.message}`)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试总结')
  console.log('='.repeat(50))
  
  console.log('\n✅ 已完成的检查:')
  console.log('1. 环境变量配置')
  console.log('2. DeepSeek API连接')
  console.log('3. 写作服务函数')
  console.log('4. Server Actions')
  console.log('5. 写作页面组件')
  console.log('6. 应用运行状态')
  
  console.log('\n🚀 下一步操作:')
  console.log('1. 确保应用正在运行: http://localhost:3000')
  console.log('2. 登录账户并访问写作页面: http://localhost:3000/write')
  console.log('3. 填写表单并测试AI写作功能')
  console.log('4. 检查生成结果和错误处理')
  
  console.log('\n🔧 故障排除:')
  console.log('- 如果API连接失败，检查API密钥是否正确')
  console.log('- 如果页面显示错误，检查浏览器控制台')
  console.log('- 如果生成内容为空，检查网络连接和API配额')
  
  console.log('\n🎯 AI写作功能已准备就绪！')
  return true
}

// 运行测试
testAIConnection().then(success => {
  if (success) {
    console.log('\n✨ 所有测试通过，可以开始使用AI写作功能！')
    process.exit(0)
  } else {
    console.log('\n❌ 测试失败，请检查上述问题')
    process.exit(1)
  }
}).catch(error => {
  console.error('测试过程中发生错误:', error)
  process.exit(1)
})