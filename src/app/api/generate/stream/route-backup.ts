import { NextRequest } from 'next/server';

// 定义请求体类型
interface GenerateRequest {
  topic: string;
  writingStyle?: string;
  emotionLevel?: number;
  creativityLevel?: number;
  length?: number;
  includeCharacters?: boolean;
  includePlot?: boolean;
  includeWorldview?: boolean;
}

// 模拟流式AI响应
async function* mockStreamingAIResponse(prompt: string): AsyncGenerator<string> {
  // 根据主题生成不同的响应内容
  let fullResponse = '';
  
  if (prompt.includes('武侠') || prompt.includes('江湖')) {
    fullResponse = `# 武侠故事：《剑影江湖》

## 人物设定
**林风** - 28岁，蜀山剑派弃徒
- **背景**：因救魔教女子被逐出师门
- **能力**：掌握失传的"无影剑法"
- **性格**：外表冷漠，内心重情重义

**霓裳** - 25岁，魔教圣女
- **背景**：为救父亲被迫加入魔教
- **能力**：精通毒术和暗器
- **性格**：表面妖娆，实则善良单纯

## 开篇场景
月黑风高夜，林风独坐客栈二楼。
窗外传来细微的破空声，三枚银针穿透窗纸。
"蜀山弃徒，交出剑谱，饶你不死。"
林风缓缓睁眼，剑未出鞘，剑气已至。
"魔教的人？"他声音平静，"告诉你们圣女，有些东西，不是她能碰的。"

---
*"剑可以斩断一切，却斩不断情丝。" - 林风*`;
  } else if (prompt.includes('科幻') || prompt.includes('未来')) {
    fullResponse = `# 科幻故事：《数据觉醒》

## 世界观设定
**时代**：22世纪，人类意识可数字化上传
**社会**：现实世界与虚拟世界"元宇宙"并存
**冲突**：数字人类 vs 肉体人类的权利之争

## 主要人物
**Zero** - 前黑客，现为数字游民
- **特点**：意识99%数字化，仅保留1%肉体连接
- **目标**：找到传说中的"源代码"，解放所有数字人类
- **弱点**：对现实世界的记忆逐渐模糊

**Echo** - 元宇宙管理局特工
- **特点**：半机械人，负责追捕非法数字意识
- **目标**：维护两个世界的平衡
- **秘密**：她其实是Zero失散多年的妹妹

---
*"我的代码里有你的名字，这是我最后的人性证明。" - Zero*`;
  } else {
    fullResponse = `# 创作灵感：《${prompt}》

## 基于你的参数生成：
- **文风**：${prompt.includes('热血') ? '热血冒险风格' : '文艺深沉风格'}
- **情绪强度**：${prompt.includes('悲伤') ? '悲伤氛围浓厚' : '积极向上'}
- **创意等级**：${prompt.includes('创新') ? '高度创新，突破常规' : '稳中求新'}

## 故事核心
这是一个关于${prompt}的故事。主角在追寻目标的过程中，发现了比目标更重要的东西。

## 推荐展开方向
1. **人物弧光**：让主角从追求外在目标转向内心成长
2. **情节设计**：设置三次重大转折，每次转折都让主角更接近真相
3. **主题升华**：探讨${prompt}背后的深层意义

---
*"最好的故事，往往诞生于最真诚的表达。" - 灵现智能体*`;
  }

  // 将完整响应分割成小块，模拟流式传输
  const chunks = splitIntoChunks(fullResponse, 3); // 每块3个字符
  
  for (const chunk of chunks) {
    // 模拟AI思考时间
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
    yield chunk;
  }
}

// 将文本分割成小块
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// 真实的流式AI调用（需要配置API密钥）
async function* callRealStreamingAI(prompt: string, config: Partial<GenerateRequest>): AsyncGenerator<string> {
  // 这里需要替换为真实的流式API调用
  // 示例：OpenAI Streaming API调用
  
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的写作助手，擅长生成创意写作灵感。请根据用户要求生成详细的故事大纲、人物设定和写作建议。使用流式传输。'
        },
        {
          role: 'user',
          content: `请根据以下参数生成写作灵感：
主题：${config.topic}
文风：${config.writingStyle || '默认'}
情绪强度：${config.emotionLevel || 50}/100
创意等级：${config.creativityLevel || 50}/100
字数要求：${config.length || 1000}字
包含内容：${config.includeCharacters ? '人物设定 ' : ''}${config.includePlot ? '情节大纲 ' : ''}${config.includeWorldview ? '世界观 ' : ''}
请生成详细、有创意的写作灵感。`
        }
      ],
      stream: true, // 启用流式传输
      temperature: (config.creativityLevel || 50) / 100,
      max_tokens: Math.min((config.length || 1000) * 2, 4000),
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('无法读取流式响应');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices[0]?.delta?.content || '';
            if (content) {
              yield content;
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  */
  
  // 暂时返回模拟流式数据
  yield* mockStreamingAIResponse(prompt);
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: GenerateRequest = await request.json();
    
    // 验证必要参数
    if (!body.topic || body.topic.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'VALIDATION_ERROR',
        message: '主题不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (body.topic.length > 500) {
      return new Response(JSON.stringify({
        error: 'VALIDATION_ERROR',
        message: '主题长度不能超过500字符'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送开始事件
          controller.enqueue(encoder.encode('data: {"type": "start", "timestamp": "' + new Date().toISOString() + '"}\n\n'));
          
          // 调用AI生成内容
          const aiStream = process.env.ENABLE_REAL_AI === 'true' 
            ? callRealStreamingAI(body.topic, body)
            : mockStreamingAIResponse(body.topic);
          
          let totalTokens = 0;
          
          for await (const chunk of aiStream) {
            // 计算token数（简单估算）
            totalTokens += Math.ceil(chunk.length / 4);
            
            // 发送数据事件
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'chunk',
              content: chunk,
              tokens: Math.ceil(chunk.length / 4),
            })}\n\n`));
          }
          
          // 发送完成事件
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            totalTokens,
            estimatedCost: totalTokens * 0.000002,
            generationId: Date.now().toString(36) + Math.random().toString(36).substr(2),
            modelUsed: process.env.AI_MODEL || 'mock-model',
          })}\n\n`));
          
          controller.close();
        } catch (error) {
          console.error('流式生成错误:', error);
          
          // 发送错误事件
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'GENERATION_ERROR',
            message: error instanceof Error ? error.message : '生成过程中发生错误',
          })}\n\n`));
          
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
        'X-Accel-Buffering': 'no', // 禁用Nginx缓冲
      },
    });

  } catch (error) {
    console.error('API错误:', error);
    
    return new Response(JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误，请稍后重试'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// 健康检查
export async function GET() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'lingguang-ai-stream-generator',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    streaming: true,
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}