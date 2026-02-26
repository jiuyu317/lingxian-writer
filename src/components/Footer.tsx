import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* 品牌信息 */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">灵</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">灵现写作</span>
            </div>
            <p className="text-sm text-gray-600 text-center md:text-left max-w-md">
              基于 AI 的智能写作辅助平台，激发你的创作灵感，提升写作效率。
            </p>
          </div>

          {/* 链接区域 */}
          <div className="flex flex-col sm:flex-row gap-8">
            {/* 产品链接 */}
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">产品</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/dashboard" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    仪表板
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/write" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    开始写作
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/upgrade" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    升级计划
                  </Link>
                </li>
              </ul>
            </div>

            {/* 支持链接 */}
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">支持</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/disclaimer" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    免责声明
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@lingxian.ai" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    联系支持
                  </a>
                </li>
                <li>
                  <Link 
                    href="/settings" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    账户设置
                  </Link>
                </li>
              </ul>
            </div>

            {/* 法律链接 */}
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">法律</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/disclaimer" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    用户协议
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/disclaimer" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/disclaimer" 
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Cookie 政策
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-600">
              © {currentYear} 灵现写作平台. 保留所有权利.
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Twitter
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center md:text-left">
            本平台使用 AI 技术辅助创作，生成内容需用户自行核实。使用即表示同意我们的
            <Link href="/disclaimer" className="text-blue-600 hover:underline ml-1">
              用户协议与免责声明
            </Link>
            。
          </div>
        </div>
      </div>
    </footer>
  );
}