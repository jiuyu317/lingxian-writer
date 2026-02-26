// AI服务模块 - 支持多种AI模型

import OpenAI from 'openai';
import { GenerateRequest } from './api';

// 支持的AI模型类型
export type AIModelType = 'openai' | 'deepseek' | 'mock';

// AI模型配置
export interface AIModelConfig {
  type: AIModelType;
  name: string;
  apiKey?: string;
  baseURL?: string;
  defaultModel: string;
  costPerInputToken: number;  // 每输入token成本（美元）
  costPerOutputToken: number; // 每输出token成本（美元）
  maxTokens: number;
  enabled: boolean;
}

// AI生成结果
export interface AIGenerationResult {
  content: string;
  tokensUsed: number;
  estimatedCost: number;
  modelUsed: string;
  provider: AIModelType;
}

// 流式生成回调
export interface StreamCallbacks {
  onChunk: (chunk: string, tokens: number) => void;
  onComplete: (result: AIGenerationResult) => void;
  onError: (error: Error) => void;
}

// 默认模型配置
const DEFAULT_MODELS: Record<AIModelType, AIModelConfig> = {
  openai: {
    type: 'openai',
    name: 'OpenAI GPT',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
    costPerInputToken: 0.0000005,  // $0.0005 per 1K tokens
    costPerOutputToken: 0.0000015, // $0.0015 per 1K tokens
    maxTokens: 4000,
    enabled: !!process.env.OPENAI_API_KEY,
  },
  deepseek: {
    type: 'deepseek',
    name: 'DeepSeek Chat',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    costPerInputToken: 0.000000,  // 目前免费
    costPerOutputToken: 0.000000, // 目前免费
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
    enabled: true, // 模拟模型始终可用
  },
};

// AI服务类
export class AIService {
  private models: Map<AIModelType, AIModelConfig>;
  private defaultModelType: AIModelType;

