// 测试DeepSeek API连接
const OpenAI = require('openai');

const apiKey = 'sk-b10bd77612cf4c94bdc2e3e6411abb97';
const baseURL = 'https://api.deepseek.com';

console.log('测试DeepSeek API连接...');
console.log('API密钥:', apiKey.substring(0, 10) + '...');
console.log('端点:', baseURL);

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

async function testConnection() {
  try {
    console.log('发送测试请求...');
    
    // 发送一个简单的请求测试连接
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "API connection successful"'
        }
      ],
      max_tokens: 20,
    });
    
    console.log('✅ API连接成功！');
    console.log('响应:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ API连接失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', error.response.headers);
      console.error('响应体:', error.response.data);
    }
    
    return false;
  }
}

// 运行测试
testConnection().then(success => {
  if (success) {
    console.log('\n✅ API测试完成 - 连接正常');
  } else {
    console.log('\n❌ API测试完成 - 连接失败');
    process.exit(1);
  }
}).catch(err => {
  console.error('测试过程中发生错误:', err);
  process.exit(1);
});