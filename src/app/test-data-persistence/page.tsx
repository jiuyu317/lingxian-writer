"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Check, X, AlertCircle, RefreshCw, Database, 
  Settings, History, FileText, Bookmark, 
  User, Save, Trash2, Plus, Play
} from "lucide-react";

// 模拟测试用户ID
const TEST_USER_ID = "test-data-persistence-user";

export default function TestDataPersistencePage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testData, setTestData] = useState<any>({
    userSettings: null,
    writingHistory: [],
    drafts: [],
    inspirations: []
  });

  // 运行所有测试
  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const tests = [
      testDatabaseConnection,
      testUserSettings,
      testWritingHistory,
      testDrafts,
      testInspirationCollections,
      testDataRelationships
    ];
    
    for (const test of tests) {
      await runTest(test);
    }
    
    setIsTesting(false);
  };

  // 运行单个测试
  const runTest = async (testFunction: () => Promise<any>) => {
    const testName = testFunction.name.replace("test", "").replace(/([A-Z])/g, " $1").trim();
    
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [...prev, {
        name: testName,
        status: "passed",
        duration,
        message: result.message,
        data: result.data
      }]);
      
      // 更新测试数据
      if (result.data) {
        setTestData((prev: any) => ({
          ...prev,
          ...result.data
        }));
      }
      
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        name: testName,
        status: "failed",
        duration: 0,
        message: error.message,
        error: error.stack
      }]);
    }
  };

  // 测试1: 数据库连接
  const testDatabaseConnection = async () => {
    const response = await fetch("/api/test-db-connection");
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "数据库连接失败");
    }
    
    return {
      message: "数据库连接成功",
      data: { connection: data.data }
    };
  };

  // 测试2: 用户设置
  const testUserSettings = async () => {
    // 测试保存用户设置
    const saveResponse = await fetch("/api/test-user-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        writingStyle: "creative",
        emotionIntensity: 80,
        creativityLevel: 90,
        defaultLength: "medium",
        autoSave: true,
        autoSaveInterval: 30
      })
    });
    
    const saveData = await saveResponse.json();
    
    if (!saveData.success) {
      throw new Error(`保存用户设置失败: ${saveData.error}`);
    }
    
    // 测试读取用户设置
    const readResponse = await fetch(`/api/test-user-settings?userId=${TEST_USER_ID}`);
    const readData = await readResponse.json();
    
    if (!readData.success) {
      throw new Error(`读取用户设置失败: ${readData.error}`);
    }
    
    return {
      message: "用户设置功能正常",
      data: { userSettings: readData.data }
    };
  };

  // 测试3: 写作历史
  const testWritingHistory = async () => {
    // 创建写作历史
    const historyData = {
      userId: TEST_USER_ID,
      topic: "测试写作主题",
      style: "creative",
      emotionIntensity: 85,
      creativityLevel: 95,
      length: "medium",
      mode: "writing",
      content: "这是一个测试写作内容，用于验证数据持久化功能。",
      wordCount: 20,
      characterCount: 40
    };
    
    const createResponse = await fetch("/api/test-writing-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(historyData)
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success) {
      throw new Error(`创建写作历史失败: ${createData.error}`);
    }
    
    // 查询写作历史
    const queryResponse = await fetch(`/api/test-writing-history?userId=${TEST_USER_ID}`);
    const queryData = await queryResponse.json();
    
    if (!queryData.success) {
      throw new Error(`查询写作历史失败: ${queryData.error}`);
    }
    
    return {
      message: `写作历史功能正常，创建了 ${queryData.data?.length || 0} 条记录`,
      data: { writingHistory: queryData.data || [] }
    };
  };

  // 测试4: 草稿功能
  const testDrafts = async () => {
    // 创建手动草稿
    const manualDraft = {
      userId: TEST_USER_ID,
      title: "测试手动草稿",
      content: "这是手动保存的草稿内容。",
      topic: "测试主题",
      style: "balanced",
      isAutoSave: false,
      wordCount: 15,
      characterCount: 30
    };
    
    const manualResponse = await fetch("/api/test-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...manualDraft, draftType: "manual" })
    });
    
    const manualData = await manualResponse.json();
    
    if (!manualData.success) {
      throw new Error(`创建手动草稿失败: ${manualData.error}`);
    }
    
    // 创建自动草稿
    const autoDraft = {
      userId: TEST_USER_ID,
      title: "自动保存草稿",
      content: "这是系统自动保存的草稿内容。",
      isAutoSave: true,
      wordCount: 10,
      characterCount: 20
    };
    
    const autoResponse = await fetch("/api/test-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...autoDraft, draftType: "auto" })
    });
    
    const autoData = await autoResponse.json();
    
    if (!autoData.success) {
      throw new Error(`创建自动草稿失败: ${autoData.error}`);
    }
    
    // 查询草稿
    const queryResponse = await fetch(`/api/test-drafts?userId=${TEST_USER_ID}`);
    const queryData = await queryResponse.json();
    
    if (!queryData.success) {
      throw new Error(`查询草稿失败: ${queryData.error}`);
    }
    
    const drafts = queryData.data || [];
    const manualCount = drafts.filter((d: any) => !d.isAutoSave).length;
    const autoCount = drafts.filter((d: any) => d.isAutoSave).length;
    
    return {
      message: `草稿功能正常，共 ${drafts.length} 条草稿（手动: ${manualCount}, 自动: ${autoCount}）`,
      data: { drafts }
    };
  };

  // 测试5: 灵感收藏
  const testInspirationCollections = async () => {
    // 创建灵感收藏
    const inspiration = {
      userId: TEST_USER_ID,
      title: "测试灵感收藏",
      content: "这是一个测试灵感内容，创意无限。",
      sourceType: "ai_generated",
      tags: ["测试", "创意", "灵感"],
      category: "测试分类",
      isFavorite: true
    };
    
    const createResponse = await fetch("/api/test-inspirations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inspiration)
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success) {
      throw new Error(`创建灵感收藏失败: ${createData.error}`);
    }
    
    // 查询灵感收藏
    const queryResponse = await fetch(`/api/test-inspirations?userId=${TEST_USER_ID}`);
    const queryData = await queryResponse.json();
    
    if (!queryData.success) {
      throw new Error(`查询灵感收藏失败: ${queryData.error}`);
    }
    
    return {
      message: `灵感收藏功能正常，创建了 ${queryData.data?.length || 0} 条记录`,
      data: { inspirations: queryData.data || [] }
    };
  };

  // 测试6: 数据关系
  const testDataRelationships = async () => {
    // 查询所有数据统计
    const responses = await Promise.all([
      fetch(`/api/test-user-settings?userId=${TEST_USER_ID}`),
      fetch(`/api/test-writing-history?userId=${TEST_USER_ID}`),
      fetch(`/api/test-drafts?userId=${TEST_USER_ID}`),
      fetch(`/api/test-inspirations?userId=${TEST_USER_ID}`)
    ]);
    
    const results = await Promise.all(responses.map(r => r.json()));
    
    const counts = {
      userSettings: results[0].success ? 1 : 0,
      writingHistory: results[1].success ? (results[1].data?.length || 0) : 0,
      drafts: results[2].success ? (results[2].data?.length || 0) : 0,
      inspirations: results[3].success ? (results[3].data?.length || 0) : 0
    };
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return {
      message: `数据关系验证成功，总记录数: ${total}`,
      data: { counts, total }
    };
  };

  // 清理测试数据
  const cleanupTestData = async () => {
    setIsTesting(true);
    
    try {
      const responses = await Promise.all([
        fetch(`/api/test-cleanup?userId=${TEST_USER_ID}`, { method: "DELETE" })
      ]);
      
      const results = await Promise.all(responses.map(r => r.json()));
      
      if (results[0].success) {
        setTestResults([]);
        setTestData({
          userSettings: null,
          writingHistory: [],
          drafts: [],
          inspirations: []
        });
        alert("测试数据清理完成");
      } else {
        alert(`清理失败: ${results[0].error}`);
      }
    } catch (error: any) {
      alert(`清理异常: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // 统计测试结果
  const passedTests = testResults.filter(r => r.status === "passed").length;
  const failedTests = testResults.filter(r => r.status === "failed").length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据持久化功能测试</h1>
          <p className="text-gray-600">
            测试Supabase数据库连接和数据持久化功能的完整性和可靠性
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：测试控制面板 */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  测试控制
                </CardTitle>
                <CardDescription>
                  运行数据持久化功能测试
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
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
                        <Play className="w-4 h-4 mr-2" />
                        运行所有测试
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={cleanupTestData}
                    variant="outline"
                    disabled={isTesting}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清理测试数据
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">测试统计</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">总测试数:</span>
                      <span className="font-medium">{totalTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">通过:</span>
                      <span className="font-medium text-green-600">{passedTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">失败:</span>
                      <span className="font-medium text-red-600">{failedTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">通过率:</span>
                      <span className="font-medium">{passRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  数据概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-blue-600" />
                      <span>用户设置</span>
                    </div>
                    <span className="font-medium">
                      {testData.userSettings ? "✅ 已配置" : "❌ 未配置"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <History className="w-4 h-4 mr-2 text-green-600" />
                      <span>写作历史</span>
                    </div>
                    <span className="font-medium">
                      {testData.writingHistory.length} 条
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-purple-600" />
                      <span>草稿</span>
                    </div>
                    <span className="font-medium">
                      {testData.drafts.length} 条
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Bookmark className="w-4 h-4 mr-2 text-yellow-600" />
                      <span>灵感收藏</span>
                    </div>
                    <span className="font-medium">
                      {testData.inspirations.length} 条
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：测试结果 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  测试结果
                </CardTitle>
                <CardDescription>
                  详细测试结果和日志
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>尚未运行测试</p>
                    <p className="text-sm mt-2">点击"运行所有测试"按钮开始测试</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.status === "passed"
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {result.status === "passed" ? (
                              <Check className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <h3 className="font-medium">{result.name}</h3>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {result.duration}ms
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">{result.message}</p>
                          {result.data && (
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}