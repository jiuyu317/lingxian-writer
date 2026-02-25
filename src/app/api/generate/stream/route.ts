import { NextRequest } from 'next/server';
import { aiService, AIModelType } from '@/lib/ai-service';

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
  modelType?: AIModelType; // 新增：允许指定模型类型
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

    // 验证数值范围
    if (body.emotionLevel && (body.emotionLevel < 0 || body.emotionLevel > 100)) {
      return new Response(JSON.stringify({
        error: 'VALIDATION_ERROR',
        message: '情绪强度必须在0-100之间'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (body.creativityLevel && (body.creativityLevel < 0 || body.creativityLevel > 100)) {
      return new Response(JSON.stringify({
        error: 'VALIDATION_ERROR',
        message: '创意等级必须在0-100之间'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (body.length && body.length < 100) {
      return new Response(JSON.stringify({
        error: 'VALIDATION_ERROR',
        message: '文章长度不能少于100字'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (body.length && body.length > 10000) {
      return new Response(JSON.stringify({
        error: 'VALIDATION_ERROR',
        message: '文章长度不能超过10000字'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // 确定使用的模型类型
    // 强制使用deepseek模型，避免openai模型错误
    const modelType = body.modelType || 'deepseek';

    // 检查模型是否可用
    const availableModels = aiService.getAvailableModels();
    const selectedModel = availableModels.find(m => m.type === modelType);
    
    if (!selectedModel || !selectedModel.enabled) {
      return new Response(JSON.stringify({
        error: 'MODEL_UNAVAILABLE',
        message: `模型 ${modelType} 不可用，请选择其他模型`,
        availableModels: availableModels.map(m => ({
          type: m.type,
          name: m.name,
          enabled: m.enabled,
        }))
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
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'start',
              timestamp: new Date().toISOString(),
              modelType: selectedModel.type,
              modelName: selectedModel.name,
            })}\n\n`
          ));

          // 设置超时
          const timeoutId = setTimeout(() => {
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: 'TIMEOUT_ERROR',
                message: '生成超时，请重试',
                modelType: selectedModel.type,
              })}\n\n`
            ));
            controller.close();
          }, 60000); // 60秒超时

          // 使用AI服务进行流式生成
          const cancelStream = await aiService.streamGenerate(
            body,
            modelType,
            {
              onChunk: (chunk, tokens) => {
                // 清除超时计时器
                clearTimeout(timeoutId);
                
                // 发送数据块事件
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'chunk',
                    content: chunk,
                    tokens: tokens,
                  })}\n\n`
                ));
              },
              onComplete: (result) => {
                // 清除超时计时器
                clearTimeout(timeoutId);
                
                // 发送完成事件
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'complete',
                    totalTokens: result.tokensUsed,
                    estimatedCost: result.estimatedCost,
                    generationId: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    modelUsed: result.modelUsed,
                    provider: result.provider,
                  })}\n\n`
                ));
                controller.close();
              },
              onError: (error) => {
                // 清除超时计时器
                clearTimeout(timeoutId);
                
                console.error('AI服务错误:', error);
                
                // 发送错误事件
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'error',
                    error: 'GENERATION_ERROR',
                    message: error.message || '生成失败',
                    modelType: selectedModel.type,
                    details: error.toString(),
                  })}\n\n`
                ));
                controller.close();
              },
            }
          );

          // 保存取消函数以便在需要时取消
          (controller as any).cancelStream = cancelStream;
          (controller as any).timeoutId = timeoutId;

        } catch (error) {
          console.error('流式生成启动错误:', error);
          
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: 'INITIALIZATION_ERROR',
              message: error instanceof Error ? error.message : '初始化失败',
              details: error instanceof Error ? error.stack : '未知错误',
            })}\n\n`
          ));
          controller.close();
        }
      },
      
      cancel() {
        // 如果流被取消，调用取消函数
        if ((this as any).cancelStream) {
          (this as any).cancelStream();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
        'X-Accel-Buffering': 'no',
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
  const status = aiService.getServiceStatus();
  
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'lingguang-ai-stream-generator',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    streaming: true,
    aiService: status,
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}