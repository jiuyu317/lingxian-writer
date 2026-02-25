// API工具函数库

export interface GenerateRequest {
  topic: string;
  writingStyle?: string;
  emotionLevel?: number;
  creativityLevel?: number;
  length?: number;
  includeCharacters?: boolean;
  includePlot?: boolean;
  includeWorldview?: boolean;
  modelType?: string; // 'openai' | 'deepseek' | 'mock'
}

export interface GenerateResponse {
  success: boolean;
  data?: {
    content: string;
    tokensUsed: number;
    estimatedCost: number;
    generationId: string;
    modelUsed: string;
  };
  error?: string;
  message?: string;
}

/**
 * 调用生成API（传统方式）
 * @param request 生成请求参数
 * @returns 生成响应
 */
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data: GenerateResponse = await response.json();
    return data;
  } catch (error) {
    console.error('生成内容失败:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

/**
 * 流式生成内容
 * @param request 生成请求参数
 * @param onChunk 接收到数据块时的回调
 * @param onComplete 完成时的回调
 * @param onError 错误时的回调
 * @returns 取消函数
 */
export function generateContentStream(
  request: GenerateRequest,
  onChunk: (chunk: string, metadata: { tokens: number }) => void,
  onComplete: (metadata: { totalTokens: number; estimatedCost: number; generationId: string; modelUsed: string }) => void,
  onError: (error: { type: string; message: string }) => void
): () => void {
  let abortController: AbortController | null = new AbortController();
  let isCancelled = false;

  const execute = async () => {
    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          if (isCancelled) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // 处理Server-Sent Events
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                switch (data.type) {
                  case 'start':
                    console.log('流式生成开始:', data.timestamp);
                    break;
                  
                  case 'chunk':
                    onChunk(data.content, { tokens: data.tokens });
                    break;
                  
                  case 'complete':
                    onComplete({
                      totalTokens: data.totalTokens,
                      estimatedCost: data.estimatedCost,
                      generationId: data.generationId,
                      modelUsed: data.modelUsed,
                    });
                    break;
                  
                  case 'error':
                    onError({
                      type: data.error,
                      message: data.message,
                    });
                    break;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('请求已被取消');
        return;
      }
      
      console.error('流式生成失败:', error);
      onError({
        type: 'STREAM_ERROR',
        message: error instanceof Error ? error.message : '流式传输失败',
      });
    }
  };

  execute();

  // 返回取消函数
  return () => {
    isCancelled = true;
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };
}

/**
 * 验证生成请求参数
 * @param request 生成请求参数
 * @returns 验证错误信息，如果通过返回null
 */
export function validateGenerateRequest(request: GenerateRequest): string | null {
  if (!request.topic || request.topic.trim().length === 0) {
    return '主题不能为空';
  }

  if (request.topic.length > 500) {
    return '主题长度不能超过500字符';
  }

  if (request.emotionLevel && (request.emotionLevel < 0 || request.emotionLevel > 100)) {
    return '情绪强度必须在0-100之间';
  }

  if (request.creativityLevel && (request.creativityLevel < 0 || request.creativityLevel > 100)) {
    return '创意等级必须在0-100之间';
  }

  if (request.length && request.length < 100) {
    return '文章长度不能少于100字';
  }

  if (request.length && request.length > 10000) {
    return '文章长度不能超过10000字';
  }

  return null;
}

/**
 * 构建完整的提示词
 * @param request 生成请求参数
 * @returns 完整的提示词字符串
 */
export function buildPrompt(request: GenerateRequest): string {
  const parts: string[] = [];
  
  parts.push(`主题：${request.topic}`);
  
  if (request.writingStyle) {
    parts.push(`文风：${request.writingStyle}`);
  }
  
  if (request.emotionLevel !== undefined) {
    parts.push(`情绪强度：${request.emotionLevel}/100`);
  }
  
  if (request.creativityLevel !== undefined) {
    parts.push(`创意等级：${request.creativityLevel}/100`);
  }
  
  if (request.length) {
    parts.push(`字数要求：${request.length}字`);
  }
  
  const includeParts: string[] = [];
  if (request.includeCharacters) includeParts.push('人物设定');
  if (request.includePlot) includeParts.push('情节大纲');
  if (request.includeWorldview) includeParts.push('世界观');
  
  if (includeParts.length > 0) {
    parts.push(`包含内容：${includeParts.join('、')}`);
  }
  
  return parts.join('\n');
}

/**
 * 估算生成成本（基于GPT-3.5-turbo）
 * @param length 文章长度（字）
 * @returns 预估成本（美元）
 */
export function estimateCost(length: number): number {
  // GPT-3.5-turbo: $0.0015 per 1K tokens (输入+输出)
  // 假设平均1个中文字 ≈ 2个tokens
  const tokens = length * 2;
  const costPerToken = 0.0015 / 1000;
  return tokens * costPerToken;
}

/**
 * 格式化成本显示
 * @param cost 成本（美元）
 * @returns 格式化后的字符串
 */
export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return '< $0.001';
  }
  return `$${cost.toFixed(3)}`;
}

