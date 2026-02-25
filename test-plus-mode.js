// 测试创意组合模式的API调用
const fetch = require('node-fetch');

async function testPlusMode() {
  console.log('🧪 测试创意组合模式API...\n');
  
  // 测试数据：时间旅行 + 咖啡馆
  const testData = {
    topic: '时间旅行 + 咖啡馆',
    style: 'creative',
    emotionIntensity: 80,
    creativityLevel: 100,
    length: 'short',
    additionalInstructions: '请将"时间旅行"和"咖啡馆"这两个看似无关的元素创意地结合起来，生成让人眼前一亮的灵感点子',
    mode: 'inspiration'
  };
  
  console.log('📋 测试数据:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');
  
  try {
    console.log('🚀 调用API: POST /api/generate');
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ API调用成功！');
      console.log(`📝 生成内容长度: ${result.content?.length || 0} 字符`);
      console.log(`🔢 Token使用: ${result.tokensUsed || 'N/A'}`);
      console.log(`🤖 模型: ${result.model || 'N/A'}`);
      console.log(`⏱️ 耗时: ${result.duration || 'N/A'}ms`);
      
      if (result.content) {
        console.log('\n📄 生成内容预览:');
        console.log('─'.repeat(50));
        console.log(result.content.substring(0, 300) + (result.content.length > 300 ? '...' : ''));
        console.log('─'.repeat(50));
        
        // 检查字数
        const wordCount = result.content.trim().split(/\s+/).length;
        console.log(`📏 字数统计: ${wordCount} 字`);
        
        if (wordCount > 200) {
          console.log('⚠️  警告: 字数超过200字限制！');
        } else {
          console.log('✅ 字数符合200字以内要求');
        }
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API调用失败:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ 请求失败:');
    console.log(error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试流式API...\n');
  
  try {
    console.log('🚀 调用流式API: POST /api/generate/stream');
    const streamResponse = await fetch('http://localhost:3000/api/generate/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 响应状态: ${streamResponse.status} ${streamResponse.statusText}`);
    
    if (streamResponse.ok) {
      console.log('✅ 流式API调用成功！');
      console.log('📡 响应类型:', streamResponse.headers.get('content-type'));
      
      // 读取流式响应
      const reader = streamResponse.body?.getReader();
      if (reader) {
        let streamContent = '';
        let chunkCount = 0;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunkCount++;
            const text = new TextDecoder().decode(value);
            streamContent += text;
            
            // 显示前几个chunk
            if (chunkCount <= 3) {
              console.log(`📦 Chunk ${chunkCount}: ${text.substring(0, 50)}...`);
            }
          }
          
          console.log(`📊 总共接收 ${chunkCount} 个chunk`);
          console.log(`📝 流式内容长度: ${streamContent.length} 字符`);
          
          if (streamContent.length > 0) {
            console.log('\n📄 流式内容预览:');
            console.log('─'.repeat(50));
            console.log(streamContent.substring(0, 300) + (streamContent.length > 300 ? '...' : ''));
            console.log('─'.repeat(50));
          }
        } finally {
          reader.releaseLock();
        }
      }
    } else {
      const errorText = await streamResponse.text();
      console.log('❌ 流式API调用失败:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ 流式请求失败:');
    console.log(error.message);
  }
}

// 运行测试
testPlusMode().catch(console.error);