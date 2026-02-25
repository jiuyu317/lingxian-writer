"use client";

import { useState, useRef, useEffect } from "react";

export default function TestStreamPage() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);

  // 测试函数式更新
  const testFunctionalUpdate = () => {
    console.log("测试函数式更新...");
    setText(""); // 清空
    
    const chunks = ["第一段", "第二段", "第三段", "第四段"];
    
    // 模拟流式接收
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        console.log(`收到块 ${index + 1}: "${chunk}"`);
        
        // 正确的方式：函数式更新
        setText(prev => prev + chunk + " ");
        
        // 错误的方式（会导致覆盖）：
        // setText(chunk + " ");
      }, index * 500);
    });
  };

  // 测试真实流式API
  const testRealStream = async () => {
    if (isStreaming) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    setText("开始流式测试...\n\n");

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          topic: '测试流式传输',
          length: 200,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  // 关键：使用函数式更新累积内容
                  setText(prev => prev + data.content);
                  
                  // 滚动到底部
                  if (textAreaRef.current) {
                    textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
                  }
                } else if (data.type === 'complete') {
                  console.log('测试完成:', data);
                  setText(prev => prev + `\n\n---\n测试完成，使用了 ${data.totalTokens} tokens`);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('测试已取消');
        setText(prev => prev + "\n\n---\n测试已取消");
      } else {
        console.error('测试失败:', error);
        setText(prev => prev + `\n\n---\n测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">流式传输修复测试</h1>
        
        <div className="mb-8 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">问题描述</h2>
            <p className="text-gray-700 mb-2">
              之前的问题：每次接收到新的数据块时，页面上只显示最后几个字符，前面的内容全被覆盖。
            </p>
            <p className="text-gray-700">
              根本原因：使用了错误的状态更新方式 <code>setText(chunk)</code>，而不是正确的 <code>setText(prev =&gt; prev + chunk)</code>。
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">测试控制</h2>
            <div className="flex gap-4">
              <button
                onClick={testFunctionalUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                测试函数式更新
              </button>
              
              <button
                onClick={testRealStream}
                className={`px-4 py-2 rounded ${isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {isStreaming ? '停止测试' : '测试真实流式API'}
              </button>
              
              <button
                onClick={() => setText("")}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                清空内容
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                状态: {isStreaming ? '🟢 流式传输中...' : '⏸️ 已停止'} | 字符数: {text.length}
              </div>
              <div
                ref={textAreaRef}
                className="h-96 overflow-auto bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap"
              >
                {text || "等待测试开始..."}
                {isStreaming && <span className="inline-block w-2 h-5 bg-gray-300 ml-1 animate-pulse" />}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2">✅ 正确显示的特征：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>内容应该累积显示，不会覆盖之前的内容</li>
                <li>每次收到新数据块，文本长度应该增加</li>
                <li>最终应该看到完整的生成内容</li>
                <li>滚动条应该自动跟随最新内容</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">代码示例</h2>
            <div className="space-y-4">
              <div>
                <p className="text-red-600 font-medium mb-2">❌ 错误的方式（会导致覆盖）：</p>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-auto">
{`// 每次都会覆盖之前的内容
setText(chunk);

// 在循环或回调中会导致只显示最后一块
chunks.forEach(chunk => {
  setText(chunk); // 错误！
});`}
                </pre>
              </div>
              
              <div>
                <p className="text-green-600 font-medium mb-2">✅ 正确的方式（累积显示）：</p>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-auto">
{`// 使用函数式更新累积内容
setText(prev => prev + chunk);

// 在循环或回调中正确累积
chunks.forEach(chunk => {
  setText(prev => prev + chunk); // 正确！
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}