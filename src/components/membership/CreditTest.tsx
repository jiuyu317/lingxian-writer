'use client';

import { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';

export default function CreditTest() {
  const { 
    hasCredits, 
    currentCredits, 
    subscriptionTier, 
    isLoading, 
    error,
    checkCredits,
    useCredit,
    refreshCredits
  } = useCredits();
  
  const [testResult, setTestResult] = useState<string>('');

  const handleTestCheck = async () => {
    const result = await checkCredits();
    setTestResult(`检查结果: ${result ? '有额度' : '无额度'}`);
  };

  const handleTestUse = async () => {
    const result = await useCredit();
    setTestResult(`使用结果: ${result ? '成功' : '失败'}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">额度系统测试</h3>
      
      <div className="space-y-4">
        {/* 状态显示 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">订阅等级</div>
            <div className="font-medium">{subscriptionTier === 'pro' ? '专业版' : '免费版'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">剩余额度</div>
            <div className="font-medium">
              {subscriptionTier === 'pro' ? '无限' : `${currentCredits} 次`}
            </div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>有额度: {hasCredits ? '是' : '否'}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>加载中: {isLoading ? '是' : '否'}</span>
          </div>
          {error && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-red-600">错误: {error}</span>
            </div>
          )}
        </div>

        {/* 测试按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleTestCheck}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            检查额度
          </button>
          <button
            onClick={handleTestUse}
            disabled={isLoading || !hasCredits}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            使用额度
          </button>
          <button
            onClick={refreshCredits}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            刷新
          </button>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            {testResult}
          </div>
        )}

        {/* 说明 */}
        <div className="text-sm text-gray-500">
          <p>• 免费用户: 每月10次AI写作额度</p>
          <p>• 专业用户: 无限额度（或每月1000次）</p>
          <p>• 额度每月1日重置</p>
        </div>
      </div>
    </div>
  );
}