// 简化的API测试脚本
const OpenAI = require('openai');

console.log('🔍 灵现AI写作智能体 - API连接测试');
console.log('====================================\n');

// 测试配置
const TEST_CONFIG = {
  DEEPSEEK_API_KEY: 'sk-b10bd77612cf4c94bdc2e3e6411abb97',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
};

// 1. 测试API密钥有效性
console.log('1. 🔑 测试API密钥有效性');
console.log('--------------------------------');

const apiKey = TEST_CONFIG.DEEPSEEK_API_KEY;
console.log(`API密钥: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`密钥长度: ${apiKey.length} 字符`);

// 检查密钥格式
if (!apiKey.startsWith('sk-')) {
  console.log('❌ 错误: API密钥格式不正确（应以"sk-"开头）');
  process.exit(1);
}

if (apiKey.length < 20) {
  console.log('⚠️  警告: API密钥可能过短');
}

console.log('✅ API密钥格式检查通过\n');

// 2. 测试API端点连接
console.log('2. 🌐 测试API端点连接');
console.log('--------------------------------');

console.log(`API端点: ${TEST_CONFIG.DEEPSEEK_BASE_URL}`);

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: TEST_CONFIG.DEEPSEEK_BASE_URL,
});

async function testConnection() {
  try {
    console.log('发送测试请求...');
    
    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手，请用中文回复'
        },
        {
          role: 'user',
          content: '请用一句话证明API连接正常，并包含当前时间（格式：HH:MM）'
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ API连接成功！');
    console.log(`响应时间: ${duration}ms`);
    console.log(`响应内容: "${response.choices[0].message.content.trim()}"`);
    
    if (response.usage) {
      console.log(`Token使用: ${response.usage.total_tokens} (输入:${response.usage.prompt_tokens}, 输出:${response.usage.completion_tokens})`);
    }
    
    console.log(`请求ID: ${response.id}`);
    console.log(`模型: ${response.model}`);
    console.log(`创建时间: ${new Date(response.created * 1000).toLocaleString()}`);
    
    return { success: true, duration, response };
  } catch (error) {
    console.error('❌ API连接失败:');
    console.error(`错误类型: ${error.constructor.name}`);
    console.error(`错误信息: ${error.message}`);
    
    // 详细错误分析
    if (error.status) {
      console.error(`状态码: ${error.status}`);
      
      switch (error.status) {
        case 401:
          console.error('🔑 错误原因: 无效的API密钥或密钥已过期');
          console.error('   解决方案: 请检查API密钥是否正确，或重新生成密钥');
          break;
        case 403:
          console.error('🚫 错误原因: 权限不足或API密钥被限制');
          console.error('   解决方案: 检查账户状态和API权限');
          break;
        case 404:
          console.error('🔗 错误原因: API端点不存在或路径错误');
          console.error('   解决方案: 检查BASE_URL配置');
          break;
        case 429:
          console.error('⏱️  错误原因: 请求频率超限');
          console.error('   解决方案: 等待一段时间后重试');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('🌐 错误原因: 服务器内部错误或网络问题');
          console.error('   解决方案: 稍后重试，或检查网络连接');
          break;
        default:
          console.error('❓ 错误原因: 未知的HTTP错误');
      }
    }
    
    if (error.code) {
      console.error(`错误代码: ${error.code}`);
    }
    
    if (error.type) {
      console.error(`错误类型: ${error.type}`);
    }
    
    // 检查网络连接
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n🌐 网络连接问题检测:');
      console.error('   可能原因: 网络不可用、DNS解析失败或防火墙阻止');
      console.error('   解决方案: 检查网络连接，尝试ping api.deepseek.com');
    }
    
    return { success: false, error };
  }
}

// 3. 测试不同模型
async function testModels() {
  console.log('\n3. 🤖 测试可用模型');
  console.log('--------------------------------');
  
  const models = ['deepseek-chat', 'deepseek-coder'];
  const results = [];
  
  for (const model of models) {
    try {
      console.log(`测试模型: ${model}...`);
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: '用一句话介绍你自己'
          }
        ],
        max_tokens: 30,
      });
      
      console.log(`  ✅ ${model}: 可用`);
      console.log(`     响应: "${response.choices[0].message.content.trim()}"`);
      results.push({ model, available: true });
    } catch (error) {
      console.log(`  ❌ ${model}: 不可用 - ${error.message}`);
      results.push({ model, available: false, error: error.message });
    }
  }
  
  return results;
}

// 4. 测试流式响应
async function testStreaming() {
  console.log('\n4. ⚡ 测试流式响应');
  console.log('--------------------------------');
  
  try {
    console.log('开始流式请求...');
    
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '请用流式方式数到5，每个数字单独发送'
        }
      ],
      stream: true,
      max_tokens: 50,
    });

    let receivedChunks = 0;
    let fullContent = '';
    
    console.log('接收流式数据:');
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        receivedChunks++;
        fullContent += content;
        process.stdout.write(content);
      }
    }
    
    console.log('\n\n✅ 流式响应测试完成');
    console.log(`接收块数: ${receivedChunks}`);
    console.log(`总内容: "${fullContent}"`);
    
    return { success: true, chunks: receivedChunks };
  } catch (error) {
    console.error('❌ 流式响应测试失败:', error.message);
    return { success: false, error };
  }
}

// 5. 测试错误处理
async function testErrorCases() {
  console.log('\n5. 🐛 测试错误处理');
  console.log('--------------------------------');
  
  // 测试1: 无效的模型名称
  console.log('测试1: 无效模型名称...');
  try {
    await openai.chat.completions.create({
      model: 'invalid-model-name-123',
      messages: [{ role: 'user', content: '测试' }],
      max_tokens: 10,
    });
    console.log('  ❌ 应该失败但未失败');
  } catch (error) {
    console.log(`  ✅ 正确处理: ${error.status || '未知'} - ${error.message.substring(0, 50)}...`);
  }
  
  // 测试2: 过长的输入
  console.log('\n测试2: 超长输入...');
  try {
    const longText = '测试。'.repeat(10000); // 约20000字符
    await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: longText }],
      max_tokens: 10,
    });
    console.log('  ⚠️  长输入测试通过（可能被截断）');
  } catch (error) {
    console.log(`  ✅ 长输入限制: ${error.message.substring(0, 50)}...`);
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始API连接测试套件\n');
  
  // 测试基本连接
  const connectionResult = await testConnection();
  if (!connectionResult.success) {
    console.log('\n❌ 基本连接测试失败，停止后续测试');
    process.exit(1);
  }
  
  // 测试模型可用性
  const modelResults = await testModels();
  
  // 测试流式响应（可选）
  console.log('\n是否测试流式响应？(y/n)');
  // 这里简化，直接测试
  const streamResult = await testStreaming();
  
  // 测试错误处理
  await testErrorCases();
  
  // 输出总结
  console.log('\n📊 测试结果总结');
  console.log('================');
  console.log(`✅ API连接: ${connectionResult.success ? '成功' : '失败'}`);
  if (connectionResult.success) {
    console.log(`   响应时间: ${connectionResult.duration}ms`);
  }
  
  console.log(`✅ 模型测试: ${modelResults.filter(m => m.available).length}/${modelResults.length} 个模型可用`);
  
  console.log(`✅ 流式响应: ${streamResult.success ? '支持' : '不支持'}`);
  if (streamResult.success) {
    console.log(`   接收块数: ${streamResult.chunks}`);
  }
  
  console.log('\n🎉 API连接测试完成！');
  console.log('\n下一步建议:');
  console.log('1. 检查 .env.local 文件中的 ENABLE_REAL_AI 设置');
  console.log('2. 确保应用配置使用正确的API密钥');
  console.log('3. 测试Web界面功能');
  console.log('4. 监控API使用情况和费用');
  
  console.log('\n🔧 配置状态:');
  console.log(`   当前模式: ${process.env.ENABLE_REAL_AI === 'true' ? '真实AI模式' : '模拟模式'}`);
  console.log(`   默认模型: ${process.env.DEFAULT_MODEL_TYPE || '未设置'}`);
  console.log(`   API密钥: ${apiKey ? '已设置' : '未设置'}`);
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试过程中发生未预期的错误:', error);
  process.exit(1);
});