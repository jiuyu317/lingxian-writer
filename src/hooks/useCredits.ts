'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CreditStatus {
  hasCredits: boolean;
  currentCredits: number;
  subscriptionTier: 'free' | 'pro';
  isLoading: boolean;
  error: string | null;
}

interface UseCreditsReturn extends CreditStatus {
  checkCredits: () => Promise<boolean>;
  useCredit: () => Promise<boolean>;
  refreshCredits: () => Promise<void>;
}

export function useCredits(): UseCreditsReturn {
  const [status, setStatus] = useState<CreditStatus>({
    hasCredits: true,
    currentCredits: 10,
    subscriptionTier: 'free',
    isLoading: false,
    error: null,
  });

  const getCurrentUser = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }
    return user;
  }, []);

  const checkCredits = useCallback(async (): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await getCurrentUser();
      const supabase = createClient();
      
      const { data, error } = await supabase
        .rpc('check_user_credits', { p_user_id: user.id });

      if (error) throw error;

      const creditData = data[0];
      const newStatus = {
        hasCredits: creditData.has_credits,
        currentCredits: creditData.current_credits,
        subscriptionTier: creditData.subscription_tier,
        isLoading: false,
        error: null,
      };

      setStatus(newStatus);
      return newStatus.hasCredits;
    } catch (error: any) {
      console.error('检查额度失败:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '检查额度失败',
      }));
      return false;
    }
  }, [getCurrentUser]);

  const useCredit = useCallback(async (): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await getCurrentUser();
      const supabase = createClient();
      
      const { data, error } = await supabase
        .rpc('use_ai_credit', { p_user_id: user.id });

      if (error) throw error;

      // 使用成功后刷新额度状态
      await checkCredits();
      
      return data;
    } catch (error: any) {
      console.error('使用额度失败:', error);
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '使用额度失败',
      }));
      return false;
    }
  }, [getCurrentUser, checkCredits]);

  const refreshCredits = useCallback(async () => {
    await checkCredits();
  }, [checkCredits]);

  // 组件挂载时初始化
  useEffect(() => {
    const initializeCredits = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await checkCredits();
        }
      } catch (error) {
        console.error('初始化额度检查失败:', error);
      }
    };

    initializeCredits();
  }, [checkCredits]);

  return {
    ...status,
    checkCredits,
    useCredit,
    refreshCredits,
  };
}

// 快速检查函数（不更新状态）
export async function quickCheckCredits(userId: string): Promise<{
  hasCredits: boolean;
  currentCredits: number;
  subscriptionTier: 'free' | 'pro';
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('check_user_credits', { p_user_id: userId });

    if (error) throw error;

    const creditData = data[0];
    return {
      hasCredits: creditData.has_credits,
      currentCredits: creditData.current_credits,
      subscriptionTier: creditData.subscription_tier,
    };
  } catch (error) {
    console.error('快速检查额度失败:', error);
    return {
      hasCredits: false,
      currentCredits: 0,
      subscriptionTier: 'free',
    };
  }
}

// 快速使用额度函数
export async function quickUseCredit(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('use_ai_credit', { p_user_id: userId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('快速使用额度失败:', error);
    return false;
  }
}