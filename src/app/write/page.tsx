'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreditsSimple } from '@/hooks/useCreditsSimple';
import { createClient } from '@/lib/supabase/client';
import { generateContentStream } from '@/lib/api';
import { Sparkles, ArrowLeft, Zap, Check, Copy, Save, Brain, StopCircle, RotateCcw, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // 'inspiration' 或 null
  
  const [loading, setLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  
  // 流式生成相关状态
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState<{
    tokens: number;
    cost: number;
    generationId?: string;
    modelUsed?: string;
  } | null>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);
  
  // 完整的表单状态
  const [formData, setFormData] = useState(() => {
    // 如果是创意灵感模式，使用固定配置
    if (mode === 'inspiration') {
      return {
        topic: '',
        style: 'creative', // 创意优先
        emotionIntensity: 80, // 固定80
        creativityLevel: 100, // 固定100
        length: 'medium', // 对应300-500字
        additionalInstructions: ''
      };
    }
    // 普通写作模式，使用默认配置
    return {
      topic: '',
      style: 'balanced',
      emotionIntensity: 50,
      creativityLevel: 70,
      length: 'medium',
      additionalInstructions: ''
    };
  });
  
  // 检查当前是否为创意灵感模式
  const isInspirationMode = mode === 'inspiration';
  
  // 用户设置状态
  const [userSettings, setUserSettings] = useState({
    writingStyle: 'balanced',
    emotionIntensity: 50,
    creativityLevel: 70,
    defaultLength: 'medium',
    autoSave: true,
    autoSaveInterval: 30
  });
  
  const { 
    hasCredits, 
    currentCredits, 
    subscriptionTier, 
    isLoading: creditsLoading, 
    error: creditsError, 
    checkCredits 
  } = useCreditsSimple();

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 在创意灵感模式下，固定配置不可修改
    if (isInspirationMode && ['style', 'emotionIntensity', 'creativityLevel', 'length'].includes(name)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理滑块变化
  const handleSliderChange = (key: string, value: number) => {
    // 在创意灵感模式下，固定配置不可修改
    if (isInspirationMode && ['emotionIntensity', 'creativityLevel'].includes(key)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 停止流式生成
  const stopGeneration = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    setIsStreaming(false);
    setLoading(false);
    alert('⏹️ 已停止生成');
  };

  // 重新生成
  const handleRegenerate = () => {
    if (isStreaming) {
      stopGeneration();
    }
    // 清空内容，准备重新生成
    setAiContent("");
    setStreamStats(null);
    // 延迟一点开始重新生成，让用户看到清空效果
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 300);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (cancelStreamRef.current) {
        cancelStreamRef.current();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasCredits) {
      alert('您的AI写作额度不足，请购买套餐后继续使用。');
      router.push('/upgrade');
      return;
    }
    
    if (!formData.topic.trim()) {
      alert('请输入写作主题');
      return;
    }
    
    setLoading(true);
    setIsStreaming(true);
    setAiContent(""); // 清空之前的内容
    
    try {
      console.log('开始流式生成AI内容...');
      const startTime = Date.now();
      
      // 验证创意灵感模式配置
      if (isInspirationMode) {
        console.log('🔒 创意灵感模式 - 验证固定配置:');
        console.log('- 写作风格应为: creative (实际:', formData.style, ')');
        console.log('- 情绪强度应为: 80 (实际:', formData.emotionIntensity, ')');
        console.log('- 创意等级应为: 100 (实际:', formData.creativityLevel, ')');
        console.log('- 输出长度应为: medium -> 400字 (实际:', formData.length, ')');
        
        // 强制重置表单数据为固定值（防止DOM修改）
        setFormData(prev => ({
          ...prev,
          style: 'creative',
          emotionIntensity: 80,
          creativityLevel: 100,
          length: 'medium'
        }));
      }
      
      // 构建生成请求 - 在创意灵感模式下强制使用固定配置
      // 无论formData中的值是什么，创意灵感模式都使用固定值
      const generateRequest = {
        topic: formData.topic,
        writingStyle: isInspirationMode ? 'creative' : formData.style,
        emotionLevel: isInspirationMode ? 80 : formData.emotionIntensity,
        creativityLevel: isInspirationMode ? 100 : formData.creativityLevel,
        length: isInspirationMode ? 400 : getLengthValue(formData.length),
        includeCharacters: true,
        includePlot: true,
        includeWorldview: true,
        modelType: 'deepseek'
      };
      
      console.log('🎯 最终生成请求参数:', {
        模式: isInspirationMode ? '创意灵感' : '普通写作',
        主题: generateRequest.topic,
        写作风格: generateRequest.writingStyle,
        情绪强度: generateRequest.emotionLevel,
        创意等级: generateRequest.creativityLevel,
        输出长度: generateRequest.length + '字',
        配置锁定: isInspirationMode ? '是' : '否'
      });
      
      console.log('生成请求参数:', generateRequest);
      
      // 开始流式生成
      cancelStreamRef.current = generateContentStream(
        generateRequest,
        // 接收到数据块时的回调
        (chunk: string, metadata: { tokens: number }) => {
          console.log('收到数据块:', chunk.length, '字符');
          // 使用函数式更新，确保状态正确
          setAiContent(prev => prev + chunk);
          
          // 滚动到底部
          if (textAreaRef.current) {
            textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
          }
        },
        // 完成时的回调
        (metadata: { totalTokens: number; estimatedCost: number; generationId: string; modelUsed: string }) => {
          const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`✅ 生成完成！用时: ${elapsedTime}秒, Tokens: ${metadata.totalTokens}, 模型: ${metadata.modelUsed}`);
          
          setStreamStats({
            tokens: metadata.totalTokens,
            cost: metadata.estimatedCost,
            generationId: metadata.generationId,
            modelUsed: metadata.modelUsed
          });
          
          // 扣除额度
          deductCredits();
          
          setIsStreaming(false);
          setLoading(false);
        },
        // 错误时的回调
        (error: { type: string; message: string }) => {
          console.error('流式生成错误:', error);
          
          // 添加错误信息
          setAiContent(prev => prev + `\n\n---\n**生成错误**: ${error.message}`);
          alert(`❌ 生成错误: ${error.message}`);
          
          setIsStreaming(false);
          setLoading(false);
        }
      );
      
    } catch (error: any) {
      console.error('启动流式生成失败:', error);
      
      // 添加错误信息
      setAiContent(prev => prev + `\n\n---\n**启动失败**: ${error.message || '未知错误'}`);
      alert('🌐 启动失败，请检查网络连接');
      
      setIsStreaming(false);
      setLoading(false);
    }
  };
  
  // 辅助函数：将长度选项转换为字数
  const getLengthValue = (lengthOption: string): number => {
    switch (lengthOption) {
      case 'short': return 200;
      case 'medium': return 500;
      case 'long': return 1000;
      case 'detailed': return 1500;
      default: return 500;
    }
  };
  
  // 扣除额度
  const deductCredits = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase.rpc('use_ai_credit', { 
          p_user_id: user.id 
        });
        
        if (error) {
          console.error('扣除额度失败:', error);
          // 不阻止用户，只记录错误
        } else {
          console.log('✅ 额度扣除成功');
          // 刷新额度显示
          await checkCredits();
        }
      }
    } catch (error) {
      console.error('扣除额度异常:', error);
    }
  };
  
  // 复制内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiContent);
      alert('✅ 内容已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('❌ 复制失败，请手动复制');
    }
  };
  
  // 保存内容
  const handleSave = async () => {
    try {
      // 在实际应用中，这里应该保存到数据库
      // 临时使用本地存储
      const saveData = {
        id: `draft_${Date.now()}`,
        title: formData.topic || '未命名草稿',
        content: aiContent,
        timestamp: new Date().toISOString(),
        settings: formData
      };
      
      localStorage.setItem(saveData.id, JSON.stringify(saveData));
      alert('✅ 内容已保存到本地草稿箱');
    } catch (error) {
      console.error('保存失败:', error);
      alert('❌ 保存失败');
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 测试横幅 */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 text-center z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <span className="font-bold">付费模式已启用 - 请购买套餐获得AI写作额度</span>
          </div>
          <button
            onClick={() => {
              const banner = document.querySelector('.fixed.top-0');
              if (banner) (banner as HTMLElement).style.display = 'none';
            }}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
          >
            隐藏
          </button>
        </div>
      </div>

      {/* 额度显示 */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl text-white mt-16">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎯 AI写作额度状态</h2>
            <p className="text-blue-100">实时显示您的写作额度和订阅信息</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-full">
            <span className="font-bold">付费模式</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 订阅套餐 */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-sm text-blue-200 mb-1">当前套餐</div>
            <div className="text-3xl font-bold">
              {creditsLoading ? (
                <div className="animate-pulse">加载中...</div>
              ) : subscriptionTier === 'monthly' ? (
                <div className="flex items-center gap-2">
                  <span>月度版</span>
                </div>
              ) : subscriptionTier === 'quarterly' ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-300">季度版</span>
                </div>
              ) : subscriptionTier === 'semiannual' ? (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">半年版</span>
                </div>
              ) : subscriptionTier === 'annual' ? (
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">年度版</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>未订阅</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 剩余额度 */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-sm text-blue-200 mb-1">剩余额度</div>
            <div className="text-3xl font-bold">
              {creditsLoading ? (
                <div className="animate-pulse">...</div>
              ) : (
                <span>{currentCredits} 次</span>
              )}
            </div>
          </div>
          
          {/* 状态指示 */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-sm text-blue-200 mb-1">使用状态</div>
            <div className="text-xl font-bold">
              {creditsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  加载中
                </div>
              ) : creditsError ? (
                <div className="text-red-300">❌ 错误</div>
              ) : hasCredits ? (
                <div className="text-green-300">✅ 有可用额度</div>
              ) : (
                <div className="text-red-300">❌ 额度不足</div>
              )}
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              console.log('额度状态:', { hasCredits, currentCredits, subscriptionTier });
              alert(`额度状态:\n- 当前套餐: ${subscriptionTier || '未订阅'}\n- 剩余额度: ${currentCredits}次\n- 有额度: ${hasCredits ? '是' : '否'}`);
            }}
            className="px-5 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
          >
            显示详情
          </button>
          <button
            onClick={() => router.push('/upgrade')}
            className="px-5 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-colors flex-1"
          >
            {!hasCredits ? '🚀 立即购买套餐' : '📈 升级更多额度'}
          </button>
        </div>
      </div>

      {/* 导航栏 */}
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回仪表板
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {creditsLoading ? '加载中...' : `剩余额度: ${currentCredits}次`}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：完整的输入区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              {isInspirationMode ? (
                <>
                  <Lightbulb className="w-6 h-6 text-purple-600 mr-2" />
                  创意灵感生成
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
                  AI写作生成
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* 写作主题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    写作主题 *
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="例如：未来科技、武侠江湖、爱情故事..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    清晰的主题能让AI生成更相关的内容
                  </p>
                </div>
                
                {/* 创意灵感模式 - 固定配置显示 */}
                {isInspirationMode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="font-bold text-purple-800">✨ 创意灵感模式 - 配置已锁定</h3>
                      </div>
                      <p className="text-purple-700 mb-3">
                        <strong>⚠️ 此模式下所有配置已固定为最佳创意参数，无法修改！</strong><br/>
                        系统将自动使用以下优化配置生成内容：
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/80 p-3 rounded border-2 border-purple-200 shadow-sm">
                          <div className="text-xs text-purple-600 mb-1">写作风格</div>
                          <div className="font-bold text-purple-800 flex items-center">
                            创意优先 <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">固定</span>
                          </div>
                        </div>
                        <div className="bg-white/80 p-3 rounded border-2 border-purple-200 shadow-sm">
                          <div className="text-xs text-purple-600 mb-1">情绪强度</div>
                          <div className="font-bold text-purple-800 flex items-center">
                            80/100 <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">固定</span>
                          </div>
                        </div>
                        <div className="bg-white/80 p-3 rounded border-2 border-purple-200 shadow-sm">
                          <div className="text-xs text-purple-600 mb-1">创意等级</div>
                          <div className="font-bold text-purple-800 flex items-center">
                            100/100 <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">固定</span>
                          </div>
                        </div>
                        <div className="bg-white/80 p-3 rounded border-2 border-purple-200 shadow-sm">
                          <div className="text-xs text-purple-600 mb-1">输出长度</div>
                          <div className="font-bold text-purple-800 flex items-center">
                            300-500字 <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">固定</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                        <strong>💡 提示：</strong> 如需自定义配置，请使用 <a href="/write" className="text-purple-600 underline font-medium">普通写作模式</a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 普通写作模式 - 完整配置 */}
                    {/* 写作风格 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        写作风格 *
                      </label>
                      <select
                        name="style"
                        value={formData.style}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="balanced">平衡风格</option>
                        <option value="creative">创意优先</option>
                        <option value="professional">专业正式</option>
                        <option value="casual">轻松随意</option>
                        <option value="poetic">诗意优美</option>
                        <option value="adventure">热血冒险</option>
                        <option value="romantic">浪漫唯美</option>
                        <option value="mystery">悬疑推理</option>
                        <option value="humorous">幽默诙谐</option>
                      </select>
                    </div>
                    
                    {/* 情绪强度和创意等级 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          情绪强度: {formData.emotionIntensity}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.emotionIntensity}
                          onChange={(e) => handleSliderChange('emotionIntensity', parseInt(e.target.value))}
                          className="w-full"
                          disabled={loading}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>平静</span>
                          <span>中等</span>
                          <span>激烈</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          创意等级: {formData.creativityLevel}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.creativityLevel}
                          onChange={(e) => handleSliderChange('creativityLevel', parseInt(e.target.value))}
                          className="w-full"
                          disabled={loading}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>保守</span>
                          <span>平衡</span>
                          <span>创新</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 输出长度 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        输出长度 *
                      </label>
                      <select
                        name="length"
                        value={formData.length}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="short">简短 (100-200字)</option>
                        <option value="medium">中等 (300-500字)</option>
                        <option value="long">长篇 (800-1000字)</option>
                        <option value="detailed">详细 (1500字以上)</option>
                      </select>
                    </div>
                  </>
                )}
                
                {/* 附加说明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    附加说明（可选）
                  </label>
                  <textarea
                    name="additionalInstructions"
                    value={formData.additionalInstructions}
                    onChange={handleInputChange}
                    placeholder="您可以在这里添加特殊要求，例如：需要包含对话、使用特定修辞手法、避免某些内容等..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    详细的说明能让AI更好地理解您的需求
                  </p>
                </div>
                
                {/* 提交按钮 */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading || !hasCredits}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center ${
                      !hasCredits
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        生成中...
                      </>
                    ) : !hasCredits ? (
                      '额度不足'
                    ) : isInspirationMode ? (
                      <>
                        <Lightbulb className="w-5 h-5 mr-2" />
                        激发创意灵感
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        开始AI写作
                      </>
                    )}
                  </button>
                  
                  {!hasCredits && (
                    <button
                      type="button"
                      onClick={() => router.push('/upgrade')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      购买套餐
                    </button>
                  )}
                </div>
                
                {!hasCredits && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      ❌ 您的AI写作额度不足。请购买套餐后继续使用。
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
          
          {/* 右侧：输出区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="w-6 h-6 text-green-600 mr-2" />
                AI生成内容
                {isStreaming && (
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full animate-pulse">
                    🔄 生成中...
                  </span>
                )}
              </h2>
              
              <div className="flex gap-2">
                {isStreaming ? (
                  <button
                    onClick={stopGeneration}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
                  >
                    <StopCircle className="w-4 h-4 mr-1" />
                    停止生成
                  </button>
                ) : aiContent ? (
                  <>
                    <button
                      onClick={handleRegenerate}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      重新生成
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      保存
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            
            {/* 生成统计信息 */}
            {streamStats && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>📊 Tokens: {streamStats.tokens}</span>
                    <span>🤖 模型: {streamStats.modelUsed || 'DeepSeek'}</span>
                    {streamStats.generationId && (
                      <span>🆔 ID: {streamStats.generationId.substring(0, 8)}...</span>
                    )}
                  </div>
                  <div className="text-green-600 font-medium">
                    ✅ 生成完成
                  </div>
                </div>
              </div>
            )}
            
            {aiContent || isStreaming ? (
              <div className="prose max-w-none">
                <div 
                  ref={textAreaRef}
                  className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-[500px] overflow-y-auto"
                >
                  {aiContent || (isStreaming ? '正在生成内容...' : '')}
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  等待AI生成内容
                </h3>
                <p className="text-gray-600">
                  在左侧填写完整的写作参数，点击"开始AI写作"按钮生成内容
                </p>
                {!hasCredits && (
                  <div className="mt-4">
                    <button
                      onClick={() => router.push('/upgrade')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      立即购买套餐
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 参数说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">参数说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">写作风格</h4>
              <p className="text-gray-600 text-sm">
                选择最适合您内容的写作风格，从平衡到专业、创意等多种选择
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">情绪强度</h4>
              <p className="text-gray-600 text-sm">
                控制文字的情感表达强度，从平静到激烈，影响读者的情感共鸣
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">创意等级</h4>
              <p className="text-gray-600 text-sm">
                调节AI的创意程度，从保守到创新，影响内容的独特性和新颖性
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">输出长度</h4>
              <p className="text-gray-600 text-sm">
                控制生成内容的字数范围，从简短到详细，满足不同场景需求
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 页脚 */}
      <footer className="mt-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">© 2024 灵现AI写作助手</p>
            </div>
            <div className="flex gap-6">
              <Link href="/upgrade" className="text-gray-600 hover:text-gray-900">
                升级套餐
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900">
                使用帮助
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
