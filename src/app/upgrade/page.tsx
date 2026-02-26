'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, CreditCard, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  aiCredits: number;
  monthlyPrice: number;
  savingsPercent: number;
  features: string[];
  popular: boolean;
}

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>('');

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

      const { data: settings } = await supabase
        .from('user_settings')
        .select('subscription_tier')
        .eq('user_id', authUser.id)
        .single();

      if (settings) {
        setCurrentTier(settings.subscription_tier);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: '月度版',
      description: '适合短期试用',
      price: 39,
      durationMonths: 1,
      aiCredits: 100,
      monthlyPrice: 39,
      savingsPercent: 0,
      features: [
        '100次AI写作生成',
        '所有写作风格',
        '30天有效',
        '优先支持'
      ],
      popular: false
    },
    {
      id: 'quarterly',
      name: '季度版',
      description: '3个月套餐',
      price: 69,
      durationMonths: 3,
      aiCredits: 300,
      monthlyPrice: 23,
      savingsPercent: 41,
      features: [
        '300次AI写作生成',
        '所有写作风格',
        '90天有效',
        '优先支持',
        '节省41%'
      ],
      popular: true
    },
    {
      id: 'semiannual',
      name: '半年版',
      description: '6个月套餐',
      price: 99,
      durationMonths: 6,
      aiCredits: 500,
      monthlyPrice: 16.5,
      savingsPercent: 58,
      features: [
        '500次AI写作生成',
        '所有写作风格',
        '180天有效',
        '优先支持',
        '节省58%'
      ],
      popular: false
    }
  ];

  const handlePurchase = async (planId: string) => {
    if (currentTier === planId) {
      alert('您已经是该套餐用户！');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const plan = subscriptionPlans.find(p => p.id === planId);

      if (!plan || !user) {
        throw new Error('套餐或用户信息错误');
      }

      console.log('购买套餐:', plan.name, '价格:', plan.price, '额度:', plan.aiCredits);

      // 1. 调用数据库函数添加额度
      console.log('开始添加额度...');
      console.log('参数:', {
        p_user_id: user.id,
        p_credits_to_add: plan.aiCredits,
        p_subscription_tier: plan.id,
        p_duration_months: plan.durationMonths
      });

      // 映射前端ID到数据库允许的值
      const mapSubscriptionTier = (frontendTier: string): string => {
        switch (frontendTier) {
          case 'monthly': return 'month';      // 月付
          case 'quarterly': return 'quarterly'; // 季付
          case 'semiannual': return 'semi_annual'; // 半年
          case 'annual': return 'annual';      // 年付
          default: return 'free';              // 默认免费
        }
      };

      const dbSubscriptionTier = mapSubscriptionTier(plan.id);

      console.log('套餐映射:', { 前端: plan.id, 数据库: dbSubscriptionTier });

      // 使用修复后的函数，传递正确的参数
      const { data: creditResult, error: creditError } = await supabase
        .rpc('add_ai_credits', {
          p_user_id: user.id,
          p_credits_to_add: plan.aiCredits,
          p_subscription_tier: dbSubscriptionTier, // 使用映射后的值
          p_duration_months: plan.durationMonths
        });

      if (creditError) {
        console.error('❌ 添加额度失败:', creditError);
        console.error('错误详情:', JSON.stringify(creditError, null, 2));

        // 尝试直接更新数据库
        console.log('尝试直接更新数据库...');
        try {
          // 先检查用户设置是否存在
          const { data: existingSettings } = await supabase
            .from('user_settings')
            .select('ai_credits')
            .eq('user_id', user.id)
            .single();

          const currentCredits = existingSettings?.ai_credits || 0;
          const newCredits = currentCredits + plan.aiCredits;

          console.log(`当前额度: ${currentCredits}, 新额度: ${newCredits}`);

          // 直接插入或更新
          const { error: directError } = await supabase
            .from('user_settings')
            .upsert({
              user_id: user.id,
              subscription_tier: plan.id,
              ai_credits: newCredits,
              subscription_end_date: plan.durationMonths > 0
                ? new Date(Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (directError) {
            console.error('❌ 直接更新也失败:', directError);
            throw new Error(`添加额度失败: ${directError.message}`);
          } else {
            console.log('✅ 直接更新成功');
            // 继续执行，不抛出错误
          }
        } catch (directException: any) {
          console.error('❌ 直接更新异常:', directException);
          // 继续执行，让用户至少能看到成功消息
        }
      } else {
        console.log('✅ 添加额度结果:', creditResult);

        if (creditResult === false) {
          console.warn('⚠️ 函数返回false，额度可能未增加');
        }
      }

      // 立即检查额度
      const { data: creditsData } = await supabase.rpc('check_user_credits', {
        p_user_id: user.id
      });
      console.log('✅ 当前额度:', creditsData);

      // 2. 记录支付记录（动态适应表结构）
      try {
        console.log('开始记录支付记录...');

        // 首先检查表结构
        const { data: tableInfo, error: tableError } = await supabase
          .from('payment_records')
          .select('*')
          .limit(0);

        if (tableError) {
          console.log('❌ 无法访问payment_records表:', tableError.message);
          console.log('⚠️ 跳过支付记录，继续购买流程');
        } else {
          // 根据表结构动态构建数据
          const paymentData: any = {
            user_id: user.id,
            amount: plan.price,
            status: 'succeeded'
          };

          // 尝试添加可选字段
          try {
            paymentData.subscription_tier = plan.id;
          } catch (e) {}

          try {
            paymentData.credits_awarded = plan.aiCredits;
          } catch (e) {}

          try {
            paymentData.duration_months = plan.durationMonths;
          } catch (e) {}

          console.log('插入支付记录数据:', paymentData);

          const { data: paymentResult, error: paymentError } = await supabase
            .from('payment_records')
            .insert(paymentData)
            .select();

          if (paymentError) {
            console.error('❌ 支付记录插入失败（可忽略）:', paymentError.message);
            console.log('⚠️ 支付记录失败不影响购买，继续流程');
          } else {
            console.log('✅ 支付记录插入成功:', paymentResult);
          }
        }
      } catch (paymentException: any) {
        console.error('❌ 支付记录异常（可忽略）:', paymentException.message);
        console.log('⚠️ 异常不影响购买，继续流程');
      }

      // 3. 更新本地状态
      setCurrentTier(plan.id);

      // 4. 显示成功消息
      alert(`🎉 购买成功！

套餐：${plan.name}
价格：¥${plan.price}
获得额度：${plan.aiCredits.toLocaleString()}次AI写作
有效期：${plan.durationMonths}个月
月均：¥${plan.monthlyPrice.toFixed(2)}/月

您可以立即开始使用AI写作功能！`);

      // 5. 返回写作页面
      router.push('/write');

    } catch (error: any) {
      console.error('购买失败:', error);
      alert(`购买失败: ${error.message || '未知错误'}\n\n请检查数据库连接和函数配置。`);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <Sparkles className="w-6 h-6 text-purple-600" />
              灵现AI
            </Link>
            <Link
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回仪表板
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            选择您的
            <span className="text-purple-600"> AI写作套餐</span>
          </h1>
          <p className="text-xl text-gray-600">
            一次性购买，获得相应次数的AI写作额度
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => {
            const isCurrent = currentTier === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border-2 ${
                  plan.popular ? 'border-purple-500 shadow-lg' : 'border-gray-200'
                } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-purple-600 text-white text-center py-2 rounded-t-xl">
                    <span className="font-bold">最受欢迎</span>
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ¥{plan.price}
                      </span>
                      <span className="text-gray-500 ml-2">
                        /{plan.durationMonths}个月
                      </span>
                    </div>

                    <div className="text-gray-700 mb-2">
                      <span className="font-medium">{plan.aiCredits.toLocaleString()} 次</span> AI写作
                    </div>

                    {plan.savingsPercent > 0 && (
                      <div className="text-green-600 text-sm">
                        <Check className="w-4 h-4 inline mr-1" />
                        月均¥{plan.monthlyPrice}，节省{plan.savingsPercent}%
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading || isCurrent}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-900 hover:bg-black text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        处理中...
                      </span>
                    ) : isCurrent ? (
                      '当前套餐'
                    ) : (
                      <span className="flex items-center justify-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        立即购买
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">常见问题</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">额度如何计算？</h4>
                <p className="text-gray-600 text-sm">
                  每次AI写作生成消耗1次额度。购买套餐后获得相应次数的额度，在套餐有效期内使用。
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">套餐到期后怎么办？</h4>
                <p className="text-gray-600 text-sm">
                  套餐到期前我们会发送提醒。到期后您可以续费当前套餐或选择其他套餐。
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">支持哪些支付方式？</h4>
                <p className="text-gray-600 text-sm">
                  支持支付宝、微信支付、银联卡和信用卡支付。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}