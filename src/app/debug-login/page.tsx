'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabase = createClient();
      
      console.log('测试直接登录...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Email:', email);
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('登录错误:', loginError);
        setError(`登录失败: ${loginError.message}`);
        setResult({ error: loginError });
      } else {
        console.log('登录成功:', data);
        setResult({ success: true, data });
        setError(null);
      }
    } catch (err: any) {
      console.error('异常错误:', err);
      setError(`异常: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testServerLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('测试服务器端登录...');
      
      const response = await fetch('/api/debug-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(`服务器错误: ${data.error || response.statusText}`);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error('请求错误:', err);
      setError(`请求失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabase = createClient();
      
      console.log('测试Supabase连接...');
      
      // 测试简单的查询
      const { data, error: queryError } = await supabase
        .from('user_settings')
        .select('count')
        .limit(1);

      if (queryError) {
        setError(`查询错误: ${queryError.message}`);
        setResult({ error: queryError });
      } else {
        setResult({ success: true, data });
        setError(null);
      }
    } catch (err: any) {
      setError(`连接异常: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">登录问题诊断</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧：测试表单 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">测试登录</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="test@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="password123"
                />
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={testDirectLogin}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  测试直接登录
                </button>
                
                <button
                  onClick={testServerLogin}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  测试服务器端登录
                </button>
                
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  测试数据库连接
                </button>
              </div>
            </div>
          </div>
          
          {/* 右侧：结果展示 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">测试结果</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">测试中...</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <h3 className="font-medium text-red-800 mb-2">❌ 错误</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">✅ 结果</h3>
                  <pre className="text-sm text-gray-800 overflow-auto max-h-60">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">🔍 环境信息</h3>
                  <div className="text-sm space-y-1">
                    <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                    <p>Site URL: {process.env.NEXT_PUBLIC_SITE_URL}</p>
                    <p>环境: {process.env.NODE_ENV}</p>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && !error && !result && (
              <div className="text-center py-8 text-gray-500">
                点击左侧按钮开始测试
              </div>
            )}
          </div>
        </div>
        
        {/* 问题诊断 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">常见问题诊断</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-yellow-700 mb-2">1. "fetch failed" 错误</h3>
              <ul className="list-disc pl-5 text-yellow-600 space-y-1">
                <li>检查网络连接</li>
                <li>检查Supabase项目是否正常运行</li>
                <li>检查环境变量是否正确配置</li>
                <li>检查浏览器控制台Network标签</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-yellow-700 mb-2">2. CORS问题</h3>
              <ul className="list-disc pl-5 text-yellow-600 space-y-1">
                <li>在Supabase控制台检查CORS配置</li>
                <li>确保localhost:3000在允许的域名列表中</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-yellow-700 mb-2">3. 环境变量问题</h3>
              <ul className="list-disc pl-5 text-yellow-600 space-y-1">
                <li>重启服务器使环境变量生效</li>
                <li>检查.env.local文件是否正确</li>
                <li>确保变量名没有拼写错误</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}