  constructor() {
    console.log('🔍 AI服务构造函数 - 开始初始化');
    console.log('环境变量检查:');
    console.log('  ENABLE_REAL_AI:', process.env.ENABLE_REAL_AI);
    console.log('  OPENAI_API_KEY:', '\"' + (process.env.OPENAI_API_KEY || '') + '\"', '长度:', (process.env.OPENAI_API_KEY || '').length);
    console.log('  DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '已设置' : '未设置');
    
    this.models = new Map();
    this.defaultModelType = this.determineDefaultModel();
    console.log('默认模型类型确定:', this.defaultModelType);
    this.initializeModels();
  }

  // 初始化模型
  private initializeModels() {
    console.log('🔍 initializeModels() - 开始初始化模型配置');
    
    // 添加所有模型配置
    Object.entries(DEFAULT_MODELS).forEach(([type, config]) => {
      console.log(`  模型 ${type}:`);
      console.log(`    enabled: ${config.enabled}`);
      console.log(`    apiKey: ${config.apiKey ? '已设置' : '未设置'}`);
      console.log(`    name: ${config.name}`);
      this.models.set(type as AIModelType, config);
    });

    const availableModels = Array.from(this.models.values()).filter(m => m.enabled);
    console.log('AI服务初始化完成，可用模型:', 
      availableModels.map(m => m.name).join(', ')
    );
    console.log('默认模型类型:', this.defaultModelType);
  }

  // 确定默认模型
  private determineDefaultModel(): AIModelType {
    console.log('🔍 determineDefaultModel() 被调用');
    // 检查环境变量
    if (process.env.ENABLE_REAL_AI === 'true') {
      console.log('  ENABLE_REAL_AI 为 true');
      console.log('  检查 OPENAI_API_KEY:', '\"' + (process.env.OPENAI_API_KEY || '') + '\"');
      console.log('  if(OPENAI_API_KEY):', !!process.env.OPENAI_API_KEY);
      
      if (process.env.OPENAI_API_KEY) {
        console.log('  → 选择 openai');
        return 'openai';
      }
      
      console.log('  检查 DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '有值' : '空');
      console.log('  if(DEEPSEEK_API_KEY):', !!process.env.DEEPSEEK_API_KEY);
      
      if (process.env.DEEPSEEK_API_KEY) {
        console.log('  → 选择 deepseek');
        return 'deepseek';
      }
    }
    console.log('  → 选择 mock');
    return 'mock'; // 默认使用模拟模型
  }

  // 获取可用模型列表
  getAvailableModels(): AIModelConfig[] {
    return Array.from(this.models.values())
      .filter(model => model.enabled)
      .sort((a, b) => {
        // 优先推荐真实模型
        if (a.type === 'mock' && b.type !== 'mock') return 1;
        if (a.type !== 'mock' && b.type === 'mock') return -1;
        return 0;
      });
  }

  // 获取默认模型
  getDefaultModel(): AIModelConfig {
    const model = this.models.get(this.defaultModelType);
    if (!model) {
      throw new Error(`默认模型 ${this.defaultModelType} 未找到`);
    }
    return model;
  }

  // 构建系统提示词
  buildSystemPrompt(config: GenerateRequest): string {
    const writingStyleMap: Record<string, string> = {
      '热血冒险': '使用激昂、充满动感的语言，强调冲突、行动和英雄气概。节奏要快，情节要紧凑。',
      '浪漫唯美': '使用优美、抒情的语言，注重情感描写、氛围营造和细节刻画。要有诗意和感染力。',
      '悬疑推理': '使用紧张、神秘的语言，设置悬念、伏笔和反转。逻辑要严谨，细节要精确。',
      '文艺深沉': '使用深刻、内省的语言，探讨人性、命运和存在意义。要有哲学思考和文学性。',
      '幽默诙谐': '使用轻松、幽默的语言，要有趣、机智，可以适度夸张和反讽。',
      '诗意散文': '使用优美、富有韵律的语言，像诗歌一样凝练，像散文一样自由。',
    };

    const styleInstruction = writingStyleMap[config.writingStyle || ''] || '使用生动有趣的语言';

    // 情绪强度映射
    let emotionInstruction = '';
    const emotionLevel = config.emotionLevel || 50;
    if (emotionLevel >= 80) {
      emotionInstruction = '情感要非常强烈，充满激情和感染力';
    } else if (emotionLevel >= 60) {
      emotionInstruction = '情感要比较明显，有适当的感染力';
    } else if (emotionLevel >= 40) {
      emotionInstruction = '情感要适中，自然流畅';
    } else {
      emotionInstruction = '情感要平淡一些，保持客观冷静';
    }

    // 创意等级映射到temperature
    let creativityInstruction = '';
    const creativityLevel = config.creativityLevel || 50;
    if (creativityLevel >= 80) {
      creativityInstruction = '要大胆创新，突破常规，提供独特的视角和想法';
    } else if (creativityLevel >= 60) {
      creativityInstruction = '要有一定的新意，在传统基础上有所创新';
    } else if (creativityLevel >= 40) {
      creativityInstruction = '保持平衡，既有创意又符合常规';
    } else {
      creativityInstruction = '要保守一些，遵循传统和常规';
    }

    return `你是一个专业的${config.writingStyle}作家和创意写作导师。

创作要求：
1. 文风：${styleInstruction}
2. 情绪：${emotionInstruction}
3. 创意：${creativityInstruction}
4. 字数：约${config.length}字

请生成高质量、有创意的写作灵感，内容要：
- 结构清晰，层次分明
- 语言优美，表达准确
- 富有想象力，引人入胜
- 符合${config.writingStyle}的特点

${config.includeCharacters ? '必须包含生动的人物设定，包括外貌、性格、背景、动机等细节。\n' : ''}
${config.includePlot ? '必须包含完整的情节大纲，包括开端、发展、高潮、结局。\n' : ''}
${config.includeWorldview ? '必须包含独特的世界观设定，包括时代背景、社会结构、文化特色等。\n' : ''}

使用中文回复，保持专业且富有感染力。`;
  }

  // 构建用户提示词
  buildUserPrompt(config: GenerateRequest): string {
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
  }

  // 估算token数量（简单估算）
  estimateTokens(text: string): number {
    // 简单估算：中文字符 ≈ 2 tokens，英文字符 ≈ 0.25 tokens
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars * 2 + otherChars * 0.25);
  }

  // 估算成本
  estimateCost(inputTokens: number, outputTokens: number, model: AIModelConfig): number {
    return (
      inputTokens * model.costPerInputToken +
      outputTokens * model.costPerOutputToken
    );
  }

  // 流式生成内容
  async streamGenerate(
    config: GenerateRequest,
    modelType: AIModelType = this.defaultModelType,
    callbacks: StreamCallbacks
  ): Promise<() => void> {
    const modelConfig = this.models.get(modelType);
    if (!modelConfig || !modelConfig.enabled) {
      throw new Error(`模型 ${modelType} 不可用`);
    }

    console.log(`使用模型: ${modelConfig.name} (${modelConfig.defaultModel})`);

    // 根据模型类型选择不同的实现
    switch (modelType) {
      case 'openai':
        return this.streamWithOpenAI(config, modelConfig, callbacks);
      case 'deepseek':
        return this.streamWithDeepSeek(config, modelConfig, callbacks);
      case 'mock':
        return this.streamWithMock(config, modelConfig, callbacks);
      default:
        throw new Error(`不支持的模型类型: ${modelType}`);
    }
  }

  // OpenAI流式生成
  private async streamWithOpenAI(
    config: GenerateRequest,
    modelConfig: AIModelConfig,
    callbacks: StreamCallbacks
  ): Promise<() => void> {
    if (!modelConfig.apiKey) {
      throw new Error('OpenAI API密钥未配置');
    }

    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.baseURL,
    });

