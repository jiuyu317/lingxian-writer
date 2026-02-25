'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CreditStatus {
  hasCredits: boolean;
  currentCredits: number;
  subscriptionTier: string;
  isLoading: boolean;
  error: string | null;
  checkCredits: () => Promise<void>;
}

export function useCreditsSimple(): CreditStatus {
  const [status, setStatus] = useState<Omit<CreditStatus, 'checkCredits'>>({
    hasCredits: true,
    currentCredits: 10,
    subscriptionTier: 'free',
    isLoading: false,
    error: null,
  });

  const checkCredits = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: '用户未登录'
        }));
        return;
      }

      // 尝试检查额度，但捕获所有错误
      try {
        const { data, error } = await supabase
          .rpc('check_user_credits', { p_user_id: user.id });

        if (error) {
          console.warn('检查额度失败，使用默认值:', error.message);
          // 不抛出错误，使用默认值
          setStatus({
            hasCredits: true,
            currentCredits: 10,
            subscriptionTier: 'free',
            isLoading: false,
            error: null,
          });
          return;
        }

        if (data && data[0]) {
          setStatus({
            hasCredits: data[0].has_credits,
            currentCredits: data[0].current_credits,
            subscriptionTier: data[0].subscription_tier,
            isLoading: false,
            error: null,
          });
        }
      } catch (dbError: any) {
        console.warn('数据库函数调用失败，使用默认值:', dbError.message);
        setStatus({
          hasCredits: true,
          currentCredits: 10,
          subscriptionTier: 'free',
          isLoading: false,
          error: null,
        });
      }
      
    } catch (error: any) {
      console.error('检查额度失败:', error);
      setStatus({
        hasCredits: true,
        currentCredits: 10,
        subscriptionTier: 'free',
        isLoading: false,
        error: error.message || '检查失败',
      });
    }
  }, []);

  useEffect(() => {
    checkCredits();
  }, [checkCredits]);

  return {
    ...status,
    checkCredits,
  };
}

// 安全的使用额度函数
export async function safeUseCredit(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('use_ai_credit', { p_user_id: userId });

    if (error) {
      console.warn('使用额度失败:', error.message);
      return false;
    }

    return data;
  } catch (error) {
    console.error('使用额度异常:', error);
    return false;
  }
}