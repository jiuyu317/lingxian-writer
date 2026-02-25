'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog('开始诊断...');
      setLoading(true);

      try {
        // 1. 测试Supabase客户端
        addLog('1. 创建Supabase客户端...');
        const supabase = createClient();
        addLog('✅ Supabase客户端创建成功');

        // 2. 测试认证
        addLog('2. 检查用户认证...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          addLog(`❌ 认证错误: ${authError.message}`);
        } else if (!user) {
          addLog('⚠️  用户未登录');
        } else {
          addLog(`✅ 用户已登录: ${user.email} (${user.id})`);
        }

        // 3. 测试数据库函数（如果用户已登录）
        if (user) {
          addLog('3. 测试检查额度函数...');
          const { data: checkData, error: checkError } = await supabase
            .rpc('check_user_credits', { p_user_id: user.id });
          
          if (checkError) {
            addLog(`❌ 检查额度函数错误: ${checkError.message}`);
            addLog(`   提示: 确保已执行 stripe-minimal.sql 脚本`);
          } else if (checkData && checkData[0]) {
            addLog(`✅ 检查额度成功:`);
            addLog(`   - 有额度: ${checkData[0].has_credits}`);
            addLog(`   - 当前额度: ${checkData[0].current_credits}`);
            addLog(`   - 订阅等级: ${checkData[0].subscription_tier}`);
          } else {
            addLog('⚠️  检查额度返回空数据');
          }

          // 4. 测试使用额度函数
          addLog('4. 测试使用额度函数...');
          const { data: useData, error: useError } = await supabase
            .rpc('use_ai_credit', { p_user_id: user.id });
          
          if (useError) {
            addLog(`❌ 使用额度函数错误: ${useError.message}`);
          } else {
            addLog(`✅ 使用额度函数调用成功: ${useData}`);
          }
        }

        // 5. 测试环境变量
        addLog('5. 检查环境变量...');
        const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        addLog(`   - NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '已设置' : '未设置'}`);
        addLog(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '已设置' : '未设置'}`);

        if (!hasSupabaseUrl || !hasSupabaseKey) {
          addLog('❌ 缺少必要的Supabase环境变量');
        }

        addLog('✅ 诊断完成');

      } catch (error: any) {
        addLog(`❌ 诊断过程中出现异常: ${error.message}`);
        addLog(`   堆栈: ${error.stack}`);
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  const copyLogs = () => {
    const text = logs.join('\n');
    navigator.clipboard.writeText(text);
    addLog('📋 日志已复制到剪贴板');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">系统诊断工具</h1>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={copyLogs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            复制日志
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            清空日志
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            重新诊断
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">诊断说明</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>此页面用于诊断会员系统集成问题</li>
            <li>检查Supabase连接、认证和数据库函数</li>
            <li>如果看到错误，请截图或复制日志</li>
            <li>访问 <a href="/write" className="text-blue-400 hover:underline">写作页面</a> 测试实际功能</li>
          </ul>
        </div>

        <div className="bg-black rounded-lg p-4 font-mono text-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">诊断日志</h2>
            {loading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                诊断中...
              </div>
            )}
          </div>
          
          <div className="h-96 overflow-y-auto whitespace-pre">
            {logs.length === 0 ? (
              <div className="text-gray-500">等待诊断结果...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log.includes('❌') ? (
                    <span className="text-red-400">{log}</span>
                  ) : log.includes('⚠️') ? (
                    <span className="text-yellow-400">{log}</span>
                  ) : log.includes('✅') ? (
                    <span className="text-green-400">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">常见问题解决</h3>
          <div className="space-y-2 text-sm">
            <p><strong>问题1: "函数不存在" 错误</strong></p>
            <p className="text-gray-300 ml-4">解决方案: 在Supabase SQL Editor中执行 stripe-minimal.sql 脚本</p>
            
            <p><strong>问题2: "用户未登录"</strong></p>
            <p className="text-gray-300 ml-4">解决方案: 先访问首页登录，然后返回此页面</p>
            
            <p><strong>问题3: 环境变量未设置</strong></p>
            <p className="text-gray-300 ml-4">解决方案: 检查 .env.local 文件中的Supabase配置</p>
          </div>
        </div>
      </div>
    </div>
  );
}