#!/usr/bin/env python3
"""
灵光网站备用启动脚本 - 使用Python HTTP服务器
当Next.js不稳定时使用这个
"""

import http.server
import socketserver
import os
import sys
import threading
import time
from pathlib import Path

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自定义HTTP处理器，支持SPA路由"""
    
    def do_GET(self):
        # 如果是API请求，返回模拟数据
        if self.path.startswith('/api/'):
            self.handle_api()
            return
        
        # 如果是静态文件，正常服务
        file_path = self.translate_path(self.path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            super().do_GET()
        else:
            # SPA路由：所有其他请求返回index.html
            self.send_index()
    
    def handle_api(self):
        """处理API请求"""
        if self.path == '/api/generate/stream':
            self.handle_stream_api()
        elif self.path == '/api/generate':
            self.handle_generate_api()
        else:
            self.send_error(404, "API not found")
    
    def handle_stream_api(self):
        """处理流式API"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.end_headers()
        
        # 模拟流式响应
        response_text = """# 武侠与赛博朋克的跨界故事

## 人物设定
**李寻欢** - 28岁，前江湖剑客，现为赛博义体医生
- **背景**：因家族被灭门，放弃江湖，学习赛博医术
- **能力**：古武剑法 + 赛博义体改造技术
- **性格**：外表冷漠，内心坚守侠义之道

**赛琳娜** - 25岁，AI意识体，前人类记忆的数字化存在
- **背景**：为逃避记忆清除，将自己上传到网络
- **能力**：数据操控、虚拟现实构建
- **性格**：表面理性，实则渴望重新获得人类体验

## 开篇场景
夜雨中的新长安城，霓虹灯在雨中晕开成一片模糊的光海。
李寻欢的诊所藏在最底层的贫民区，招牌上"赛华佗义体诊所"几个字忽明忽暗。

"医生，我的记忆芯片...又出问题了。"
一个戴着兜帽的身影推门而入，雨水顺着防水斗篷滴落。

李寻欢头也不抬，手中的激光手术刀精准地切割着义体神经束。
"赛琳娜，我说过，人类的记忆不适合长期存储在硅基芯片里。"

兜帽落下，露出一张完美得不真实的脸——那是她为自己选择的虚拟形象。
"但我已经...没有其他地方可以去了。"

窗外，巨大的全息广告投射着"记忆清除服务，还你一个清净的明天"。
李寻欢放下手术刀，叹了口气。
"江湖和赛博空间，其实没什么不同。"
"都是人在追逐自己得不到的东西。"

---
*"我的剑能斩断钢铁，却斩不断数据流中的情丝。" - 李寻欢*"""
        
        # 分割成小块模拟流式传输
        chunks = [response_text[i:i+10] for i in range(0, len(response_text), 10)]
        
        for i, chunk in enumerate(chunks):
            event = f"data: {{\"type\":\"chunk\",\"content\":\"{chunk}\",\"tokens\":5}}\n\n"
            self.wfile.write(event.encode('utf-8'))
            self.wfile.flush()
            time.sleep(0.05)  # 50ms延迟
        
        # 发送完成事件
        complete_event = f"data: {{\"type\":\"complete\",\"totalTokens\":{len(response_text)//4},\"estimatedCost\":0.0001,\"generationId\":\"mock-{int(time.time())}\",\"modelUsed\":\"mock-model\"}}\n\n"
        self.wfile.write(complete_event.encode('utf-8'))
    
    def handle_generate_api(self):
        """处理普通生成API"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        response = {
            "success": True,
            "data": {
                "content": "这是一个模拟的AI生成响应。在实际使用中，这里会连接真实的AI API。",
                "tokensUsed": 100,
                "estimatedCost": 0.0002,
                "generationId": f"mock-{int(time.time())}",
                "modelUsed": "mock-model"
            }
        }
        
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def send_index(self):
        """发送index.html"""
        index_path = os.path.join(self.directory, 'index.html')
        
        if not os.path.exists(index_path):
            # 如果没有index.html，创建一个简单的
            self.create_simple_index()
            return
        
        try:
            with open(index_path, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading index.html: {str(e)}")
    
    def create_simple_index(self):
        """创建简单的首页"""
        html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>灵光 · AI写作智能体（备用服务器）</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            max-width: 800px;
            padding: 2rem;
            text-align: center;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }
        .btn {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            margin: 0.5rem;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .info {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">✨</div>
        <h1>灵光 · AI写作智能体</h1>
        <p>你的专属灵感激发师</p>
        
        <div class="status">
            <h2>🔧 备用服务器运行中</h2>
            <p>Next.js主服务器可能暂时不可用，这是备用Python服务器。</p>
            <p>基础功能可用，但部分高级功能可能受限。</p>
        </div>
        
        <div>
            <a href="/api/generate/stream" class="btn" target="_blank">测试流式API</a>
            <a href="/api/generate" class="btn" target="_blank">测试普通API</a>
        </div>
        
        <div class="info">
            <p>服务器运行在: http://localhost:3000</p>
            <p>启动时间: """ + time.strftime("%Y-%m-%d %H:%M:%S") + """</p>
            <p>如需完整功能，请重启Next.js主服务器</p>
        </div>
    </div>
</body>
</html>"""
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(html)))
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
    
    def translate_path(self, path):
        """转换路径，支持SPA"""
        # 清理路径
        path = path.split('?', 1)[0]
        path = path.split('#', 1)[0]
        
        # 如果是根路径，返回index.html
        if path == '/':
            return os.path.join(self.directory, 'index.html')
        
        # 否则尝试查找文件
        return os.path.join(self.directory, path[1:])

def check_port(port):
    """检查端口是否可用"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def main():
    """主函数"""
    print("🚀 启动灵光网站备用服务器")
    print("=" * 50)
    
    # 设置工作目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    PORT = 3000
    
    # 检查端口
    if not check_port(PORT):
        print(f"❌ 端口 {PORT} 已被占用")
        print("尝试使用端口 3001...")
        PORT = 3001
    
    # 设置处理器
    handler = SimpleHTTPRequestHandler
    handler.directory = script_dir
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"✅ 服务器启动成功!")
            print(f"🌐 访问地址: http://localhost:{PORT}")
            print(f"📁 服务目录: {script_dir}")
            print("\n🔧 功能说明:")
            print("  - 静态文件服务")
            print("  - SPA路由支持（所有路径返回index.html）")
            print("  - 模拟流式API (/api/generate/stream)")
            print("  - 模拟普通API (/api/generate)")
            print("\n按 Ctrl+C 停止服务器")
            print("=" * 50)
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # 确保有json模块
    try:
        import json
    except ImportError:
        import sys
        print("❌ 需要json模块")
        sys.exit(1)
    
    main()