/**
 * 获取API健康状态
 * @returns 健康状态
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/generate', {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 重试API调用
 * @param request 生成请求参数
 * @param maxRetries 最大重试次数
 * @returns 生成响应
 */
export async function generateWithRetry(
  request: GenerateRequest,
  maxRetries: number = 3
): Promise<GenerateResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateContent(request);
      
      if (result.success) {
        return result;
      }
      
      // 如果是服务器错误，可以重试
      if (result.error === 'INTERNAL_ERROR') {
        lastError = new Error(result.message || '服务器内部错误');
        await delay(attempt * 1000); // 指数退避
        continue;
      }
      
      // 其他错误不重试
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      if (attempt < maxRetries) {
        await delay(attempt * 1000); // 指数退避
      }
    }
  }
  
  return {
    success: false,
    error: 'MAX_RETRIES_EXCEEDED',
    message: lastError?.message || '重试次数超限',
  };
}

/**
 * 延迟函数
 * @param ms 毫秒数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 保存生成记录到本地存储
 * @param generationId 生成ID
 * @param request 请求参数
 * @param response 响应数据
 */
export function saveToLocalStorage(
  generationId: string,
  request: GenerateRequest,
  response: GenerateResponse['data']
): void {
  try {
    const key = `lingguang_generation_${generationId}`;
    const record = {
      id: generationId,
      timestamp: new Date().toISOString(),
      request,
      response,
    };
    
    localStorage.setItem(key, JSON.stringify(record));
    
    // 保存到历史记录列表
    const historyKey = 'lingguang_generation_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.unshift({
      id: generationId,
      timestamp: record.timestamp,
      topic: request.topic,
      preview: response?.content?.substring(0, 100) + '...',
    });
    
    // 只保留最近50条记录
    if (history.length > 50) {
      history.pop();
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
}

/**
 * 从本地存储加载生成记录
 * @param generationId 生成ID
 * @returns 生成记录
 */
export function loadFromLocalStorage(generationId: string): any {
  try {
    const key = `lingguang_generation_${generationId}`;
    const record = localStorage.getItem(key);
    return record ? JSON.parse(record) : null;
  } catch (error) {
    console.error('从本地存储加载失败:', error);
    return null;
  }
}

/**
 * 获取生成历史记录
 * @returns 历史记录数组
 */
export function getGenerationHistory(): any[] {
  try {
    const historyKey = 'lingguang_generation_history';
    const history = localStorage.getItem(historyKey);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
}

/**
 * 清除所有生成记录
 */
export function clearGenerationHistory(): void {
  try {
    // 清除所有生成记录
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('lingguang_generation_')) {
        localStorage.removeItem(key);
      }
    }
    
    // 清除历史记录列表
    localStorage.removeItem('lingguang_generation_history');
  } catch (error) {
    console.error('清除历史记录失败:', error);
  }
}