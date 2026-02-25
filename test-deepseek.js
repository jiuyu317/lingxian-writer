#!/usr/bin/env node

/**
 * DeepSeek API集成测试脚本
 * 在项目目录内运行：node test-deepseek.js
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// 加载环境变量
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ 无法读取环境变量文件:', envPath);
  process.exit(1);
}

// 解析环境变量
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// 检查DeepSeek API密钥
const DEEPSEEK_API_KEY = envVars.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = envVars.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('你的DeepSeek_API密钥')) {
  console.error('❌ 请先在 .env.local 文件中配置有效的DeepSeek API密钥');
  console.log('📝 编辑文件:', envPath);
  console.log('🔑 将 DEEPSEEK_API_KEY 设置为你的实际API密钥');
  process.exit(1);
}

console.log('🔍 检查DeepSeek配置...');
console.log('📌 API密钥:', DEEPSEEK_API_KEY.substring(0, 10) + '...');
console.log('🌐 基础URL:', DEEPSEEK_BASE_URL);

// 创建OpenAI客户端（兼容DeepSeek API）
const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
});

async function testConnection() {
  console.log('\n🔗 测试DeepSeek API连接...');
  
  try {
    const response = await openai.models.list();
    console.log('✅ API连接成功！');
    console.log('📋 可用模型:');
    response.data.forEach(model => {
      console.log(`   - ${model.id} (创建时间: ${new Date(model.created * 1000).toLocaleDateString()})`);
    });
    return true;
  } catch (error) {
    console.error('❌ API连接失败:', error.message);
    if (error.response) {
      console.error('📊 响应状态:', error.response.status);
      console.error('📄 响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testSimpleChat() {
  console.log('\n💬 测试简单聊天功能...');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '你好！请用一句话介绍你自己。'
        }
      ],
      max_tokens: 100,
    });

    console.log('✅ 聊天测试成功！');
    console.log('🤖 AI回复:', response.choices[0].message.content);
    console.log('🔢 使用token数:', response.usage.total_tokens);
    
    return true;
  } catch (error) {
    console.error('❌ 聊天测试失败:', error.message);
    return false;
  }
}

async function testWritingPrompt() {
  console.log('\n✍️  测试写作提示词...');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的写作助手，擅长生成创意写作灵感。请用中文回复。'
        },
        {
          role: 'user',
          content: '请为一个武侠故事生成一个简短的开头（约100字）。'
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    console.log('✅ 写作提示词测试成功！');
    console.log('📝 生成内容:');
    console.log('---');
    console.log(response.choices[0].message.content);
    console.log('---');
    console.log('🔢 使用token数:', response.usage.total_tokens);
    
    return true;
  } catch (error) {
    console.error('❌ 写作提示词测试失败:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 开始DeepSeek API集成测试\n');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'API连接测试', func: testConnection },
    { name: '简单聊天测试', func: testSimpleChat },
    { name: '写作提示词测试', func: testWritingPrompt },
  ];

  let allPassed = true;
  
  for (const test of tests) {
    console.log(`\n🧪 ${test.name}`);
    console.log('-'.repeat(30));
    
    const passed = await test.func();
    if (!passed) {
      allPassed = false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 所有测试通过！DeepSeek集成正常。');
    console.log('\n📋 下一步：');
    console.log('1. 启动灵现网站: npm run dev');
    console.log('2. 访问 http://localhost:3000');
    console.log('3. 测试完整的AI写作功能');
  } else {
    console.log('⚠️  部分测试失败，请检查配置。');
    console.log('\n🔧 故障排除：');
    console.log('1. 检查API密钥是否正确');
    console.log('2. 检查网络连接');
    console.log('3. 查看DeepSeek服务状态');
    console.log('4. 检查环境变量配置');
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('💥 测试运行失败:', error);
  process.exit(1);
});