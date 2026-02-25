"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Settings, FileText, Zap, Moon, Sun, Heart, Brain, Palette, StopCircle, RotateCcw } from "lucide-react";
import { generateContentStream } from "@/lib/api";

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  // 配置状态
  const [config, setConfig] = useState({
    topic: "武侠与赛博朋克的跨界故事",
    writingStyle: "热血冒险",
    emotionLevel: 70,
    creativityLevel: 85,
    length: 1000,
    includeCharacters: true,
    includePlot: true,
    includeWorldview: true,
  });

  // 文风选项
  const writingStyles = [
    { id: "adventure", label: "热血冒险", icon: <Zap className="w-4 h-4" /> },
    { id: "romantic", label: "浪漫唯美", icon: <Heart className="w-4 h-4" /> },
    { id: "mystery", label: "悬疑推理", icon: <Brain className="w-4 h-4" /> },
    { id: "literary", label: "文艺深沉", icon: <Moon className="w-4 h-4" /> },
    { id: "humorous", label: "幽默诙谐", icon: <Sun className="w-4 h-4" /> },
    { id: "poetic", label: "诗意散文", icon: <Palette className="w-4 h-4" /> },
  ];

  // 引用和状态
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState<{
    tokens: number;
    cost: number;
    generationId?: string;
    modelUsed?: string;
  } | null>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);

  // 简化的流式生成函数 - 修复状态更新问题
  const handleGenerateStream = async () => {
    if (isStreaming) {
      // 如果正在生成，则停止
      if (cancelStreamRef.current) {
        cancelStreamRef.current();
      }
      setIsStreaming(false);
      setStreamStats(null);
      return;
    }

    // 重置状态
    setIsGenerating(true);
    setIsStreaming(true);
    setGeneratedText(""); // 清空之前的内容
    setStreamStats(null);
    
    // 记录开始时间
    const startTime = Date.now();

    try {
      // 使用流式API
      cancelStreamRef.current = generateContentStream(
        config,
        // 接收到数据块时的回调 - 关键修复：使用函数式更新
        (chunk, metadata) => {
          // 修复：使用函数式更新累积内容，而不是覆盖
          setGeneratedText(prev => prev + chunk);
          
          // 更新统计信息（使用函数式更新）
          setStreamStats(prev => ({
            tokens: (prev?.tokens || 0) + metadata.tokens,
            cost: ((prev?.tokens || 0) + metadata.tokens) * 0.000002,
            generationId: prev?.generationId,
            modelUsed: prev?.modelUsed,
          }));
          
          // 滚动到底部
          if (textAreaRef.current) {
            textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
          }
        },
        // 完成时的回调
        (metadata) => {
          console.log('流式生成完成:', metadata);
          
          // 更新最终统计信息
          setStreamStats({
            tokens: metadata.totalTokens,
            cost: metadata.estimatedCost,
            generationId: metadata.generationId,
            modelUsed: metadata.modelUsed,
          });
          
          // 显示完成通知
          const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
          alert(`✅ 生成完成！\n用时: ${elapsedTime}秒\nTokens: ${metadata.totalTokens}\n模型: ${metadata.modelUsed}`);
          
          setIsStreaming(false);
          setIsGenerating(false);
        },
        // 错误时的回调
        (error) => {
          console.error('流式生成错误:', error);
          
          // 修复：使用函数式更新添加错误信息
          setGeneratedText(prev => prev + `\n\n---\n**生成错误**: ${error.message}`);
          alert(`❌ 生成错误: ${error.message}`);
          
          setIsStreaming(false);
          setIsGenerating(false);
        }
      );

    } catch (error) {
      console.error('启动流式生成失败:', error);
      
      // 修复：使用函数式更新设置错误信息
      setGeneratedText(prev => prev + `\n\n---\n**启动失败**: ${error instanceof Error ? error.message : '未知错误'}`);
      alert('🌐 启动失败，请检查网络连接');
      
      setIsStreaming(false);
      setIsGenerating(false);
    }
  };

  // 停止流式生成
  const stopGeneration = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    setIsStreaming(false);
    setIsGenerating(false);
    alert('⏹️ 已停止生成');
  };

  // 重新生成
  const handleRegenerate = () => {
    if (isStreaming) {
      stopGeneration();
    }
    // 清空内容，准备重新生成
    setGeneratedText("");
    setStreamStats(null);
    // 延迟一点开始重新生成，让用户看到清空效果
    setTimeout(() => {
      handleGenerateStream();
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

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'}`}>
      {/* 顶部导航栏 */}
      <header className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-md border-gray-200'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <Sparkles className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">灵现 · AI写作智能体</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>你的专属灵感激发师</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                <Sparkles className="w-4 h-4" />
                仪表板
              </a>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                <Settings className="w-4 h-4" />
                设置
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧配置面板 */}
          <div className={`lg:col-span-1 rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className="text-xl font-bold">创作参数配置</h2>
            </div>

            {/* 主题输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">创作主题</label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => updateConfig('topic', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}`}
                placeholder="请输入你的创作主题..."
              />
            </div>

            {/* 文风选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">文风选择</label>
              <div className="grid grid-cols-2 gap-2">
                {writingStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateConfig('writingStyle', style.label)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${config.writingStyle === style.label
                        ? theme === 'dark'
                          ? 'bg-blue-900/30 border border-blue-700'
                          : 'bg-blue-100 border border-blue-300'
                        : theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    {style.icon}
                    <span className="text-sm">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 情绪强度 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">情绪强度</label>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{config.emotionLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.emotionLevel}
                onChange={(e) => updateConfig('emotionLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>平淡</span>
                <span>适中</span>
                <span>强烈</span>
              </div>
            </div>

            {/* 创意等级 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">创意等级</label>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{config.creativityLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.creativityLevel}
                onChange={(e) => updateConfig('creativityLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>保守</span>
                <span>平衡</span>
                <span>大胆</span>
              </div>
            </div>

            {/* 字数选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">文章长度</label>
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((length) => (
                  <button
                    key={length}
                    onClick={() => updateConfig('length', length)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${config.length === length
                        ? theme === 'dark'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {length}字
                  </button>
                ))}
              </div>
            </div>

            {/* 包含内容 */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">包含内容</label>
              <div className="space-y-3">
                {[
                  { id: 'includeCharacters', label: '人物设定', checked: config.includeCharacters },
                  { id: 'includePlot', label: '情节大纲', checked: config.includePlot },
                  { id: 'includeWorldview', label: '世界观', checked: config.includeWorldview },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => updateConfig(item.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 生成按钮 - 流式版本 */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateStream}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isStreaming
                    ? theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                  }`}
              >
                {isStreaming ? (
                  <>
                    <StopCircle className="w-5 h-5" />
                    停止生成
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始流式生成
                  </>
                )}
              </button>

              {/* 流式生成统计 */}
              {isStreaming && streamStats && (
                <div className={`text-sm p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">实时统计:</span>
                    <div className="flex items-center gap-4">
                      <span>Tokens: {streamStats.tokens}</span>
                      <span>预估成本: ${streamStats.cost.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-300 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min((streamStats.tokens / 2000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 重新生成按钮 */}
              {generatedText && !isStreaming && (
                <button
                  onClick={handleRegenerate}
                  className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  重新生成
                </button>
              )}
            </div>
          </div>

          {/* 右侧结果展示区 */}
          <div className={`lg:col-span-2 rounded-2xl p-6 flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h2 className="text-xl font-bold">灵感展示区</h2>
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {generatedText ? `${generatedText.length} 字符` : '等待生成...'}
                </span>
              </div>
            </div>

            <div 
              ref={textAreaRef}
              className={`flex-1 rounded-lg border-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-6 overflow-auto`}
            >
              {generatedText ? (
                <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed relative">
                    {generatedText}
                    {/* 打字机光标效果 */}
                    {isStreaming && (
                      <span className={`inline-block w-[2px] h-5 ml-1 ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-700'} animate-pulse`} />
                    )}
                  </div>
                  
                  {/* 生成统计信息 */}
                  {streamStats && !isStreaming && (
                    <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Tokens 使用</div>
                          <div className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            {streamStats.tokens}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">预估成本</div>
                          <div className="text-lg font-bold">${streamStats.cost.toFixed(6)}</div>
                        </div>
                        <div>
                          <div className="font-medium">生成ID</div>
                          <div className="text-xs font-mono truncate" title={streamStats.generationId}>
                            {streamStats.generationId}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">AI 模型</div>
                          <div className="text-sm">{streamStats.modelUsed || 'mock-model'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {isStreaming ? (
                      <div className="relative">
                        <Sparkles className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} animate-pulse`} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                      </div>
                    ) : (
                      <Sparkles className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    {isStreaming ? '灵感正在生成中...' : '等待灵感降临'}
                  </h3>
                  <p className={`text-sm max-w-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isStreaming 
                      ? '灵现智能体正在思考，请稍候... 文字会像打字机一样逐字显示。'
                      : '配置好左侧的参数，然后点击"开始流式生成"按钮。灵现智能体会根据你的设定，创造出独一无二的故事灵感。'
                    }
                  </p>
                  
                  {/* 流式生成中的动画 */}
                  {isStreaming && (
                    <div className="mt-6 flex items-center gap-2">
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        实时流式传输中...
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 操作按钮组 */}
            {generatedText && !isStreaming && (
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedText);
                    alert('✅ 已复制到剪贴板');
                  }}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FileText className="w-4 h-4" />
                  复制文本
                </button>
                <button 
                  onClick={handleRegenerate}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  重新生成
                </button>
                <button className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}>
                  <Brain className="w-4 h-4" />
                  智能优化
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 底部信息栏 */}
        <div className={`mt-8 rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <h3 className="text-lg font-bold">使用技巧</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className="font-medium mb-2">🎯 精准主题</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                主题描述越具体，生成的灵感越精准。尝试添加细节如时代背景、人物关系等。
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className="font-medium mb-2">🎭 文风匹配</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                根据故事类型选择合适的文风。热血冒险适合快节奏，文艺深沉适合内心描写。
              </p>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className="font-medium mb-2">✨ 流式体验</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                使用流式生成，文字会像打字机一样逐字显示。可以随时停止，体验AI思考过程。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className={`mt-12 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h4 className="font-bold">灵现 · AI写作智能体</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>给你的大脑放烟花 ✨</p>
              </div>
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              © 2026 灵现智能体 · 当前版本 v0.1.0 · 仅供学习交流使用
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}