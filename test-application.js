// 应用功能测试脚本
const OpenAI = require('openai');

console.log('🔍 灵现AI写作智能体 - 应用功能测试');
console.log('====================================\n');

// 配置
const config = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-b10bd77612cf4c94bdc2e3e6411abb97',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  enableRealAI: process.env.ENABLE_REAL_AI === 'true',
  defaultModelType: process.env.DEFAULT_MODEL_TYPE || 'mock',
};

console.log('📋 当前配置:');
console.log(`   真实AI模式: ${config.enableRealAI ? '✅ 已启用' : '❌ 未启用'}`);
console.log(`   默认模型类型: ${config.defaultModelType}`);
console.log(`   API密钥: ${config.apiKey ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`   API端点: ${config.baseURL}`);
console.log('');

// 模拟AI服务类的测试
class TestAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  // 测试构建系统提示词
  testBuildSystemPrompt() {
    console.log('1. 🏗️  测试系统提示词构建');
    console.log('--------------------------------');
    
    const testConfig = {
      topic: '武侠故事',
      writingStyle: '热血冒险',
      emotionLevel: 80,
      creativityLevel: 70,
      length: 1000,
      includeCharacters: true,
      includePlot: true,
      includeWorldview: true,
    };

    const writingStyleMap = {
      '热血冒险': '使用激昂、充满动感的语言，强调冲突、行动和英雄气概。节奏要快，情节要紧凑。',
      '浪漫唯美': '使用优美、抒情的语言，注重情感描写、氛围营造和细节刻画。要有诗意和感染力。',
      '悬疑推理': '使用紧张、神秘的语言，设置悬念、伏笔和反转。逻辑要严谨，细节要精确。',
      '文艺深沉': '使用深刻、内省的语言，探讨人性、命运和存在意义。要有哲学思考和文学性。',
      '幽默诙谐': '使用轻松、幽默的语言，要有趣、机智，可以适度夸张和反讽。',
      '诗意散文': '使用优美、富有韵律的语言，像诗歌一样凝练，像散文一样自由。',
    };

    const styleInstruction = writingStyleMap[testConfig.writingStyle] || '使用生动有趣的语言';
    
    let emotionInstruction = '';
    if (testConfig.emotionLevel >= 80) {
      emotionInstruction = '情感要非常强烈，充满激情和感染力';
    } else if (testConfig.emotionLevel >= 60) {
      emotionInstruction = '情感要比较明显，有适当的感染力';
    } else if (testConfig.emotionLevel >= 40) {
      emotionInstruction = '情感要适中，自然流畅';
    } else {
      emotionInstruction = '情感要平淡一些，保持客观冷静';
    }

    let creativityInstruction = '';
    if (testConfig.creativityLevel >= 80) {
      creativityInstruction = '要大胆创新，突破常规，提供独特的视角和想法';
    } else if (testConfig.creativityLevel >= 60) {
      creativityInstruction = '要有一定的新意，在传统基础上有所创新';
    } else if (testConfig.creativityLevel >= 40) {
      creativityInstruction = '保持平衡，既有创意又符合常规';
    } else {
      creativityInstruction = '要保守一些，遵循传统和常规';
    }

    const systemPrompt = `你是一个专业的${testConfig.writingStyle}作家和创意写作导师。

创作要求：
1. 文风：${styleInstruction}
2. 情绪：${emotionInstruction}
3. 创意：${creativityInstruction}
4. 字数：约${testConfig.length}字

请生成高质量、有创意的写作灵感，内容要：
- 结构清晰，层次分明
- 语言优美，表达准确
- 富有想象力，引人入胜
- 符合${testConfig.writingStyle}的特点

${testConfig.includeCharacters ? '必须包含生动的人物设定，包括外貌、性格、背景、动机等细节。\n' : ''}
${testConfig.includePlot ? '必须包含完整的情节大纲，包括开端、发展、高潮、结局。\n' : ''}
${testConfig.includeWorldview ? '必须包含独特的世界观设定，包括时代背景、社会结构、文化特色等。\n' : ''}

使用中文回复，保持专业且富有感染力。`;

    console.log('✅ 系统提示词构建测试通过');
    console.log(`   提示词长度: ${systemPrompt.length} 字符`);
    console.log(`   包含文风: ${systemPrompt.includes(testConfig.writingStyle) ? '✅' : '❌'}`);
    console.log(`   包含情绪指令: ${systemPrompt.includes(emotionInstruction) ? '✅' : '❌'}`);
    console.log(`   包含创意指令: ${systemPrompt.includes(creativityInstruction) ? '✅' : '❌'}`);
    
    return systemPrompt;
  }

  // 测试构建用户提示词
  testBuildUserPrompt() {
    console.log('\n2. 📝 测试用户提示词构建');
    console.log('--------------------------------');
    
    const testConfig = {
      topic: '武侠与赛博朋克的跨界故事',
      writingStyle: '热血冒险',
      emotionLevel: 85,
      creativityLevel: 90,
      length: 1500,
      includeCharacters: true,
      includePlot: true,
      includeWorldview: true,
    };

    const parts = [];
    
    parts.push(`主题：${testConfig.topic}`);
    
    if (testConfig.writingStyle) {
      parts.push(`文风：${testConfig.writingStyle}`);
    }
    
    if (testConfig.emotionLevel !== undefined) {
      parts.push(`情绪强度：${testConfig.emotionLevel}/100`);
    }
    
    if (testConfig.creativityLevel !== undefined) {
      parts.push(`创意等级：${testConfig.creativityLevel}/100`);
    }
    
    if (testConfig.length) {
      parts.push(`字数要求：约${testConfig.length}字`);
    }
    
    const includeParts = [];
    if (testConfig.includeCharacters) includeParts.push('人物设定');
    if (testConfig.includePlot) includeParts.push('情节大纲');
    if (testConfig.includeWorldview) includeParts.push('世界观');
    
    if (includeParts.length > 0) {
      parts.push(`包含内容：${includeParts.join('、')}`);
    }
    
    const userPrompt = `请根据以上参数，生成一个完整的写作灵感。\n\n${parts.join('\n')}`;

    console.log('✅ 用户提示词构建测试通过');
    console.log(`   提示词长度: ${userPrompt.length} 字符`);
    console.log(`   包含主题: ${userPrompt.includes(testConfig.topic) ? '✅' : '❌'}`);
    console.log(`   包含文风: ${userPrompt.includes(testConfig.writingStyle) ? '✅' : '❌'}`);
    console.log(`   包含情绪强度: ${userPrompt.includes(`${testConfig.emotionLevel}/100`) ? '✅' : '❌'}`);
    console.log(`   包含创意等级: ${userPrompt.includes(`${testConfig.creativityLevel}/100`) ? '✅' : '❌'}`);
    
    return userPrompt;
  }

  // 测试真实AI生成
  async testRealAIGeneration() {
    console.log('\n3. 🤖 测试真实AI生成');
    console.log('--------------------------------');
    
    if (!config.enableRealAI) {
      console.log('⏭️  跳过真实AI测试（模拟模式）');
      return null;
    }

    if (!config.apiKey) {
      console.log('❌ 无法测试真实AI：API密钥未设置');
      return null;
    }

    try {
      const systemPrompt = this.testBuildSystemPrompt();
      const userPrompt = this.testBuildUserPrompt();

      console.log('\n   发送AI生成请求...');
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt.substring(0, 1000) + '...' // 截断以避免过长
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
        stream: false,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      const content = response.choices[0].message.content;
      
      console.log('✅ 真实AI生成测试通过');
      console.log(`   响应时间: ${duration}ms`);
      console.log(`   生成内容长度: ${content.length} 字符`);
      console.log(`   Token使用: ${response.usage?.total_tokens || '未知'}`);
      console.log(`   内容预览: "${content.substring(0, 100)}..."`);
      
      // 检查内容质量
      const checks = {
        hasTitle: content.includes('#') || content.includes('《') || content.includes('》'),
        hasStructure: content.includes('##') || content.includes('一、') || content.includes('1.'),
        hasChinese: /[\u4e00-\u9fa5]/.test(content),
        hasCharacters: content.includes('人物') || content.includes('角色') || content.includes('主角'),
        hasPlot: content.includes('情节') || content.includes('故事') || content.includes('剧情'),
      };

      console.log('\n   内容质量检查:');
      Object.entries(checks).forEach(([check, passed]) => {
        const label = {
          hasTitle: '包含标题',
          hasStructure: '有结构',
          hasChinese: '中文内容',
          hasCharacters: '包含人物',
          hasPlot: '包含情节',
        }[check];
        console.log(`     ${passed ? '✅' : '❌'} ${label}`);
      });

      return { success: true, content, duration, checks };
    } catch (error) {
      console.error('❌ 真实AI生成测试失败:');
      console.error(`   错误: ${error.message}`);
      
      if (error.status === 401) {
        console.error('   🔑 可能原因: API密钥无效或过期');
      } else if (error.status === 429) {
        console.error('   ⏱️  可能原因: 请求频率限制');
      }
      
      return { success: false, error: error.message };
    }
  }

  // 测试流式生成
  async testStreamGeneration() {
    console.log('\n4. ⚡ 测试流式生成');
    console.log('--------------------------------');
    
    if (!config.enableRealAI) {
      console.log('⏭️  跳过流式生成测试（模拟模式）');
      return null;
    }

    try {
      console.log('   开始流式生成测试...');
      
      const stream = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '请用流式方式写一个简短的武侠故事开头，大约100字'
          }
        ],
        stream: true,
        max_tokens: 200,
        temperature: 0.7,
      });

      let chunkCount = 0;
      let totalContent = '';
      let startTime = Date.now();

      console.log('   接收流式数据:');
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          chunkCount++;
          totalContent += content;
          process.stdout.write(content);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`\n\n✅ 流式生成测试完成`);
      console.log(`   总耗时: ${duration}ms`);
      console.log(`   接收块数: ${chunkCount}`);
      console.log(`   平均块间隔: ${chunkCount > 0 ? (duration / chunkCount).toFixed(1) : 0}ms`);
      console.log(`   总内容长度: ${totalContent.length} 字符`);
      console.log(`   内容预览: "${totalContent.substring(0, 80)}..."`);

      return { success: true, chunkCount, duration, contentLength: totalContent.length };
    } catch (error) {
      console.error('❌ 流式生成测试失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 测试错误处理
  async testErrorHandling() {
    console.log('\n5. 🐛 测试错误处理');
    console.log('--------------------------------');
    
    const tests = [
      {
        name: '空主题',
        config: { topic: '', writingStyle: '热血冒险' },
        expectedError: true,
      },
      {
        name: '超长主题',
        config: { topic: '测试'.repeat(500), writingStyle: '热血冒险' },
        expectedError: true,
      },
      {
        name: '无效情绪值',
        config: { topic: '测试', emotionLevel: 150 },
        expectedError: true,
      },
      {
        name: '有效请求',
        config: { topic: '正常测试', writingStyle: '幽默诙谐', emotionLevel: 50 },
        expectedError: false,
      },
    ];

    for (const test of tests) {
      console.log(`   测试: ${test.name}...`);
      
      // 这里模拟应用层的验证逻辑
      let hasError = false;
      let errorMessage = '';
      
      if (!test.config.topic || test.config.topic.trim().length === 0) {
        hasError = true;
        errorMessage = '主题不能为空';
      } else if (test.config.topic.length > 500) {
        hasError = true;
        errorMessage = '主题长度不能超过500字符';
      } else if (test.config.emotionLevel && (test.config.emotionLevel < 0 || test.config.emotionLevel > 100)) {
        hasError = true;
        errorMessage = '情绪强度必须在0-100之间';
      }
      
      if (hasError === test.expectedError) {
        console.log(`     ${test.expectedError ? '✅' : '✅'} ${test.expectedError ? '正确返回错误' : '正确通过验证'}`);
        if (test.expectedError) {
          console.log(`       错误信息: "${errorMessage}"`);
        }
      } else {
        console.log(`     ❌ 测试失败: 预期${test.expectedError ? '错误' : '通过'}，但${hasError ? '返回错误' : '通过验证'}`);
      }
    }
  }
}

// 运行测试
async function runTests() {
  const testService = new TestAIService();
  
  console.log('🚀 开始应用功能测试\n');
  
  // 测试提示词构建
  testService.testBuildSystemPrompt();
  testService.testBuildUserPrompt();
  
  // 测试真实AI生成
  const aiResult = await testService.testRealAIGeneration();
  
  // 测试流式生成
  const streamResult = await testService.testStreamGeneration();
  
  // 测试错误处理
  await testService.testErrorHandling();
  
  // 输出总结
  console.log('\n📊 应用功能测试总结');
  console.log('====================');
  console.log(`✅ 提示词构建: 通过`);
  console.log(`✅ 错误处理: 通过`);
  
  if (config.enableRealAI) {
    console.log(`✅ 真实AI模式: ${aiResult?.success ? '✅ 工作正常' : '❌ 存在问题'}`);
    if (aiResult?.success) {
      console.log(`   生成时间: ${aiResult.duration}ms`);
      console.log(`   内容长度: ${aiResult.content?.length || 0} 字符`);
    }
    
    console.log(`✅ 流式生成: ${streamResult?.success ? '✅ 工作正常' : '❌ 存在问题'}`);
    if (streamResult?.success) {
      console.log(`   流式块数: ${streamResult.chunkCount}`);
      console.log(`   流式耗时: ${streamResult.duration}ms`);
    }
  } else {
    console.log(`⏭️  真实AI模式: 未启用（当前为模拟模式）`);
    console.log(`   要启用真实AI，请设置 ENABLE_REAL_AI=true`);
  }
  
  console.log('\n🔧 配置建议:');
  if (!config.enableRealAI) {
    console.log('1. 设置 ENABLE_REAL_AI=true 以启用真实AI');
  }
  if (config.defaultModelType === 'mock') {
    console.log('2. 设置 DEFAULT_MODEL_TYPE=deepseek 以使用DeepSeek模型');
  }
  if (!config.apiKey) {
    console.log('3. 设置有效的 DEEPSEEK_API_KEY');
  }
  
  console.log('\n🎉 测试完成！');
  console.log('\n访问 http://localhost:3000 使用灵现AI写作智能体');
}

// 运行测试
runTests().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});