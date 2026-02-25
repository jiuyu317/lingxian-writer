import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 模拟Stripe Checkout创建
// 在实际部署中，您需要：
// 1. 安装Stripe SDK: npm install stripe
// 2. 配置Stripe密钥
// 3. 创建实际的价格ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, billingCycle, userId } = body;
    
    if (!planId || !billingCycle || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // 验证用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 定义计划价格（模拟）
    const plans = {
      pro: {
        monthly: {
          price: 4900, // 分
          priceId: 'price_pro_monthly', // 实际部署中使用Stripe Price ID
          credits: 1000
        },
        yearly: {
          price: 49000,
          priceId: 'price_pro_yearly',
          credits: 12000
        }
      },
      enterprise: {
        monthly: {
          price: 19900,
          priceId: 'price_enterprise_monthly',
          credits: 10000
        },
        yearly: {
          price: 199000,
          priceId: 'price_enterprise_yearly',
          credits: 120000
        }
      }
    };
    
    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }
    
    const priceInfo = plan[billingCycle as keyof typeof plan];
    if (!priceInfo) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }
    
    // 在实际部署中，这里应该：
    // 1. 创建Stripe Checkout会话
    // 2. 返回会话URL供前端重定向
    
    // 模拟响应
    const mockCheckoutUrl = `${request.nextUrl.origin}/upgrade/success?session_id=mock_${Date.now()}`;
    
    // 记录待处理的支付（在实际部署中，Stripe会处理）
    const { error: paymentError } = await supabase
      .from('payment_records')
      .insert({
        user_id: userId,
        amount: priceInfo.price / 100,
        status: 'pending',
        subscription_tier: planId,
        credits_awarded: priceInfo.credits
      });
    
    if (paymentError) {
      console.error('Failed to record pending payment:', paymentError);
    }
    
    return NextResponse.json({
      url: mockCheckoutUrl,
      sessionId: `mock_${Date.now()}`,
      message: 'In production, this would redirect to Stripe Checkout',
      planDetails: {
        planId,
        billingCycle,
        price: priceInfo.price / 100,
        credits: priceInfo.credits
      }
    });
    
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// 获取可用的订阅计划
export async function GET(request: NextRequest) {
  const plans = [
    {
      id: 'pro',
      name: '专业版',
      description: '适合内容创作者和专业人士',
      prices: {
        monthly: {
          amount: 49,
          credits: 1000,
          stripePriceId: 'price_pro_monthly'
        },
        yearly: {
          amount: 490,
          credits: 12000,
          stripePriceId: 'price_pro_yearly',
          savings: 98 // 节省金额
        }
      },
      features: [
        '每月1000次AI写作生成',
        '所有写作风格和模板',
        '优先响应速度',
        '高级创意参数调节',
        '专属技术支持',
        '无广告体验'
      ]
    },
    {
      id: 'enterprise',
      name: '企业版',
      description: '适合团队和企业用户',
      prices: {
        monthly: {
          amount: 199,
          credits: 10000,
          stripePriceId: 'price_enterprise_monthly'
        },
        yearly: {
          amount: 1990,
          credits: 120000,
          stripePriceId: 'price_enterprise_yearly',
          savings: 398
        }
      },
      features: [
        '每月10000次AI写作生成',
        '所有高级功能',
        '最高优先级响应',
        '团队协作功能',
        '定制训练模型',
        '专属客户经理'
      ]
    }
  ];
  
  return NextResponse.json({
    plans,
    currency: 'cny',
    note: 'In production, fetch prices from Stripe API'
  });
}