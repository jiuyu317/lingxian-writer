'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Check, Zap, Crown, CreditCard, Shield, Clock, 
  Infinity as InfinityIcon, ArrowLeft, Sparkles, Users,
  BadgeCheck, Star, Target, Rocket
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number | null;
  creditsMonthly: number;
  creditsYearly: number | null;
  features: string[];
  popular: boolean;
  recommended: boolean;
}

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login?redirect=/upgrade');
        return;
      }
      
      setUser(authUser);
      
      // 获取当前订阅等级
      const { data: settings } = await supabase
        .from('user_settings')
        .select('subscription_tier')
        .eq('user_id', authUser.id)
        .single();
      
      if (settings) {
        setCurrentTier(settings.subscription_tier as 'free' | 'pro');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: '免费版',
      description: '适合轻度用户和初次体验',
      priceMonthly: 0,
      priceYearly: 0,
      creditsMonthly: 10,
      creditsYearly: 120,
      features: [
        '每月10次AI写作生成',
        '基础写作风格',
        '标准响应速度',
        '社区支持',
        '基础创意参数',
        '内容保存功能'
      ],
      popular: false,
      recommended: false
    },
    {
      id: 'pro',
      name: '专业版',
      description: '适合内容创作者和专业人士',
      priceMonthly: 49,
      priceYearly: 490,
      creditsMonthly: 1000,
      creditsYearly: 12000,
      features: [
        '每月1000次AI写作生成',
        '所有写作风格和模板',
        '优先响应速度',
        '高级创意参数调节',
        '专属技术支持',
        '无广告体验',
        '批量生成功能',
        '自定义写作模板'
      ],
      popular: true,
      recommended: true
    },
    {
      id: 'enterprise',
      name: '企业版',
      description: '适合团队和企业用户',
      priceMonthly: 199,
      priceYearly: 1990,
      creditsMonthly: 10000,
      creditsYearly: 120000,
      features: [
        '每月10000次AI写作生成',
        '所有高级功能',
        '最高优先级响应',
        '团队协作功能',
        '定制训练模型',
        '专属客户经理',
        'SLA服务保障',
        'API访问权限',
        '白标解决方案'
      ],
      popular: false,
      recommended: false
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') {
      // 如果是选择免费版，直接返回
      router.push('/write');
      return;
    }

    if (currentTier === 'pro') {
      alert('您已经是专业版用户！');
      return;
    }

    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // 这里应该集成Stripe Checkout
      // 暂时模拟支付流程
      
      const price = selectedPlan === 'monthly' 
        ? subscriptionPlans.find(p => p.id === planId)?.priceMonthly || 49
        : subscriptionPlans.find(p => p.id === planId)?.priceYearly || 490;
      
      const credits = selectedPlan === 'monthly'
        ? subscriptionPlans.find(p => p.id === planId)?.creditsMonthly || 1000
        : subscriptionPlans.find(p => p.id === planId)?.creditsYearly || 12000;
      
      // 模拟Stripe Checkout
      console.log('开始支付流程:', {
        planId,
        billing: selectedPlan,
        price,
        credits
      });
      
      // 临时：直接调用添加额度函数（模拟支付成功）
      if (user) {
        const { data, error } = await supabase
          .rpc('add_ai_credits', {
            p_user_id: user.id,
            p_credits_to_add: credits,
            p_subscription_tier: 'pro'
          });
        
        if (error) throw error;
        
        // 记录支付（模拟）
        const { error: paymentError } = await supabase
          .from('payment_records')
          .insert({
            user_id: user.id,
            amount: price,
            status: 'succeeded',
            subscription_tier: 'pro',
            credits_awarded: credits
          });
        
        if (paymentError) console.error('记录支付失败:', paymentError);
        
        alert('升级成功！您现在是专业版用户。');
        router.push('/write');
      }
      
    } catch (error: any) {
      console.error('升级失败:', error);
      alert(`升级失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (planId: string) => {
    // 在实际应用中，这里应该：
    // 1. 调用后端API创建Stripe Checkout会话
    // 2. 重定向到Stripe支付页面
    // 3. 通过Webhook处理支付成功回调
    
    alert('Stripe支付集成开发中...\n\n在实际部署中，这里会跳转到Stripe支付页面。');
    
    // 模拟代码：
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     planId,
    //     billingCycle: selectedPlan,
    //     userId: user?.id
    //   })
    // });
    // 
    // const { url } = await response.json();
    // window.location.href = url;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 导航栏 */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <Sparkles className="w-6 h-6 text-purple-600" />
              灵现AI
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/write" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                返回写作
              </Link>
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {currentTier === 'pro' ? '专业版' : '免费版'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-12">
        {/* 标题区域 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            升级您的
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {' '}AI写作体验
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            选择适合您的订阅计划，解锁更多AI写作功能和额度
          </p>
          
          {/* 计费周期切换 */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedPlan === 'yearly'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              年付 <span className="ml-1 text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">节省20%</span>
            </button>
          </div>
        </div>

        {/* 计划对比 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => {
            const price = selectedPlan === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const credits = selectedPlan === 'monthly' ? plan.creditsMonthly : plan.creditsYearly;
            const isCurrentPlan = plan.id === currentTier;
            const isFreePlan = plan.id === 'free';
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                  plan.recommended
                    ? 'border-purple-500 shadow-xl shadow-purple-100'
                    : 'border-gray-200 shadow-lg'
                } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      最受欢迎
                    </div>
                  </div>
                )}
                
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      推荐选择
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* 计划标题 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {plan.id === 'pro' ? (
                        <Crown className="w-6 h-6 text-yellow-500" />
                      ) : plan.id === 'enterprise' ? (
                        <Users className="w-6 h-6 text-blue-500" />
                      ) : (
                        <Zap className="w-6 h-6 text-gray-500" />
                      )}
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  {/* 价格 */}
                  <div className="mb-8">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ¥{price?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-2">
                        /{selectedPlan === 'monthly' ? '月' : '年'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <InfinityIcon className="w-4 h-4 mr-1" />
                      <span className="font-medium">
                        {credits === 0 ? '10次/月' : credits?.toLocaleString() || '无限'} AI写作
                      </span>
                    </div>
                    {selectedPlan === 'yearly' && price! > 0 && (
                      <div className="mt-2 text-sm text-green-600 font-medium">
                        <Check className="w-4 h-4 inline mr-1" />
                        相比月付节省 ¥{(plan.priceMonthly * 12 - price!).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* 功能列表 */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-700 mb-4">包含功能</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 操作按钮 */}
                  <button
                    onClick={() => {
                      if (plan.id === 'free') {
                        handleUpgrade('free');
                      } else if (plan.id === 'pro') {
                        handleStripeCheckout('pro');
                      } else {
                        handleStripeCheckout('enterprise');
                      }
                    }}
                    disabled={loading || isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.recommended
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 hover:bg-black text-white shadow hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        处理中...
                      </span>
                    ) : isCurrentPlan ? (
                      <span className="flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 mr-2" />
                        当前计划
                      </span>
                    ) : isFreePlan ? (
                      '返回免费版'
                    ) : (
                      <span className="flex items-center justify-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        立即升级
                      </span>
                    )}
                  </button>

                  {isCurrentPlan && !isFreePlan && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      您正在享受此计划的所有权益
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 常见问题 */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">额度如何计算？</h3>
              <p className="text-gray-600">
                每次AI写作生成消耗1次额度。专业版用户每月有1000次额度，企业版有10000次。
                免费用户每月10次额度，每月1日自动重置。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">可以随时取消吗？</h3>
              <p className="text-gray-600">
                可以！您可以随时在账户设置中取消订阅。取消后，您的专业版权益将持续到当前计费周期结束，
                之后自动降级为免费版。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">支持哪些支付方式？</h3>
              <p className="text-gray-600">
                我们支持支付宝、微信支付、银联卡和信用卡支付。所有支付通过Stripe处理，
                确保您的支付信息安全。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">有免费试用吗？</h3>
              <p className="text-gray-600">
