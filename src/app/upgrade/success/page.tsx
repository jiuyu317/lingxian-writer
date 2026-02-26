'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';

function UpgradeSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || '专业版';

  useEffect(() => {
    // 倒计时重定向
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/write');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* 成功图标 */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          升级成功！ 🎉
        </h1>
        
        <p className="text-gray-600 mb-2">
          您已成功升级到 <span className="font-semibold text-blue-600">{plan}</span>
        </p>
        
        <p className="text-gray-500 text-sm mb-8">
          会话ID: {sessionId || 'N/A'}
        </p>

        {/* 功能亮点 */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Crown className="w-5 h-5 text-yellow-500 mr-2" />
            您已解锁的新功能：
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Zap className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">无限AI写作生成（每月1000次额度）</span>
            </li>
            <li className="flex items-start">
              <Sparkles className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">所有高级写作风格和模板</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5 flex items-center justify-center">
                ⚡
              </div>
              <span className="text-gray-700">优先响应速度和专属支持</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5 flex items-center justify-center">
                🚫
              </div>
              <span className="text-gray-700">无广告的纯净写作体验</span>
            </li>
          </ul>
        </div>

        {/* 下一步提示 */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-700 mb-3">接下来做什么？</h4>
          <div className="space-y-3">
            <Link
              href="/write"
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              开始无限写作
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="block w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              查看账户仪表板
            </Link>
          </div>
        </div>

        {/* 倒计时 */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            <span className="inline-block w-6 text-gray-700 font-medium">{countdown}</span> 秒后自动跳转到写作页面
          </p>
          <button
            onClick={() => router.push('/write')}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            立即跳转
          </button>
        </div>

        {/* 支持信息 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            需要帮助？{' '}
            <a href="mailto:support@lingxian.ai" className="text-blue-600 hover:text-blue-700 font-medium">
              联系客服
            </a>
          </p>
          <p className="text-gray-400 text-xs mt-2">
            支付收据已发送到您的邮箱，您也可以在账户设置中查看订阅详情。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UpgradeSuccessPageContent />
    </Suspense>
  );
}