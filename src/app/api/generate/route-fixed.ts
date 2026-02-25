import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

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

// 定义响应类型
interface GenerateResponse {
  success: boolean;
  data?: {
    content: string;
    tokensUsed: number;
    estimatedCost: number;
    generationId: string;
    modelUsed: string;
    provider: string;
  };
  error?: string;
  message?: string;
}

// 生成唯一的ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: GenerateRequest = await request.json();
    
    // 验证必要参数
    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '主题不能为空'
      }, { status: 400 });
    }

    if (body.topic.length > 500) {
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '主题长度不能超过500字符'
      }, { status: 400 });
    }

    // 验证可选参数范围
    if (body.emotionLevel && (body.emotionLevel < 0 || body.emotionLevel > 100)) {
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '情绪强度必须在0-100之间'
      }, { status: 400 });
    }

    if (body.creativityLevel && (body.creativityLevel < 0 || body.creativityLevel > 100)) {
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '创意等级必须在0-100之间'
      }, { status: 400 });
    }

    // 记录请求
    console.log('生成请求:', {
      topic: body.topic,
      writingStyle: body.writingStyle,
      emotionLevel: body.emotionLevel,
      creativityLevel: body.creativityLevel,
      length: body.length,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // 获取AI服务状态
    const serviceStatus = aiService.getServiceStatus();
    console.log('AI服务状态:', serviceStatus);

    // 调用AI生成内容
    const startTime = Date.now();
    
    try {
      const result = await aiService.batchGenerate(body);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 生成响应ID
      const generationId = generateId();

      // 构建成功响应
      const response: GenerateResponse = {
        success: true,
        data: {
          content: result.content,
          tokensUsed: result.tokensUsed,
          estimatedCost: result.estimatedCost,
          generationId,
          modelUsed: result.modelUsed,
          provider: result.provider,
        }
      };

      console.log('生成完成:', {
        generationId,
        modelUsed: result.modelUsed,
        provider: result.provider,
        tokensUsed: result.tokensUsed,
        processingTime: `${processingTime}ms`,
        contentLength: result.content.length,
      });

      // 添加延迟模拟真实API调用（仅模拟模式需要）
      if (result.provider === 'mock') {
        const minDelay = 1000; // 最小延迟1秒
        const delay = Math.max(minDelay - processingTime, 0);
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Generation-ID': generationId,
          'X-Processing-Time': `${processingTime}ms`,
          'X-Model-Used': result.modelUsed,
          'X-Provider': result.provider,
        }
      });

    } catch (aiError) {
      console.error('AI生成错误:', aiError);
      
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'AI_GENERATION_ERROR',
        message: `AI生成失败: ${aiError instanceof Error ? aiError.message : '未知错误'}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API错误:', error);
    
    // 根据错误类型返回不同的响应
    if (error instanceof SyntaxError) {
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'INVALID_JSON',
        message: '请求体必须是有效的JSON'
      }, { status: 400 });
    }

    return NextResponse.json<GenerateResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误，请稍后重试'
    }, { status: 500 });
  }
}

// 可选：添加GET方法用于健康检查
export async function GET() {
  const serviceStatus = aiService.getServiceStatus();
  
  return NextResponse.json({
    status: 'healthy',
    service: 'lingguang-ai-generator',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiService: {
      defaultModel: serviceStatus.defaultModel,
      availableModels: serviceStatus.availableModels,
      environment: serviceStatus.environment,
    },
    endpoints: {
      POST: '/api/generate - 生成写作灵感'
    }
  });
}

// 可选：添加OPTIONS方法用于CORS预检
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}