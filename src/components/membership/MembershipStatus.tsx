'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CreditCard, Zap, Crown, RefreshCw } from 'lucide-react';

interface MembershipStatus {
  has_credits: boolean;
  current_credits: number;
  subscription_tier: 'free' | 'pro';
}

export default function MembershipStatus() {
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserAndStatus();
  }, []);

  const fetchUserAndStatus = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      
      setUser(authUser);
      await fetchMembershipStatus(authUser.id);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('check_user_credits', { p_user_id: userId });

      if (error) throw error;
      setStatus(data[0]);
    } catch (error) {
      console.error('获取会员状态失败:', error);
    }
  };

  const handleUpgrade = () => {
    router.push('/upgrade');
  };

  const handleRefresh = async () => {
    if (user) {
      setLoading(true);
      await fetchMembershipStatus(user.id);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!status || !user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          无法获取会员状态，请重新登录
        </div>
      </div>
    );
  }

  const isPro = status.subscription_tier === 'pro';
  const creditsRemaining = status.current_credits;
  const isLowCredits = !isPro && creditsRemaining <= 3;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {isPro ? (
              <>
                <Crown className="w-5 h-5 text-yellow-500" />
                专业版会员
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-gray-500" />
                免费版用户
              </>
            )}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {isPro ? '享受无限AI写作和高级功能' : '基础功能，每月10次AI写作'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="刷新状态"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* 额度显示 */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">AI写作额度</span>
            <span className={`text-lg font-bold ${isPro ? 'text-blue-600' : 'text-gray-800'}`}>
              {isPro ? '无限' : `${creditsRemaining} 次`}
            </span>
          </div>
          
          {!isPro && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(creditsRemaining / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                本月已使用 {10 - creditsRemaining}/10 次，每月1日重置
              </p>
            </>
          )}
        </div>

        {/* 功能对比 */}
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-700 mb-3">功能对比</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">AI写作次数</span>
              <span className="font-medium">
                {isPro ? '无限' : '10次/月'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">响应速度</span>
              <span className="font-medium">
                {isPro ? '优先' : '标准'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">高级参数</span>
              <span className="font-medium">
                {isPro ? '✓ 全部可用' : '✗ 部分限制'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">专属支持</span>
              <span className="font-medium">
                {isPro ? '✓ 有' : '✗ 无'}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="pt-4">
          {isPro ? (
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">🎉 您已是专业版会员</p>
              <p className="text-green-600 text-sm mt-1">尽情享受无限AI写作吧！</p>
            </div>
          ) : (
            <>
              {isLowCredits && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm font-medium">
                    ⚠️ 额度仅剩 {creditsRemaining} 次
                  </p>
                  <p className="text-yellow-600 text-xs mt-1">
                    考虑升级到专业版，享受无限AI写作
                  </p>
                </div>
              )}
              
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                升级到专业版
              </button>
              
              <p className="text-center text-gray-500 text-xs mt-3">
                仅 ¥49/月 • 首月免费试用
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}