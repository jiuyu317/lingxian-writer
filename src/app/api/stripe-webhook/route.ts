import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 在实际部署中，您需要：
// 1. 安装Stripe SDK: npm install stripe
// 2. 配置Stripe密钥
// 3. 验证Webhook签名

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    
    // 这里应该验证Stripe Webhook签名
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    
    // 暂时解析JSON进行模拟
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // 根据事件类型处理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const billingCycle = session.metadata?.billingCycle;
        
        if (!userId || !planId) {
          console.error('Missing metadata in checkout session:', session);
          break;
        }
        
        // 根据计划ID确定订阅等级和额度
        let subscriptionTier: 'free' | 'pro' = 'free';
        let creditsToAdd = 0;
        
        if (planId === 'pro') {
          subscriptionTier = 'pro';
          creditsToAdd = billingCycle === 'yearly' ? 12000 : 1000;
        } else if (planId === 'enterprise') {
          subscriptionTier = 'pro'; // 企业版也标记为pro
          creditsToAdd = billingCycle === 'yearly' ? 120000 : 10000;
        }
        
        // 更新用户额度和订阅等级
        const { error: updateError } = await supabase
          .from('user_settings')
          .update({
            subscription_tier: subscriptionTier,
            ai_credits: creditsToAdd,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Failed to update user settings:', updateError);
        }
        
        // 记录支付
        const { error: paymentError } = await supabase
          .from('payment_records')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'succeeded',
            subscription_tier: subscriptionTier,
            credits_awarded: creditsToAdd
          });
        
        if (paymentError) {
          console.error('Failed to record payment:', paymentError);
        }
        
        console.log(`Payment processed for user ${userId}, plan: ${planId}, credits: ${creditsToAdd}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // 根据customerId查找用户
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();
        
        if (userSettings) {
          // 将用户降级为免费版
          const { error } = await supabase
            .from('user_settings')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              ai_credits: 10 // 重置为免费额度
            })
            .eq('user_id', userSettings.user_id);
          
          if (error) {
            console.error('Failed to downgrade user:', error);
          }
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        // 更新订阅结束日期
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('user_id, subscription_end_date')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
        
        if (userSettings) {
          const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 延长30天
          const { error } = await supabase
            .from('user_settings')
            .update({
              subscription_end_date: newEndDate.toISOString(),
              subscription_status: 'active'
            })
            .eq('user_id', userSettings.user_id);
          
          if (error) {
            console.error('Failed to update subscription end date:', error);
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        // 标记订阅为过期
        const { error } = await supabase
          .from('user_settings')
          .update({
            subscription_status: 'past_due'
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        if (error) {
          console.error('Failed to mark subscription as past due:', error);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}

// 模拟创建Checkout会话的API
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Stripe Webhook endpoint is ready',
    note: 'In production, configure Stripe webhook to point to this URL',
    required_env_vars: [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
    ]
  });
}