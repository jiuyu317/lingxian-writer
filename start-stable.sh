#!/bin/bash

# 灵光网站稳定启动脚本

echo "🚀 启动灵光AI写作智能体网站（稳定版）"
echo "======================================"

# 检查目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "项目目录: $SCRIPT_DIR"

# 清理旧进程
echo "🔧 清理旧进程..."
pkill -f "next" 2>/dev/null
pkill -f "node.*lingguang" 2>/dev/null
sleep 2

# 检查端口占用
echo "🔍 检查端口占用..."
for port in {3000..3010}; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "⚠️  端口 $port 被占用，正在清理..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
done

# 检查依赖
echo "📦 检查依赖..."
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules 不存在，正在安装..."
    npm install
fi

# 检查Next.js版本
echo "🔧 检查Next.js..."
NEXT_VERSION=$(grep '"next"' package.json | head -1 | sed 's/.*"next": "\([^"]*\)".*/\1/')
echo "Next.js版本: $NEXT_VERSION"

# 启动开发服务器（在前台运行，便于查看错误）
echo "🚀 启动开发服务器..."
echo "--------------------------------------"
echo "如果启动成功，请访问: http://localhost:3000"
echo "如果失败，请查看下面的错误信息"
echo "按 Ctrl+C 停止服务器"
echo "--------------------------------------"

# 设置环境变量避免内存问题
export NODE_OPTIONS="--max-old-space-size=4096"

# 在前台启动，这样可以看到所有输出
npm run dev

# 如果启动失败，显示错误
if [ $? -ne 0 ]; then
    echo "❌ 启动失败！尝试修复..."
    
    # 尝试清理缓存
    echo "🧹 清理缓存..."
    rm -rf .next 2>/dev/null
    rm -rf node_modules/.cache 2>/dev/null
    
    # 重新安装依赖
    echo "🔄 重新安装依赖..."
    npm install
    
    # 再次尝试启动
    echo "🚀 重新启动..."
    npm run dev
fi