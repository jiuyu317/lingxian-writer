// 完整的API测试脚本
const OpenAI = require('openai');
const fetch = require('node-fetch');

console.log('🔍 灵现AI写作智能体 - 完整API测试');
console.log('====================================\n');

// 测试配置
const TEST_CONFIG = {
  DEEPSEEK_API_KEY: 'sk-b10bd77612cf4c94bdc2e3e6411abb97',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
  LOCAL_API_URL: 'http://localhost:3000/api/generate',
};

// 测试用例
const TEST_CASES = [
  {
    name: '基础API连接测试',
    topic: '测试连接',
    writingStyle: '幽默诙谐',
    emotionLevel: 50,
    creativityLevel: 50,
    length: 100,
  },
  {
    name: '武侠故事生成测试',
    topic: '武侠江湖恩怨',
    writingStyle: '热血冒险',
    emotionLevel: 80,
    creativityLevel: 70,
    length: 500,
    includeCharacters: true,
    includePlot: true,
  },
  {
    name: '科幻故事生成测试',
    topic: '未来人工智能',
    writingStyle: '文艺深沉',
    emotionLevel: 60,
    creativityLevel: 90,
    length: 800,
    includeWorldview: true,
  },
];

// 1. 测试直接DeepSeek API连接
async function testDirectAPI() {
  console.log('1. 📡 测试直接DeepSeek API连接');
  console.log('--------------------------------');
  
  try {
    const openai = new OpenAI({
      apiKey: TEST_CONFIG.DEEPSEEK_API_KEY,
      baseURL: TEST_CONFIG.DEEPSEEK_BASE_URL,
    });

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '请用一句话证明API连接正常'
        }
      ],
      max_tokens: 50,
    });

    console.log('✅ 直接API连接成功');
    console.log(`   响应: "${response.choices[0].message.content.trim()}"`);
    console.log(`   Token使用: ${response.usage?.total_tokens || '未知'}`);
    return true;
  } catch (error) {
    console.error('❌ 直接API连接失败:');
    console.error(`   错误: ${error.message}`);
    
    if (error.response?.status) {
      console.error(`   状态码: ${error.response.status}`);
      
      // 常见错误分析
      if (error.response.status === 401) {
        console.error('   🔑 可能原因: API密钥无效或过期');
      } else if (error.response.status === 429) {
        console.error('   ⚠️  可能原因: 请求频率限制');
      } else if (error.response.status === 404) {
        console.error('   🔗 可能原因: API端点错误');
      }
    }
    return false;
  }
}

// 2. 测试本地API端点
async function testLocalAPI(testCase) {
  console.log(`\n2. 🖥️  测试本地API端点: ${testCase.name}`);
  console.log('--------------------------------');
  
  try {
    const response = await fetch(TEST_CONFIG.LOCAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ 本地API调用成功');
      console.log(`   状态码: ${response.status}`);
      console.log(`   生成ID: ${data.data?.generationId || '无'}`);
      console.log(`   模型: ${data.data?.modelUsed || '未知'}`);
      console.log(`   Token使用: ${data.data?.tokensUsed || '未知'}`);
      console.log(`   预估成本: $${data.data?.estimatedCost?.toFixed(6) || '0'}`);
      
      // 检查内容质量
      const content = data.data?.content || '';
      if (content.length > 0) {
        console.log(`   内容长度: ${content.length}字符`);
        console.log(`   内容预览: "${content.substring(0, 100)}..."`);
      }
      return true;
    } else {
      console.error('❌ 本地API调用失败:');
      console.error(`   状态码: ${response.status}`);
      console.error(`   错误: ${data.error || '未知错误'}`);
      console.error(`   消息: ${data.message || '无详细消息'}`);
      return false;
    }
  } catch (error) {
    console.error('❌ 本地API连接失败:');
    console.error(`   错误: ${error.message}`);
    
    // 检查本地服务器是否运行
    if (error.code === 'ECONNREFUSED') {
      console.error('   🔌 可能原因: 本地服务器未运行');
      console.error('   请运行: cd lingguang-website && npm run dev');
    }
    return false;
  }
}

