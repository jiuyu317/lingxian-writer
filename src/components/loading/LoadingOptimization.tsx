'use client';

import { useState, useEffect } from 'react';

// 加载状态类型
interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  status: 'idle' | 'preparing' | 'generating' | 'streaming' | 'saving' | 'complete' | 'error';
  message: string;
  estimatedTime: number; // 预估剩余时间（毫秒）
  startTime: number | null;
}

// 默认加载状态
const defaultLoadingState: LoadingState = {
  isLoading: false,
  progress: 0,
  status: 'idle',
  message: '准备生成内容...',
  estimatedTime: 0,
  startTime: null
};

// 状态消息映射
const statusMessages = {
  idle: '准备生成内容...',
  preparing: '准备生成参数...',
  generating: 'AI正在思考创意...',
  streaming: '正在生成内容...',
  saving: '保存生成结果...',
  complete: '生成完成！',
  error: '生成失败'
};

// 预估时间映射（根据内容长度）
const estimatedTimes = {
  short: 3000, // 3秒
  medium: 5000, // 5秒
  long: 8000, // 8秒
  detailed: 12000 // 12秒
};

// 自定义Hook：加载状态管理
export function useLoadingOptimization() {
  const [loadingState, setLoadingState] = useState<LoadingState>(defaultLoadingState);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  // 开始加载
  const startLoading = (length: string = 'medium') => {
    const estimatedTime = estimatedTimes[length as keyof typeof estimatedTimes] || 5000;
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      status: 'preparing',
      message: statusMessages.preparing,
      estimatedTime,
      startTime: Date.now()
    });

    // 启动进度模拟
    const interval = setInterval(() => {
      setLoadingState(prev => {
        if (!prev.startTime) return prev;
        
        const elapsed = Date.now() - prev.startTime;
        const progress = Math.min(95, (elapsed / prev.estimatedTime) * 100);
        
        // 根据进度更新状态
        let status = prev.status;
        let message = prev.message;
        
        if (progress < 10) {
          status = 'preparing';
          message = '准备生成参数...';
        } else if (progress < 30) {
          status = 'generating';
          message = 'AI正在思考创意...';
        } else if (progress < 80) {
          status = 'streaming';
          message = '正在生成内容...';
        } else {
          status = 'saving';
          message = '保存生成结果...';
        }
        
        return {
          ...prev,
          progress,
          status,
          message
        };
      });
    }, 100);

    setProgressInterval(interval);
  };

  // 更新状态
  const updateStatus = (status: LoadingState['status'], customMessage?: string) => {
    setLoadingState(prev => ({
      ...prev,
      status,
      message: customMessage || statusMessages[status]
    }));
  };

  // 更新进度
  const updateProgress = (progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, progress)
    }));
  };

  // 完成加载
  const completeLoading = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      status: 'complete',
      message: statusMessages.complete
    }));

    // 2秒后重置
    setTimeout(() => {
      setLoadingState(defaultLoadingState);
    }, 2000);
  };

  // 错误处理
  const errorLoading = (errorMessage: string) => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      status: 'error',
      message: errorMessage || statusMessages.error
    }));

    // 5秒后重置
    setTimeout(() => {
      setLoadingState(defaultLoadingState);
    }, 5000);
  };

  // 清理
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  return {
    loadingState,
    startLoading,
    updateStatus,
    updateProgress,
    completeLoading,
    errorLoading
  };
}

// 加载状态显示组件
export function LoadingStatus({ loadingState }: { loadingState: LoadingState }) {
  if (!loadingState.isLoading && loadingState.status !== 'complete' && loadingState.status !== 'error') {
    return null;
  }

  const getStatusColor = () => {
    switch (loadingState.status) {
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'generating': return 'bg-blue-500';
      case 'streaming': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (loadingState.status) {
      case 'complete': return '✅';
      case 'error': return '❌';
      case 'generating': return '🤔';
      case 'streaming': return '✍️';
      case 'saving': return '💾';
      default: return '⏳';
    }
  };

  const getEstimatedTime = () => {
    if (!loadingState.startTime || loadingState.status === 'complete' || loadingState.status === 'error') {
      return '';
    }
    
    const elapsed = Date.now() - loadingState.startTime;
    const remaining = Math.max(0, loadingState.estimatedTime - elapsed);
    const seconds = Math.ceil(remaining / 1000);
    
    return seconds > 0 ? `约${seconds}秒` : '即将完成...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full ${getStatusColor()} flex items-center justify-center mr-3`}>
            <span className="text-white text-lg">{getStatusIcon()}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI写作生成中</h3>
            <p className="text-sm text-gray-600">{getEstimatedTime()}</p>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{loadingState.message}</span>
            <span>{Math.round(loadingState.progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStatusColor()} transition-all duration-300 ease-out`}
              style={{ width: `${loadingState.progress}%` }}
            />
          </div>
        </div>
        
        {/* 状态详情 */}
        <div className="text-sm text-gray-500">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>参数准备</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${loadingState.status === 'generating' || loadingState.status === 'streaming' || loadingState.status === 'saving' || loadingState.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>AI生成</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${loadingState.status === 'streaming' || loadingState.status === 'saving' || loadingState.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>流式输出</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${loadingState.status === 'saving' || loadingState.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>保存结果</span>
            </div>
          </div>
        </div>
        
        {/* 提示信息 */}
        {loadingState.status === 'generating' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 AI正在深度思考中，请稍候...
              <br />
              <span className="text-xs">创意需要时间酝酿</span>
            </p>
          </div>
        )}
        
        {loadingState.status === 'streaming' && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              ✨ 内容正在实时生成中...
              <br />
              <span className="text-xs">每个字都是AI精心创作的</span>
            </p>
          </div>
        )}
        
        {loadingState.status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              ❌ {loadingState.message}
              <br />
              <span className="text-xs">请稍后重试或检查网络连接</span>
            </p>
          </div>
        )}
        
        {loadingState.status === 'complete' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              🎉 生成完成！
              <br />
              <span className="text-xs">内容已保存，可以开始编辑或复制</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 简化的内联加载指示器（用于按钮等）
export function InlineLoading({ isLoading, message = '处理中...' }: { isLoading: boolean; message?: string }) {
  if (!isLoading) return null;
  
  return (
    <div className="inline-flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

// 按钮加载状态
export function LoadingButton({
  isLoading,
  loadingText = '处理中...',
  normalText,
  onClick,
  disabled,
  className = '',
  variant = 'primary'
}: {
  isLoading: boolean;
  loadingText?: string;
  normalText: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {loadingText}
        </div>
      ) : (
        normalText
      )}
    </button>
  );
}