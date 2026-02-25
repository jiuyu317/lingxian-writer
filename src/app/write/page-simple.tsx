'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreditsSimple } from '@/hooks/useCreditsSimple';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, ArrowLeft, Zap, Check } from 'lucide-react';
import Link from 'next/link';

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [writingStyle, setWritingStyle] = useState('creative');
  
  const { 
    hasCredits, 
    currentCredits, 
    subscriptionTier, 
    creditsLoading, 
    creditsError, 
    checkCredits 
  } = useCreditsSimple();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasCredits) {
      alert('您的AI写作额度不足，请购买套餐后继续使用。');
      router.push('/upgrade');
      return;
    }
    
    if (!prompt.trim()) {
      alert('请输入写作提示');
      return;
    }
    
    setLoading(true);
    
    try {
      // 模拟AI生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = `这是根据您的提示"${prompt}"生成的AI写作内容。\n\n` +
        `写作风格：${writingStyle}\n\n` +
        `AI生成的创意内容将显示在这里。这是一个示例内容，实际应用中会调用真实的AI API。\n\n` +
        `您可以继续编辑和完善这个内容。`;
      
      setAiContent(generatedContent);
      
      // 扣除额度
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .rpc('use_ai_credit', { p_user_id: user.id });
        
        if (error) {
          console.error('扣除额度失败:', error);
        } else {
          // 刷新额度显示
          await checkCredits();
        }
      }
      
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiContent);
    alert('已复制到剪贴板');
  };

  const handleSave = () => {
    alert('内容已保存');
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
              <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回首页
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
          {/* 左侧：输入区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              AI写作生成
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  写作提示
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入您想要AI帮助写作的内容，例如：写一篇关于人工智能未来发展的文章..."
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  写作风格
                </label>
                <select
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="creative">创意写作</option>
                  <option value="professional">专业写作</option>
                  <option value="casual">轻松随意</option>
                  <option value="academic">学术写作</option>
                </select>
              </div>
              
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
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    ❌ 您的AI写作额度不足。请购买套餐后继续使用。
                  </p>
                </div>
              )}
            </form>
          </div>
          
          {/* 右侧：输出区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="w-6 h-6 text-green-600 mr-2" />
                AI生成内容
              </h2>
              
              {aiContent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    复制
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    保存
                  </button>
                </div>
              )}
            </div>
            
            {aiContent ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {aiContent}
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
                  在左侧输入写作提示，点击"开始AI写作"按钮生成内容
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
        
        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">购买套餐</h4>
                <p className="text-gray-600 text-sm">
                  选择适合您的套餐，获得AI写作额度
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">输入提示</h4>
                <p className="text-gray-600 text-sm">
                  描述您想要AI帮助写作的内容
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">生成内容</h4>
                <p className="text-gray-600 text-sm">
                  AI将根据您的提示生成高质量的写作内容
                </p>
              </div>
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