// 3. 测试环境配置
async function testEnvironment() {
  console.log('\n3. ⚙️  测试环境配置');
  console.log('--------------------------------');
  
  const issues = [];
  
  // 检查API密钥格式
  if (!TEST_CONFIG.DEEPSEEK_API_KEY) {
    issues.push('❌ DEEPSEEK_API_KEY 未设置');
  } else if (!TEST_CONFIG.DEEPSEEK_API_KEY.startsWith('sk-')) {
    issues.push('⚠️  DEEPSEEK_API_KEY 格式可能不正确（应以sk-开头）');
  } else {
    console.log('✅ DEEPSEEK_API_KEY 格式正确');
  }
  
  // 检查API端点
  if (!TEST_CONFIG.DEEPSEEK_BASE_URL) {
    issues.push('❌ DEEPSEEK_BASE_URL 未设置');
  } else if (!TEST_CONFIG.DEEPSEEK_BASE_URL.startsWith('http')) {
    issues.push('⚠️  DEEPSEEK_BASE_URL 格式可能不正确');
  } else {
    console.log('✅ DEEPSEEK_BASE_URL 格式正确');
  }
  
  // 检查本地API端点
  if (!TEST_CONFIG.LOCAL_API_URL) {
    issues.push('❌ LOCAL_API_URL 未设置');
  } else {
    console.log('✅ LOCAL_API_URL 配置正确');
  }
  
  if (issues.length > 0) {
    console.log('发现以下问题:');
    issues.forEach(issue => console.log(`   ${issue}`));
    return false;
  }
  
  console.log('✅ 所有环境配置检查通过');
  return true;
}

// 4. 测试性能
async function testPerformance() {
  console.log('\n4. ⚡ 测试API性能');
  console.log('--------------------------------');
  
  try {
    const openai = new OpenAI({
      apiKey: TEST_CONFIG.DEEPSEEK_API_KEY,
      baseURL: TEST_CONFIG.DEEPSEEK_BASE_URL,
    });

    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '请回复"性能测试完成"'
        }
      ],
      max_tokens: 10,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ API响应时间: ${duration}ms`);
    
    if (duration < 1000) {
      console.log('   🚀 性能优秀（< 1秒）');
    } else if (duration < 3000) {
      console.log('   ⚡ 性能良好（1-3秒）');
    } else if (duration < 5000) {
      console.log('   ⏱️  性能一般（3-5秒）');
    } else {
      console.log('   🐌 性能较慢（> 5秒）');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
    return false;
  }
}

// 5. 测试错误处理
async function testErrorHandling() {
  console.log('\n5. 🐛 测试错误处理');
  console.log('--------------------------------');
  
  // 测试无效的API密钥
  try {
    const openai = new OpenAI({
      apiKey: 'sk-invalid-key-123456',
      baseURL: TEST_CONFIG.DEEPSEEK_BASE_URL,
    });

    await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: '测试' }],
      max_tokens: 10,
    });
    
    console.log('❌ 无效密钥测试失败 - 应该抛出错误但未抛出');
    return false;
  } catch (error) {
    if (error.status === 401) {
      console.log('✅ 无效密钥正确处理（返回401）');
      console.log(`   错误信息: ${error.message}`);
      return true;
    } else {
      console.log(`⚠️  无效密钥测试 - 收到错误但非401: ${error.status}`);
      return false;
    }
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始完整API测试套件\n');
  
  let allPassed = true;
  const results = [];
  
  // 测试环境配置
  const envPassed = await testEnvironment();
  results.push({ test: '环境配置', passed: envPassed });
  if (!envPassed) allPassed = false;
  
  // 测试直接API连接
  const directAPIPassed = await testDirectAPI();
  results.push({ test: '直接API连接', passed: directAPIPassed });
  if (!directAPIPassed) allPassed = false;
  
  // 测试性能
  const perfPassed = await testPerformance();
  results.push({ test: 'API性能', passed: perfPassed });
  if (!perfPassed) allPassed = false;
  
  // 测试错误处理
  const errorPassed = await testErrorHandling();
  results.push({ test: '错误处理', passed: errorPassed });
  
  // 测试本地API端点
  console.log('\n6. 🧪 测试本地API端点（多个测试用例）');
  console.log('--------------------------------');
  
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    console.log(`\n   测试用例 ${i + 1}: ${testCase.name}`);
    
    const localPassed = await testLocalAPI(testCase);
    results.push({ test: `本地API-${testCase.name}`, passed: localPassed });
    
    if (!localPassed) {
      allPassed = false;
      // 如果第一个测试用例失败，跳过其他的
      if (i === 0) {
        console.log('   ⏭️  跳过剩余测试用例（基础测试失败）');
        break;
      }
    }
  }
  
  // 输出总结
  console.log('\n📊 测试结果总结');
  console.log('================');
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 所有测试通过！灵现AI写作智能体API工作正常。');
    console.log('\n下一步建议:');
    console.log('1. 访问 http://localhost:3000 使用Web界面');
    console.log('2. 检查 .env.local 文件中的其他配置');
    console.log('3. 测试流式生成功能');
  } else {
    console.log('⚠️  部分测试失败，请检查以下问题:');
    console.log('\n常见问题排查:');
    console.log('1. 🔑 API密钥是否正确且未过期？');
    console.log('2. 🌐 网络连接是否正常？');
    console.log('3. 🖥️  本地服务器是否运行？(npm run dev)');
    console.log('4. ⚙️  环境变量配置是否正确？');
    console.log('\n详细错误信息请查看上面的测试输出。');
  }
  
  console.log('\n测试完成！');
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试过程中发生未预期的错误:', error);
  process.exit(1);
});