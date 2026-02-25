#!/bin/bash

# 灵光网站综合启动脚本
# 尝试多种方法启动网站

echo "🚀 灵光AI写作智能体 - 综合启动"
echo "======================================"

# 清理环境
cleanup() {
    echo "🧹 清理环境..."
    pkill -f "next" 2>/dev/null
    pkill -f "node.*lingguang" 2>/dev/null
    pkill -f "python.*start-backup" 2>/dev/null
    sleep 1
}

# 检查网站是否可访问
check_website() {
    echo "🔍 检查网站状态..."
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 网站正在运行: http://localhost:3000"
        return 0
    else
        echo "❌ 网站未运行"
        return 1
    fi
}

# 方法1: 尝试Next.js开发服务器
try_nextjs_dev() {
    echo "🔄 尝试方法1: Next.js开发服务器..."
    cleanup
    
    cd "$(dirname "${BASH_SOURCE[0]}")"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装依赖..."
        npm install
    fi
    
    # 在前台启动
    echo "🚀 启动Next.js开发服务器..."
    timeout 10 npm run dev 2>&1 &
    DEV_PID=$!
    
    sleep 3
    if check_website; then
        echo "🎉 Next.js开发服务器启动成功!"
        echo "PID: $DEV_PID"
        return 0
    else
        echo "❌ Next.js开发服务器启动失败"
        kill $DEV_PID 2>/dev/null
        return 1
    fi
}

# 方法2: 尝试Next.js生产服务器
try_nextjs_prod() {
    echo "🔄 尝试方法2: Next.js生产服务器..."
    cleanup
    
    cd "$(dirname "${BASH_SOURCE[0]}")"
    
    # 检查是否已构建
    if [ ! -d ".next" ]; then
        echo "🔨 构建项目..."
        npm run build
    fi
    
    # 启动生产服务器
    echo "🚀 启动生产服务器..."
    timeout 10 npm start 2>&1 &
    PROD_PID=$!
    
    sleep 3
    if check_website; then
        echo "🎉 Next.js生产服务器启动成功!"
        echo "PID: $PROD_PID"
        return 0
    else
        echo "❌ Next.js生产服务器启动失败"
        kill $PROD_PID 2>/dev/null
        return 1
    fi
}

# 方法3: 尝试Python备用服务器
try_python_backup() {
    echo "🔄 尝试方法3: Python备用服务器..."
    cleanup
    
    cd "$(dirname "${BASH_SOURCE[0]}")"
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3未安装"
        return 1
    fi
    
    # 启动Python服务器
    echo "🚀 启动Python备用服务器..."
    python3 start-backup.py 2>&1 &
    PYTHON_PID=$!
    
    sleep 2
    if check_website; then
        echo "🎉 Python备用服务器启动成功!"
        echo "PID: $PYTHON_PID"
        echo "⚠️  注意: 这是备用服务器，功能有限"
        return 0
    else
        echo "❌ Python备用服务器启动失败"
        kill $PYTHON_PID 2>/dev/null
        return 1
    fi
}

# 方法4: 使用简单HTTP服务器
try_simple_http() {
    echo "🔄 尝试方法4: 简单HTTP服务器..."
    cleanup
    
    cd "$(dirname "${BASH_SOURCE[0]}")"
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3未安装"
        return 1
    fi
    
    # 创建简单的index.html
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>灵光 · AI写作智能体</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 10px;
            margin: 2rem 0;
        }
        .btn {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 1rem 2rem;
            border-radius: 5px;
            text-decoration: none;
            margin: 0.5rem;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✨ 灵光AI写作智能体</h1>
        <p>你的专属灵感激发师</p>
        
        <div class="status">
            <h2>简单HTTP服务器运行中</h2>
            <p>Next.js服务器暂时不可用，这是最基础的HTTP服务器。</p>
            <p>请检查Next.js配置或联系管理员。</p>
        </div>
        
        <div>
            <a href="http://localhost:3000" class="btn">刷新页面</a>
        </div>
    </div>
</body>
</html>
EOF
    
    # 启动简单HTTP服务器
    echo "🚀 启动简单HTTP服务器..."
    python3 -m http.server 3000 2>&1 &
    HTTP_PID=$!
    
    sleep 2
    if check_website; then
        echo "🎉 简单HTTP服务器启动成功!"
        echo "PID: $HTTP_PID"
        echo "⚠️  注意: 只有静态页面，无API功能"
        return 0
    else
        echo "❌ 简单HTTP服务器启动失败"
        kill $HTTP_PID 2>/dev/null
        return 1
    fi
}

# 主函数
main() {
    echo "🔧 检测系统环境..."
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "✅ Node.js: $NODE_VERSION"
    else
        echo "❌ Node.js未安装"
    fi
    
    # 检查npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "✅ npm: $NPM_VERSION"
    else
        echo "❌ npm未安装"
    fi
    
    # 检查Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        echo "✅ Python: $PYTHON_VERSION"
    else
        echo "❌ Python3未安装"
    fi
    
    echo ""
    echo "🔄 开始尝试启动..."
    echo ""
    
    # 首先检查是否已经在运行
    if check_website; then
        echo "✅ 网站已经在运行!"
        echo "🌐 访问: http://localhost:3000"
        exit 0
    fi
    
    # 尝试各种方法
    METHODS=(
        "try_nextjs_dev"
        "try_nextjs_prod" 
        "try_python_backup"
        "try_simple_http"
    )
    
    for method in "${METHODS[@]}"; do
        if $method; then
            echo ""
            echo "======================================"
            echo "✅ 启动成功!"
            echo "🌐 请访问: http://localhost:3000"
            echo ""
            echo "📋 当前方法: $method"
            echo "💡 提示: 按 Ctrl+C 停止服务器"
            echo "======================================"
            exit 0
        fi
        echo ""
    done
    
    # 所有方法都失败
    echo ""
    echo "======================================"
    echo "❌ 所有启动方法都失败了!"
    echo ""
    echo "🔧 建议的解决方案:"
    echo "1. 检查端口3000是否被其他程序占用"
    echo "2. 运行: lsof -i :3000"
    echo "3. 运行: kill -9 [PID] (杀死占用进程)"
    echo "4. 重启电脑后重试"
    echo "5. 联系系统管理员"
    echo ""
    echo "📁 项目目录: $(pwd)"
    echo "======================================"
    exit 1
}

# 运行主函数
main