"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, RefreshCw, Database, Settings, History, FileText, Bookmark, Trash2 } from "lucide-react";

const TEST_USER_ID = "dd56cd18-0e2c-47c2-9928-b829c0205a81";

export default function TestDataPage() {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setIsTesting(true);
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setResults(prev => [...prev, {
        name,
        status: "passed",
        duration,
        message: result.message,
        data: result.data
      }]);
      
    } catch (error: any) {
      setResults(prev => [...prev, {
        name,
        status: "failed",
        duration: 0,
        message: error.message,
        error: error.stack
      }]);
    } finally {
      setIsTesting(false);
    }
  };

  const testDatabaseConnection = async () => {
    const response = await fetch("/api/test-db-connection");
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "数据库连接失败");
    }
    
    return {
      message: "数据库连接成功",
      data: data.data
    };
  };

  const testUserSettings = async () => {
    // 保存设置
    const saveResponse = await fetch("/api/test-user-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        writingStyle: "creative",
        emotionIntensity: 80,
        creativityLevel: 90
      })
    });
    
    const saveData = await saveResponse.json();
    
    if (!saveData.success) {
      throw new Error(`保存失败: ${saveData.error}`);
    }
    
    // 读取设置
    const readResponse = await fetch(`/api/test-user-settings?userId=${TEST_USER_ID}`);
    const readData = await readResponse.json();
    
    if (!readData.success) {
      throw new Error(`读取失败: ${readData.error}`);
    }
    
    return {
      message: "用户设置测试通过",
      data: readData.data
    };
  };

  const testWritingHistory = async () => {
    const response = await fetch("/api/test-writing-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        topic: "测试写作主题",
        content: "这是一个测试写作内容。",
        wordCount: 5
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`创建失败: ${data.error}`);
    }
    
    return {
      message: "写作历史测试通过",
      data: data.data
    };
  };

  const testDrafts = async () => {
    const response = await fetch("/api/test-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        title: "测试草稿",
        content: "这是一个测试草稿内容。",
        draftType: "manual"
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`创建失败: ${data.error}`);
    }
    
    return {
      message: "草稿测试通过",
      data: data.data
    };
  };

  const testInspirations = async () => {
    const response = await fetch("/api/test-inspirations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        title: "测试灵感",
        content: "这是一个测试灵感内容。",
        tags: ["测试", "灵感"]
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`创建失败: ${data.error}`);
    }
    
    return {
      message: "灵感收藏测试通过",
      data: data.data
    };
  };

  const runAllTests = async () => {
    setResults([]);
    
    const tests = [
      { name: "数据库连接", fn: testDatabaseConnection },
      { name: "用户设置", fn: testUserSettings },
      { name: "写作历史", fn: testWritingHistory },
      { name: "草稿管理", fn: testDrafts },
      { name: "灵感收藏", fn: testInspirations }
    ];
    
    for (const test of tests) {
      await runTest(test.name, test.fn);
    }
    
    // 获取统计信息
    await getStats();
  };

  const getStats = async () => {
    try {
      const response = await fetch(`/api/test-cleanup?userId=${TEST_USER_ID}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("获取统计失败:", error);
    }
  };

  const cleanupData = async () => {
    setIsTesting(true);
    
    try {
      const response = await fetch(`/api/test-cleanup?userId=${TEST_USER_ID}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults([]);
        setStats(null);
        alert(`数据清理完成，删除了 ${data.totalDeleted} 条记录`);
      } else {
        alert(`清理失败: ${data.error}`);
      }
    } catch (error: any) {
      alert(`清理异常: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const passedTests = results.filter(r => r.status === "passed").length;
  const totalTests = results.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据持久化功能测试</h1>
          <p className="text-gray-600">测试用户ID: {TEST_USER_ID}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">测试控制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={runAllTests}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    运行所有测试
                  </>
                )}
              </Button>
              
              <Button
                onClick={cleanupData}
                variant="outline"
                disabled={isTesting}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清理测试数据
              </Button>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>通过率:</span>
                  <span className="font-medium">
                    {totalTests > 0 ? `${((passedTests / totalTests) * 100).toFixed(1)}%` : "0%"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>测试数:</span>
                  <span>{passedTests}/{totalTests}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">数据统计</CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.stats?.user_settings?.count || 0}</div>
                    <div className="text-sm text-gray-600">用户设置</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <History className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.stats?.writing_history?.count || 0}</div>
                    <div className="text-sm text-gray-600">写作历史</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.stats?.drafts?.count || 0}</div>
                    <div className="text-sm text-gray-600">草稿</div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Bookmark className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.stats?.inspiration_collections?.count || 0}</div>
                    <div className="text-sm text-gray-600">灵感收藏</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无统计数据</p>
                  <p className="text-sm">运行测试后查看数据统计</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
            <CardDescription>详细测试结果和日志</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>尚未运行测试</p>
                <p className="text-sm mt-2">点击"运行所有测试"按钮开始测试</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === "passed"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {result.status === "passed" ? (
                          <Check className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <X className="w-5 h-5 text-red-600 mr-3" />
                        )}
                        <div>
                          <h3 className="font-medium">{result.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.duration}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-gray-500">
          <p>💡 提示：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>测试数据使用独立的测试用户ID，不会影响真实用户数据</li>
            <li>测试完成后可以使用"清理测试数据"按钮清除所有测试数据</li>
            <li>所有测试API都包含完整的错误处理</li>
            <li>测试页面仅用于开发环境验证功能</li>
          </ul>
        </div>
      </div>
    </div>
  );
}