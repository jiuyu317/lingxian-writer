// 测试流式API问题
console.log('🔍 诊断流式API的400 Model Not Exist错误');
console.log('==========================================\n');

// 模拟环境变量
process.env.ENABLE_REAL_AI = 'true';
process.env.OPENAI_API_KEY = ''; // 空字符串
process.env.DEEPSEEK_API_KEY = 'sk-b10bd77612cf4c94bdc2e3e6411abb97';
process.env.DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

console.log('环境变量状态:');
console.log('ENABLE_REAL_AI:', process.env.ENABLE_REAL_AI);
console.log('OPENAI_API_KEY:', '\"' + process.env.OPENAI_API_KEY + '\"', '(长度:', process.env.OPENAI_API_KEY.length, ')');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '已设置' : '未设置');
console.log('');

// 模拟AI服务中的DEFAULT_MODELS配置
const DEFAULT_MODELS = {
  openai: {
    type: 'openai',
    name: 'OpenAI GPT',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
    costPerInputToken: 0.0000005,
    costPerOutputToken: 0.0000015,
    maxTokens: 4000,
    enabled: !!process.env.OPENAI_API_KEY, // 关键！这里可能有问题
  },
  deepseek: {
    type: 'deepseek',
    name: 'DeepSeek Chat',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    costPerInputToken: 0.000000,
    costPerOutputToken: 0.000000,
    maxTokens: 4000,
    enabled: !!process.env.DEEPSEEK_API_KEY,
  },
  mock: {
    type: 'mock',
    name: '模拟模型',
    defaultModel: 'mock-model',
    costPerInputToken: 0,
    costPerOutputToken: 0,
    maxTokens: 4000,
    enabled: true,
  },
};

console.log('模型配置分析:');
console.log('1. OpenAI模型:');
console.log('   apiKey:', '\"' + DEFAULT_MODELS.openai.apiKey + '\"');
console.log('   !!apiKey:', !!DEFAULT_MODELS.openai.apiKey);
console.log('   enabled:', DEFAULT_MODELS.openai.enabled);
console.log('');

console.log('2. DeepSeek模型:');
console.log('   apiKey:', DEFAULT_MODELS.deepseek.apiKey ? '已设置' : '未设置');
console.log('   !!apiKey:', !!DEFAULT_MODELS.deepseek.apiKey);
console.log('   enabled:', DEFAULT_MODELS.deepseek.enabled);
console.log('');

// 模拟determineDefaultModel函数
function determineDefaultModel() {
  if (process.env.ENABLE_REAL_AI === 'true') {
    if (process.env.OPENAI_API_KEY) {
      console.log('逻辑: 选择了openai（因为OPENAI_API_KEY有值）');
      return 'openai';
    }
    if (process.env.DEEPSEEK_API_KEY) {
      console.log('逻辑: 选择了deepseek（因为DEEPSEEK_API_KEY有值）');
      return 'deepseek';
    }
  }
  console.log('逻辑: 选择了mock');
  return 'mock';
}

console.log('默认模型选择逻辑:');
const defaultModelType = determineDefaultModel();
console.log('结果:', defaultModelType);
console.log('');

// 检查可用模型
console.log('可用模型列表:');
Object.values(DEFAULT_MODELS).forEach(model => {
  if (model.enabled) {
    console.log(`✅ ${model.name} (${model.type})`);
  } else {
    console.log(`❌ ${model.name} (${model.type}) - 已禁用`);
  }
});
console.log('');

// 关键问题分析
console.log('🔍 问题分析:');
console.log('1. OpenAI模型的 enabled 计算:');
console.log('   !!process.env.OPENAI_API_KEY =', !!process.env.OPENAI_API_KEY);
console.log('   对于空字符串，这个值是:', !!'');
console.log('   所以 enabled =', !!process.env.OPENAI_API_KEY);

console.log('\n2. 但在 determineDefaultModel() 中:');
console.log('   if (process.env.OPENAI_API_KEY) 对于空字符串是:', !!process.env.OPENAI_API_KEY);

console.log('\n3. 矛盾点:');
console.log('   - 模型配置中: enabled = false (因为空字符串)');
console.log('   - 但模型选择逻辑中: if(OPENAI_API_KEY) = false (因为空字符串)');
console.log('   这应该导致选择deepseek，但实际选择了openai？');

console.log('\n4. 可能的原因:');
console.log('   a) 环境变量实际不是空字符串（可能有空格）');
console.log('   b) 代码中有其他地方覆盖了模型选择');
console.log('   c) 流式端点强制指定了 modelType: "openai"');
console.log('   d) AI服务初始化时环境变量不同');

// 测试实际.env.local文件内容
console.log('\n📄 检查.env.local文件:');
const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const openaiLine = envContent.split('\n').find(line => line.includes('OPENAI_API_KEY'));
  console.log('OPENAI_API_KEY行:', openaiLine);
  
  if (openaiLine) {
    const value = openaiLine.split('=')[1] || '';
    console.log('实际值:', '\"' + value + '\"');
    console.log('去除空格后:', '\"' + value.trim() + '\"');
    console.log('长度:', value.length);
    console.log('去除空格后长度:', value.trim().length);
  }
} catch (err) {
  console.log('无法读取.env.local文件');
}