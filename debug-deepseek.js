#!/usr/bin/env node

/**
 * DeepSeek API调试脚本
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

const DEEPSEEK_API_KEY = envVars.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = envVars.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

console.log('🔍 DeepSeek配置检查:');
console.log('📌 API密钥:', DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 10) + '...' : '未设置');
console.log('🌐 基础URL:', DEEPSEEK_BASE_URL);

// 创建OpenAI客户端
const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
  timeout: 10000, // 10秒超时
});

async function testDirectAPI() {
  console.log('\n🔗 测试直接API调用...');
  
  try {
    // 测试1: 列出模型
    console.log('📋 测试1: 列出可用模型');
    const models = await openai.models.list();
    console.log('✅ 模型列表成功:', models.data.length, '个模型');
    
    // 测试2: 简单聊天（非流式）
    console.log('\n💬 测试2: 简单聊天（非流式）');
    const chatResponse = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: '你好，请回复"测试成功"' }
      ],
      max_tokens: 50,
    });
    console.log('✅ 聊天成功:', chatResponse.choices[0].message.content);
    
    // 测试3: 流式聊天
    console.log('\n🌊 测试3: 流式聊天');
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: '用流式方式说"流式测试成功"' }
      ],
      stream: true,
      max_tokens: 50,
    });
    
    console.log('✅ 流式连接建立');
    let streamContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        streamContent += content;
        process.stdout.write(content);
      }
    }
    console.log('\n✅ 流式接收完成');
    
    // 测试4: 使用灵现的提示词格式
    console.log('\n✍️  测试4: 灵现提示词格式');
    const systemPrompt = `你是一个专业的武侠作家和创意写作导师。

创作要求：
1. 文风：使用激昂、充满动感的语言，强调冲突、行动和英雄气概。节奏要快，情节要紧凑。
2. 情绪：情感要比较明显，有适当的感染力
3. 创意：要有一定的新意，在传统基础上有所创新
4. 字数：约100字

请生成高质量、有创意的写作灵感，内容要：
- 结构清晰，层次分明
- 语言优美，表达准确
- 富有想象力，引人入胜
- 符合武侠的特点

必须包含生动的人物设定。
必须包含完整的情节大纲。
必须包含独特的世界观设定。

使用中文回复，保持专业且富有感染力。`;

    const userPrompt = `请根据以上参数，生成一个完整的写作灵感。

主题：武侠测试
文风：热血冒险
情绪强度：70/100
创意等级：85/100
字数要求：约100字
包含内容：人物设定、情节大纲、世界观`;

    const writingResponse = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.85,
    });
    
    console.log('✅ 写作提示词测试成功！');
    console.log('📝 生成内容预览:', writingResponse.choices[0].message.content.substring(0, 150) + '...');
    
    return true;
    
  } catch (error) {
    console.error('❌ API调用失败:', error.message);
    
    if (error instanceof OpenAI.APIError) {
      console.error('📊 API错误详情:');
      console.error('  状态:', error.status);
      console.error('  错误:', error.error);
      console.error('  代码:', error.code);
      console.error('  类型:', error.type);
    }
    
    if (error.response) {
      console.error('📄 响应头:', error.response.headers);
      console.error('📊 响应状态:', error.response.status);
      console.error('📝 响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function testNetwork() {
  console.log('\n🌐 测试网络连接...');
  
  try {
    // 测试是否能访问DeepSeek API
    const https = require('https');
    
    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/v1/models',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }, (res) => {
        console.log(`✅ 网络连接正常 (状态码: ${res.statusCode})`);
        resolve(true);
      });
      
      req.on('error', (error) => {
        console.error('❌ 网络连接失败:', error.message);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.error('❌ 网络连接超时');
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
    
  } catch (error) {
    console.error('❌ 网络测试失败:', error.message);
    return false;
  }
}

async function runDebug() {
  console.log('🔧 DeepSeek API调试工具\n');
  console.log('='.repeat(50));
  
  // 检查API密钥
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('你的DeepSeek_API密钥')) {
    console.error('❌ API密钥未配置或使用默认值');
    console.log('💡 请编辑 .env.local 文件设置正确的API密钥');
    return;
  }
  
  // 测试网络
  const networkOk = await testNetwork();
  if (!networkOk) {
    console.log('\n⚠️  网络连接有问题，请检查：');
    console.log('1. 网络连接是否正常');
    console.log('2. 是否能访问 https://api.deepseek.com');
    console.log('3. 防火墙或代理设置');
    return;
  }
  
  // 测试API
  const apiOk = await testDirectAPI();
  
  console.log('\n' + '='.repeat(50));
  
  if (apiOk) {
    console.log('🎉 所有测试通过！DeepSeek API工作正常。');
    console.log('\n🔧 问题可能出现在：');
    console.log('1. Next.js API路由配置');
    console.log('2. 前端流式处理逻辑');
    console.log('3. 服务器端错误处理');
  } else {
    console.log('⚠️  API测试失败，可能原因：');
    console.log('1. API密钥无效或过期');
    console.log('2. DeepSeek服务暂时不可用');
    console.log('3. 账户额度不足');
    console.log('4. 区域限制（某些地区可能无法访问）');
  }
  
  console.log('\n💡 建议：');
  console.log('1. 访问 https://platform.deepseek.com 检查API密钥状态');
  console.log('2. 查看DeepSeek服务状态公告');
  console.log('3. 尝试使用其他网络环境');
  console.log('4. 暂时使用模拟模式：设置 DEFAULT_MODEL_TYPE=mock');
}

runDebug().catch(error => {
  console.error('💥 调试运行失败:', error);
});