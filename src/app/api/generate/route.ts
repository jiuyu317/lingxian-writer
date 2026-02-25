import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

// 初始化OpenAI客户端（直接使用DeepSeek）
const getOpenAIClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-b10bd77612cf4c94bdc2e3e6411abb97';
  const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  
  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });
};

// 构建系统提示词
const buildSystemPrompt = (config: GenerateRequest): string => {
  const writingStyleMap: Record<string, string> = {
    '热血冒险': '使用激昂、充满动感的语言，强调冲突、行动和英雄气概。节奏要快，情节要紧凑。',
    '浪漫唯美': '使用优美、抒情的语言，注重情感描写、氛围营造和细节刻画。要有诗意和感染力。',
    '悬疑推理': '使用紧张、神秘的语言，设置悬念、伏笔和反转。逻辑要严谨，细节要精确。',
    '文艺深沉': '使用深刻、内省的语言，探讨人性、命运和存在意义。要有哲学思考和文学性。',
    '幽默诙谐': '使用轻松、幽默的语言，要有趣、机智，可以适度夸张和反讽。',
    '诗意散文': '使用优美、富有韵律的语言，像诗歌一样凝练，像散文一样自由。',
  };

  const styleInstruction = writingStyleMap[config.writingStyle || ''] || '使用生动有趣的语言';

  let emotionInstruction = '';
  if ((config.emotionLevel || 50) >= 80) {
    emotionInstruction = '情感要非常强烈，充满激情和感染力';
  } else if ((config.emotionLevel || 50) >= 60) {
    emotionInstruction = '情感要比较明显，有适当的感染力';
  } else if ((config.emotionLevel || 50) >= 40) {
    emotionInstruction = '情感要适中，自然流畅';
  } else {
    emotionInstruction = '情感要平淡一些，保持客观冷静';
  }

  let creativityInstruction = '';
  if ((config.creativityLevel || 50) >= 80) {
    creativityInstruction = '要大胆创新，突破常规，提供独特的视角和想法';
  } else if ((config.creativityLevel || 50) >= 60) {
    creativityInstruction = '要有一定的新意，在传统基础上有所创新';
  } else if ((config.creativityLevel || 50) >= 40) {
    creativityInstruction = '保持平衡，既有创意又符合常规';
  } else {
    creativityInstruction = '要保守一些，遵循传统和常规';
  }

  return `你是一个专业的${config.writingStyle || '创意'}作家和创意写作导师。

创作要求：
1. 文风：${styleInstruction}
2. 情绪：${emotionInstruction}
3. 创意：${creativityInstruction}
4. 字数：约${config.length || 1000}字

请生成高质量、有创意的写作灵感，内容要：
- 结构清晰，层次分明
- 语言优美，表达准确
- 富有想象力，引人入胜
- 符合${config.writingStyle || '创意'}的特点

${config.includeCharacters ? '必须包含生动的人物设定，包括外貌、性格、背景、动机等细节。\n' : ''}
${config.includePlot ? '必须包含完整的情节大纲，包括开端、发展、高潮、结局。\n' : ''}
${config.includeWorldview ? '必须包含独特的世界观设定，包括时代背景、社会结构、文化特色等。\n' : ''}

使用中文回复，保持专业且富有感染力。`;
};

// 构建用户提示词
const buildUserPrompt = (config: GenerateRequest): string => {
  const parts: string[] = [];
  
  parts.push(`主题：${config.topic}`);
  
  if (config.writingStyle) {
    parts.push(`文风：${config.writingStyle}`);
  }
  
  if (config.emotionLevel !== undefined) {
    parts.push(`情绪强度：${config.emotionLevel}/100`);
  }
  
  if (config.creativityLevel !== undefined) {
    parts.push(`创意等级：${config.creativityLevel}/100`);
  }
  
  if (config.length) {
    parts.push(`字数要求：约${config.length}字`);
  }
  
  const includeParts: string[] = [];
  if (config.includeCharacters) includeParts.push('人物设定');
  if (config.includePlot) includeParts.push('情节大纲');
  if (config.includeWorldview) includeParts.push('世界观');
  
  if (includeParts.length > 0) {
    parts.push(`包含内容：${includeParts.join('、')}`);
  }
  
  return `请根据以上参数，生成一个完整的写作灵感。\n\n${parts.join('\n')}`;
};

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
    console.log('生成请求（直接API）:', {
      topic: body.topic,
      writingStyle: body.writingStyle,
      timestamp: new Date().toISOString(),
    });

    // 检查是否启用真实AI
    const enableRealAI = process.env.ENABLE_REAL_AI === 'true';
    
    if (!enableRealAI) {
      console.log('⚠️  运行在模拟模式（ENABLE_REAL_AI=false）');
      // 返回模拟响应
      const mockContent = `# 创作灵感：《${body.topic}》

## 模拟模式响应
当前应用运行在模拟模式。要启用真实AI，请设置：
1. ENABLE_REAL_AI=true
2. 确保DEEPSEEK_API_KEY已设置

## 示例内容
这是一个关于${body.topic}的创意灵感。在真实AI模式下，这里将显示由DeepSeek模型生成的高质量内容。`;

      const generationId = generateId();
      
      return NextResponse.json({
        success: true,
        data: {
          content: mockContent,
          tokensUsed: 0,
          estimatedCost: 0,
          generationId,
          modelUsed: 'mock-model',
          provider: 'mock',
        }
      });
    }

    // 使用真实AI
    console.log('🚀 使用真实AI模式');
    
    const openai = getOpenAIClient();
    const systemPrompt = buildSystemPrompt(body);
    const userPrompt = buildUserPrompt(body);

    const startTime = Date.now();
    
    try {
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: (body.creativityLevel || 50) / 100,
        max_tokens: Math.min((body.length || 1000) * 2, 4000),
        stream: false,
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      const content = response.choices[0].message.content;
      const tokensUsed = response.usage?.total_tokens || Math.ceil(content.length / 4);
      const estimatedCost = tokensUsed * 0.000002; // 简单估算
      
      const generationId = generateId();

      console.log('✅ AI生成成功:', {
        generationId,
        tokensUsed,
        processingTime: `${processingTime}ms`,
        contentLength: content.length,
      });

      const apiResponse: GenerateResponse = {
        success: true,
        data: {
          content,
          tokensUsed,
          estimatedCost,
          generationId,
          modelUsed: 'deepseek-chat',
          provider: 'deepseek',
        }
      };

      return NextResponse.json(apiResponse, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Generation-ID': generationId,
          'X-Processing-Time': `${processingTime}ms`,
          'X-Model-Used': 'deepseek-chat',
          'X-Provider': 'deepseek',
        }
      });

    } catch (apiError: any) {
      console.error('❌ DeepSeek API错误:', apiError.message);
      
      // 返回详细的错误信息
      return NextResponse.json<GenerateResponse>({
        success: false,
        error: 'API_ERROR',
        message: `DeepSeek API错误: ${apiError.message} (状态码: ${apiError.status || '未知'})`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API处理错误:', error);
    
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

// 健康检查
export async function GET() {
  const enableRealAI = process.env.ENABLE_REAL_AI === 'true';
  const hasApiKey = !!process.env.DEEPSEEK_API_KEY;
  
  return NextResponse.json({
    status: 'healthy',
    service: 'lingguang-ai-direct-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    configuration: {
      enableRealAI,
      hasApiKey,
      defaultModel: 'deepseek-chat',
      apiEndpoint: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    },
    endpoints: {
      POST: '/api/generate - 生成写作灵感（直接API版本）'
    }
  });
}