    const systemPrompt = this.buildSystemPrompt(config);
    const userPrompt = this.buildUserPrompt(config);

    const inputTokens = this.estimateTokens(systemPrompt + userPrompt);
    let outputTokens = 0;

    try {
      const stream = await openai.chat.completions.create({
        model: modelConfig.defaultModel,
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
        stream: true,
        temperature: config.creativityLevel / 100,
        max_tokens: Math.min(config.length * 2, modelConfig.maxTokens),
      });

      let fullContent = '';
      const chunks: string[] = [];

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          chunks.push(content);
          
          const chunkTokens = this.estimateTokens(content);
          outputTokens += chunkTokens;
          
          callbacks.onChunk(content, chunkTokens);
        }
      }

      const totalTokens = inputTokens + outputTokens;
      const estimatedCost = this.estimateCost(inputTokens, outputTokens, modelConfig);

      callbacks.onComplete({
        content: fullContent,
        tokensUsed: totalTokens,
        estimatedCost,
        modelUsed: modelConfig.defaultModel,
        provider: 'openai',
      });

    } catch (error) {
      console.error('OpenAI流式生成错误:', error);
      callbacks.onError(error instanceof Error ? error : new Error('OpenAI API调用失败'));
    }

    // 返回取消函数（OpenAI SDK会自动处理）
    return () => {};
  }

  // DeepSeek流式生成
  private async streamWithDeepSeek(
    config: GenerateRequest,
    modelConfig: AIModelConfig,
    callbacks: StreamCallbacks
  ): Promise<() => void> {
    if (!modelConfig.apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    // DeepSeek也使用OpenAI兼容的API
    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.baseURL,
    });

    const systemPrompt = this.buildSystemPrompt(config);
    const userPrompt = this.buildUserPrompt(config);

    const inputTokens = this.estimateTokens(systemPrompt + userPrompt);
    let outputTokens = 0;

    try {
      const stream = await openai.chat.completions.create({
        model: modelConfig.defaultModel,
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
        stream: true,
        temperature: config.creativityLevel / 100,
        max_tokens: Math.min(config.length * 2, modelConfig.maxTokens),
      });

      let fullContent = '';
      const chunks: string[] = [];

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          chunks.push(content);
          
          const chunkTokens = this.estimateTokens(content);
          outputTokens += chunkTokens;
          
          callbacks.onChunk(content, chunkTokens);
        }
      }

      const totalTokens = inputTokens + outputTokens;
      const estimatedCost = this.estimateCost(inputTokens, outputTokens, modelConfig);

      callbacks.onComplete({
        content: fullContent,
        tokensUsed: totalTokens,
        estimatedCost,
        modelUsed: modelConfig.defaultModel,
        provider: 'deepseek',
      });

    } catch (error) {
      console.error('DeepSeek流式生成错误:', error);
      
      let errorMessage = 'DeepSeek API调用失败';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 如果是OpenAI API错误，提取更多信息
        if (error instanceof OpenAI.APIError) {
          errorMessage = `DeepSeek API错误: ${error.status} - ${error.message}`;
          console.error('API错误详情:', {
            status: error.status,
            code: error.code,
            type: error.type,
          });
        }
      }
      
      callbacks.onError(new Error(errorMessage));
    }

    return () => {};
  }

  // 模拟模型流式生成
  private async streamWithMock(
    config: GenerateRequest,
    modelConfig: AIModelConfig,
    callbacks: StreamCallbacks
  ): Promise<() => void> {
    // 模拟延迟
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 根据主题生成不同的模拟内容
    let mockContent = '';
    if (config.topic.includes('武侠') || config.topic.includes('江湖')) {
      mockContent = `# 武侠故事灵感：《${config.topic}》

## 人物设定
**主角** - 身怀绝技却隐姓埋名的侠客
- **特点**：外表平凡，内心坚守侠义
- **能力**：掌握失传武学，深藏不露
- **目标**：在江湖纷争中守护心中的道义

**对手** - 表面正义实则野心勃勃的武林盟主
- **特点**：道貌岸然，权谋高手
- **能力**：精通各派武学，擅长笼络人心
- **目标**：一统江湖，实现个人野心

## 核心冲突
传统侠义精神 vs 现代权力游戏
个人情感 vs 江湖责任
隐世修行 vs 入世济民

## 推荐展开
1. 从一个小镇的神秘事件开始
2. 逐渐揭开更大的江湖阴谋
3. 主角在冲突中成长和抉择
4. 结局留下思考空间

---
*"剑是凶器，剑术是杀人之术。但用剑的人，可以决定剑的意义。"*`;
    } else {
      mockContent = `# 创作灵感：《${config.topic}》

## 基于你的设定：
- **文风**：${config.writingStyle || '生动有趣'}
- **情绪**：${config.emotionLevel || 50}/100 强度
- **创意**：${config.creativityLevel || 50}/100 等级

## 核心创意
这是一个关于${config.topic}的故事。主角在追寻目标的过程中，发现了比目标更重要的东西——可能是友情、爱情、自我认知，或是某种人生真谛。

## 结构建议
**第一幕**：建立常态，引入冲突
**第二幕**：应对挑战，成长变化
**第三幕**：高潮对决，解决冲突
**尾声**：新的开始，留下余韵

## 写作提示
1. 从细节入手，让读者身临其境
2. 人物要有弧光，不能一成不变
3. 冲突要真实，源于人物内心
4. 主题要深刻，但表达要自然

---
*"最好的故事，往往诞生于最真诚的表达。" - 灵现智能体*`;
    }

    // 分割成小块模拟流式
    const chunkSize = 5;
    const chunks: string[] = [];
    for (let i = 0; i < mockContent.length; i += chunkSize) {
      chunks.push(mockContent.slice(i, i + chunkSize));
    }

    let isCancelled = false;
    let totalTokens = 0;

    const generate = async () => {
      try {
        for (const chunk of chunks) {
          if (isCancelled) break;
          
          await delay(30 + Math.random() * 50); // 30-80ms延迟
          
          const chunkTokens = this.estimateTokens(chunk);
          totalTokens += chunkTokens;
          
          callbacks.onChunk(chunk, chunkTokens);
        }

        if (!isCancelled) {
          const estimatedCost = this.estimateCost(0, totalTokens, modelConfig);
          
          callbacks.onComplete({
            content: mockContent,
            tokensUsed: totalTokens,
            estimatedCost,
            modelUsed: modelConfig.defaultModel,
            provider: 'mock',
          });
        }
      } catch (error) {
        if (!isCancelled) {
          callbacks.onError(error instanceof Error ? error : new Error('模拟生成失败'));
        }
      }
    };

    // 开始生成
    generate();

    // 返回取消函数
    return () => {
      isCancelled = true;
    };
  }

  // 批量生成（非流式）
  async batchGenerate(
    config: GenerateRequest,
    modelType: AIModelType = this.defaultModelType
  ): Promise<AIGenerationResult> {
    return new Promise((resolve, reject) => {
      let content = '';
      let totalTokens = 0;

      this.streamGenerate(config, modelType, {
        onChunk: (chunk, tokens) => {
          content += chunk;
          totalTokens += tokens;
        },
        onComplete: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }

  // 测试API连接
  async testConnection(modelType: AIModelType): Promise<boolean> {
    try {
      const modelConfig = this.models.get(modelType);
      if (!modelConfig || !modelConfig.enabled) {
        return false;
      }

      // 发送一个简单的测试请求
      const testConfig: GenerateRequest = {
        topic: '测试',
        writingStyle: '幽默诙谐',
        emotionLevel: 50,
        creativityLevel: 50,
        length: 50,
        includeCharacters: false,
        includePlot: false,
        includeWorldview: false,
      };

      await this.batchGenerate(testConfig, modelType);
      return true;
    } catch (error) {
      console.error(`测试连接失败 (${modelType}):`, error);
      return false;
    }
  }

  // 获取服务状态
  getServiceStatus() {
    const status: Record<string, any> = {
      defaultModel: this.defaultModelType,
      availableModels: this.getAvailableModels().map(m => ({
        type: m.type,
        name: m.name,
        enabled: m.enabled,
        costPerInputToken: m.costPerInputToken,
        costPerOutputToken: m.costPerOutputToken,
      })),
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '已设置' : '未设置',
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? '已设置' : '未设置',
        ENABLE_REAL_AI: process.env.ENABLE_REAL_AI || 'false',
      },
    };

    return status;
  }
}

// 创建单例实例
export const aiService = new AIService();