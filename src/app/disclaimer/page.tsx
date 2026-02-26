export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* 主标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            【灵现】用户协议与免责声明
          </h1>
          <p className="text-lg text-gray-600">
            最后更新日期：2026年2月26日
          </p>
        </div>

        {/* 欢迎段落 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-gray-700 leading-relaxed space-y-4">
            欢迎使用灵现 AI 写作辅助平台（以下简称"本平台"）。在使用本平台提供的各项服务之前，请您务必仔细阅读并透彻理解本声明。您一旦使用本平台的服务，即视为您已完全同意本声明的所有条款。
          </p>
        </div>

        {/* 一、AI 生成内容的属性与局限性 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            一、 AI 生成内容的属性与局限性
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">非人工产物</h3>
              <p className="text-gray-700 leading-relaxed">
                本平台提供的文本生成服务依托于人工智能大语言模型。平台输出的所有内容均为算法自动生成，不代表本平台的立场、观点或价值观。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">准确性与真实性不予保证</h3>
              <p className="text-gray-700 leading-relaxed">
                受限于当前 AI 技术的局限性，本平台不保证生成内容的准确性、完整性、时效性或客观性（即可能出现"AI 幻觉"）。用户在将生成内容用于学术、商业、出版等严肃场景前，必须进行独立的人工核实与事实查证。因依赖生成内容导致的任何决策失误或损失，本平台概不负责。
              </p>
            </div>
          </div>
        </div>

        {/* 二、知识产权与侵权免责 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            二、 知识产权与侵权免责
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">版权归属</h3>
              <p className="text-gray-700 leading-relaxed">
                在符合相关法律法规的前提下，用户通过本平台生成的文字内容，其使用权及相关权益归用户所有。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">侵权风险提示</h3>
              <p className="text-gray-700 leading-relaxed">
                AI 模型基于海量公共数据训练，平台无法完全排除生成内容与现有受版权保护作品雷同的可能性。用户在公开发布、商业化使用生成内容时，需自行承担潜在的版权争议风险。若因用户使用本平台生成内容侵犯第三方合法权益（包括但不限于著作权、名誉权、肖像权等），由用户自行承担全部法律责任，本平台不承担任何连带责任。
              </p>
            </div>
          </div>
        </div>

        {/* 三、用户行为规范 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            三、 用户行为规范
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">禁止违规用途</h3>
              <p className="text-gray-700 leading-relaxed">
                用户不得利用本平台生成、传播违反国家法律法规、危害国家安全、宣扬仇恨与歧视、散布谣言、淫秽色情或侵犯他人隐私的内容。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">违规处理</h3>
              <p className="text-gray-700 leading-relaxed">
                一旦发现用户存在上述违规行为，本平台有权立即限制或永久封禁该用户的账号（及相关付费订阅权益），并保留向相关监管机关报告的权利。
              </p>
            </div>
          </div>
        </div>

        {/* 四、服务稳定性与数据存储 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            四、 服务稳定性与数据存储
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">服务中断</h3>
              <p className="text-gray-700 leading-relaxed">
                本平台将尽最大努力保障服务的稳定运行，但因不可抗力、基础云服务商故障、网络拥堵、系统维护或第三方 API 接口限流等原因导致的服务中断、数据加载失败，本平台不承担违约或赔偿责任。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">数据备份</h3>
              <p className="text-gray-700 leading-relaxed">
                强烈建议用户妥善保存和备份自己的重要创作数据。对于因意外原因造成的草稿或内容丢失，本平台不承担赔偿责任。
              </p>
            </div>
          </div>
        </div>

        {/* 五、商业变现与退款政策 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            五、 商业变现与退款政策
          </h2>
          
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              本平台的部分高级功能可能需要付费或消耗配额（如订阅会员、API 额度）。虚拟商品与算力服务一经消耗，不支持无理由退款。如遇系统扣费异常，用户可通过官方渠道联系客服处理。
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            如有任何疑问，请通过官方渠道联系我们。
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © 2026 灵现 AI 写作辅助平台 版权所有
          </p>
        </div>
      </div>
    </div>
  );
}