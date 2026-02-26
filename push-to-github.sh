#!/bin/bash

echo "🚀 开始推送代码到GitHub..."
echo "仓库: https://github.com/jiuyu317/lingxian-writer.git"
echo "分支: main"
echo ""

# 检查remote配置
echo "📋 检查Git配置..."
git remote -v
echo ""

# 尝试推送
echo "📤 尝试推送代码..."
git push -u origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo "📊 您可以在GitHub查看：https://github.com/jiuyu317/lingxian-writer"
else
    echo ""
    echo "❌ 推送失败，可能的原因："
    echo "1. GitHub认证问题"
    echo "2. 网络连接问题"
    echo "3. 仓库权限问题"
    echo ""
    echo "💡 解决方案："
    echo "1. 确保您已登录GitHub"
    echo "2. 使用Personal Access Token代替密码"
    echo "3. 检查仓库是否存在且有写入权限"
    echo ""
    echo "🔧 手动推送命令："
    echo "git push -u origin main"
fi