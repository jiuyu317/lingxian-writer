#!/bin/bash

# 灵光网站简单启动脚本 - 使用生产构建

echo "🚀 启动灵光AI写作智能体网站（生产模式）"
echo "======================================"

# 清理所有相关进程
echo "🧹 清理旧进程..."
pkill -f "next" 2>/dev/null
pkill -f "node.*lingguang" 2>/dev/null
sleep 1

# 检查并释放端口
echo "🔍 检查端口..."
for port in {3000..3010}; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⚠️  杀死占用端口 $port 的进程: $PID"
        kill -9 $PID 2>/dev/null
    fi
done

# 进入项目目录
cd "$(dirname "${BASH_SOURCE[0]}")"

# 检查是否已构建
if [ ! -d ".next/standalone" ] && [ ! -d ".next" ]; then
    echo "📦 需要构建项目..."
    npm run build
fi

echo "🚀 启动服务器..."
echo "--------------------------------------"
echo "网站地址: http://localhost:3000"
echo "按 Ctrl+C 停止"
echo "--------------------------------------"

# 设置Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=2048"

# 使用生产模式启动（更稳定）
if [ -d ".next/standalone" ]; then
    # Next.js 14+ 独立输出模式
    echo "⚡ 使用独立输出模式..."
    node .next/standalone/server.js
elif [ -d ".next" ]; then
    # 传统模式
    echo "⚡ 使用传统生产模式..."
    npm start
else
    echo "❌ 构建目录不存在，使用开发模式..."
    npm run dev
fi