/**
 * 数据持久化功能集成测试
 * 测试所有数据库操作功能的完整性和可靠性
 */

const { createClient } = require('@supabase/supabase-js');

// 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://czggviorchhfzvseqilq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eJd-THvuxBXGZB4BC1dJGQ_lZWNz4Lj';
const supabase = createClient(supabaseUrl, supabaseKey);

// 测试用户ID（使用有效的UUID格式）
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

class DataPersistenceTest {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async runAllTests() {
    console.log('🚀 开始数据持久化功能集成测试\n');
    
    try {
      // 清理之前的测试数据
      await this.cleanupTestData();
      
      // 运行测试套件
      await this.testUserSettings();
      await this.testWritingHistory();
      await this.testDrafts();
      await this.testInspirationCollections();
      await this.testDataRelationships();
      
      // 输出测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message);
      console.error(error.stack);
    }
  }

  async cleanupTestData() {
    console.log('🧹 清理测试数据...');
    
    const tables = [
      'inspiration_collections',
      'drafts', 
      'writing_history',
      'user_settings'
    ];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', TEST_USER_ID);
        
        if (error && !error.message.includes('violates row-level security policy')) {
          console.log(`  清理 ${table}: ❌ ${error.message}`);
        } else {
          console.log(`  清理 ${table}: ✅ 完成`);
        }
      } catch (err) {
        console.log(`  清理 ${table}: ⚠️ ${err.message}`);
      }
    }
    console.log('');
  }

  async testUserSettings() {
    console.log('📋 测试1: 用户设置功能');
    
    // 测试1.1: 获取不存在的用户设置
    await this.runTest('获取不存在的用户设置', async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();
      
      if (error && error.code === 'PGRST116') {
        return { success: true, message: '用户设置不存在（预期）' };
      }
      return { success: false, message: `预期错误PGRST116，但得到: ${error?.code || '无错误'}` };
    });
    
    // 测试1.2: 创建默认用户设置
    await this.runTest('创建默认用户设置', async () => {
      const defaultSettings = {
        user_id: TEST_USER_ID,
        writing_style: 'balanced',
        emotion_intensity: 50,
        creativity_level: 70,
        default_length: 'medium',
        theme: 'light',
        font_size: 'medium',
        auto_save: true,
        auto_save_interval: 30
      };
      
      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();
      
      if (error) {
        return { success: false, message: `创建失败: ${error.message}` };
      }
      
      this.userSettingsId = data.id;
      return { 
        success: true, 
        message: `创建成功，ID: ${data.id}`,
        data 
      };
    });
    
    // 测试1.3: 获取已存在的用户设置
    await this.runTest('获取已存在的用户设置', async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();
      
      if (error) {
        return { success: false, message: `获取失败: ${error.message}` };
      }
      
      // 验证数据完整性
      const requiredFields = ['writing_style', 'emotion_intensity', 'creativity_level', 'default_length'];
      const missingFields = requiredFields.filter(field => data[field] === undefined);
      
      if (missingFields.length > 0) {
        return { success: false, message: `缺少字段: ${missingFields.join(', ')}` };
      }
      
      return { 
        success: true, 
        message: `获取成功，写作风格: ${data.writing_style}`,
        data 
      };
    });
    
    // 测试1.4: 更新用户设置
    await this.runTest('更新用户设置', async () => {
      const updatedSettings = {
        writing_style: 'creative',
        emotion_intensity: 80,
        creativity_level: 90,
        default_length: 'long',
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_settings')
        .update(updatedSettings)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();
      
      if (error) {
        return { success: false, message: `更新失败: ${error.message}` };
      }
      
      // 验证更新是否生效
      if (data.writing_style !== 'creative' || data.emotion_intensity !== 80) {
        return { success: false, message: '更新未生效' };
      }
      
      return { 
        success: true, 
        message: `更新成功，新风格: ${data.writing_style}`,
        data 
      };
    });
    
    console.log('');
  }

  async testWritingHistory() {
    console.log('📝 测试2: 写作历史功能');
    
    // 测试2.1: 创建写作历史记录
    await this.runTest('创建写作历史记录', async () => {
      const writingHistory = {
        user_id: TEST_USER_ID,
        topic: '测试写作主题 - 未来城市',
        style: 'creative',
        emotion_intensity: 85,
        creativity_level: 95,
        length: 'medium',
        additional_instructions: '请描述一个充满科技感的未来城市景象',
        mode: 'writing',
        content: '在未来的新京都市，悬浮汽车在透明的管道中穿梭，全息广告牌投射出动态的霓虹光影。人工智能管家为每个居民提供个性化服务，而生物识别技术确保了绝对的安全。城市中心是一座巨大的生态穹顶，里面生长着来自世界各地的奇花异草，为这座钢铁森林带来一丝自然的气息。',
        tokens_used: 250,
        model_used: 'deepseek-chat',
        estimated_cost: 0.00025,
        word_count: 120,
        character_count: 240
      };
      
      const { data, error } = await supabase
        .from('writing_history')
        .insert(writingHistory)
        .select()
        .single();
      
      if (error) {
        return { success: false, message: `创建失败: ${error.message}` };
      }
      
      this.writingHistoryId = data.id;
      return { 
        success: true, 
        message: `创建成功，ID: ${data.id}，主题: ${data.topic}`,
        data 
      };
    });
    
    // 测试2.2: 批量创建写作历史
    await this.runTest('批量创建写作历史', async () => {
      const histories = [
        {
          user_id: TEST_USER_ID,
          topic: '武侠江湖故事',
          style: 'adventure',
          emotion_intensity: 90,
          creativity_level: 85,
          length: 'short',
          mode: 'writing',
          content: '剑光如虹，少年侠客立于华山之巅，面对群雄挑战而面不改色。',
          word_count: 25,
          character_count: 50
        },
        {
          user_id: TEST_USER_ID,
          topic: '浪漫爱情诗歌',
          style: 'poetic',
          emotion_intensity: 95,
          creativity_level: 80,
          length: 'short',
          mode: 'writing',
          content: '月光如水洒窗前，思念如丝绕心田。相逢何必曾相识，一见钟情定终身。',
          word_count: 30,
          character_count: 60
        },
        {
          user_id: TEST_USER_ID,
          topic: '悬疑推理开场',
          style: 'mystery',
          emotion_intensity: 70,
          creativity_level: 75,
          length: 'short',
          mode: 'writing',
          content: '雨夜的古宅中，一具尸体被发现，所有的门窗都从内部锁死。唯一的线索是一张泛黄的照片，上面的人影模糊不清。',
          word_count: 45,
          character_count: 90
        }
      ];
      
      const { data, error } = await supabase
        .from('writing_history')
        .insert(histories)
        .select();
      
      if (error) {
        return { success: false, message: `批量创建失败: ${error.message}` };
      }
      
      return { 
        success: true, 
        message: `批量创建成功，共 ${data.length} 条记录`,
        data: data.length 
      };
    });
    
    // 测试2.3: 查询写作历史
    await this.runTest('查询写作历史列表', async () => {
      const { data, error, count } = await supabase
        .from('writing_history')
        .select('*', { count: 'exact' })
        .eq('user_id', TEST_USER_ID)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        return { success: false, message: `查询失败: ${error.message}` };
      }
      
      if (!data || data.length === 0) {
        return { success: false, message: '未找到写作历史记录' };
      }
      
      return { 
        success: true, 
        message: `查询成功，找到 ${count} 条记录，显示 ${data.length} 条`,
        data: { count, sample: data[0]?.topic }
      };
    });
    
    // 测试2.4: 按条件筛选写作历史
    await this.runTest('按主题筛选写作历史', async () => {
      const { data, error } = await supabase
        .from('writing_history')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .ilike('topic', '%武侠%')
        .limit(2);
      
      if (error) {
        return { success: false, message: `筛选失败: ${error.message}` };
      }
      
      const has武侠 = data.some(item => item.topic.includes('武侠'));
      if (!has武侠) {
        return { success: false, message: '筛选结果不符合预期' };
      }
      
      return { 
        success: true, 
        message: `筛选成功，找到 ${data.length} 条相关记录`,
        data: data.length 
      };
    });
    
    console.log('');
  }

  async testDrafts() {
    console.log('📄 测试3: 草稿功能');
    
    // 测试3.1: 创建手动保存草稿
    await this.runTest('创建手动保存草稿', async () => {
      const draft = {
        user_id: TEST_USER_ID,
        title: '小说第一章草稿',
        content: '这是一个长篇小说的第一章草稿内容，讲述了主角的童年经历和家庭背景。',
        topic: '家族史诗',
        style: 'balanced',
        emotion_intensity: 60,
        creativity_level: 70,
        length: 'long',
        additional_instructions: '需要突出家族矛盾和时代背景',
        mode: 'writing',
        is_auto_save: false,
        word_count: 150,
        character_count: 300
      };
      
      const { data, error } = await supabase
        .from('drafts')
        .insert(draft)
        .select()
        .single();
      
      if (error) {
        return { success: false, message: `创建失败: ${error.message}` };
      }
      
      this.manualDraftId = data.id;
      return { 
        success: true, 
        message: `手动草稿创建成功，ID: ${data.id}`,
        data 
      };
    });
    
    // 测试3.2: 创建自动保存草稿
    await this.runTest('创建自动保存草稿', async () => {
      const autoDraft = {
        user_id: TEST_USER_ID,
        title: '自动保存的灵感笔记',
        content: '这是系统自动保存的写作灵感，记录了突然想到的创意点子。',
        topic: '创意灵感',
        style: 'creative',
        emotion_intensity: 85,
        creativity_level: 95,
        length: 'short',
        mode: 'inspiration',
        is_auto_save: true,
        word_count: 50,
        character_count: 100
      };
      
      const { data, error } = await supabase
        .from('drafts')
        .insert(autoDraft)
        .select()
        .single();
      
      if (error) {
        return { success: false, message: `创建失败: ${error.message}` };
      }
      
      this.autoDraftId = data.id;
      return { 
        success: true, 
        message: `自动草稿创建成功，ID: ${data.id}`,
        data 
      };
    });
    
    // 测试3.3: 更新草稿内容
    await this.runTest('更新草稿内容', async () => {
      const updatedContent = '这是更新后的草稿内容，添加了更多细节和情节发展。主角的童年经历更加丰富，家庭矛盾也更加突出。';
      
      const { data, error } = await supabase
        .from('drafts')
        .update({
          content: updatedContent,
          word_count: 200,
          character_count: 400,
          last_saved_at: new Date().toISOString()
        })
        .eq('id', this.manualDraftId)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();
      
      if (error) {
        return { success: false, message: `更新失败: ${error.message}` };
      }
      
      if (data.content !== updatedContent) {
        return { success: false, message: '内容更新未生效' };
      }
      
      return { 
        success: true, 
        message: `草稿更新成功，新字数: ${data.word_count}`,
        data 
      };
    });
    
    // 测试3.4: 查询草稿列表
    await this.runTest('查询草稿列表', async () => {
      const { data, error, count } = await supabase
        .from('drafts')
        .select('*', { count: 'exact' })
        .eq('user_id', TEST_USER_ID)
        .order('last_saved_at', { ascending: false });
      
      if (error) {
        return { success: false, message: `查询失败: ${error.message}` };
      }
      
      const manualDrafts = data.filter(d => !d.is_auto_save);
      const autoDrafts = data.filter(d => d.is_auto_save);
      
      return { 
        success: true, 
        message: `查询成功，共 ${count} 条草稿（手动: ${manualDrafts.length}, 自动: ${autoDrafts.length}）`,
        data: { total: count, manual: manualDrafts.length, auto: autoDrafts.length }
      };
    });
    
    // 测试3.5: 按类型筛选草稿
    await this.runTest('筛选自动保存草稿', async () => {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_auto_save', true);
      
      if (error) {
        return { success: false, message: `筛选失败: ${error.message}` };
      }
      
      const allAuto = data.every(d => d.is_auto_save === true);
      if (!allAuto) {
        return { success: false, message: '筛选结果包含非自动保存草稿' };
      }
      
      return { 
        success: true, 
        message: `筛选成功，找到 ${data.length} 条自动保存草稿`,
        data: data.length 
      };
    });
    
    console.log('');
  }

  async testInspirationCollections() {
    console.log('💡 测试4: 灵感收藏功能');
    
    // 测试4.1: 创建AI生成灵感收藏
    await this.runTest('创建AI生成灵感收藏', async () => {
      const inspiration = {
        user_id: TEST_USER_ID,
        title: '未来城市建筑创意',
        content: '未来的建筑将采用生物可降解材料，能够根据天气自动调节透光率，并且配备垂直花园系统，实现能源自给自足。',
        source_type: 'ai_generated',
        source_data: {
          topic: '未来建筑',
          style: 'creative',
          emotion_intensity: 80,
          creativity_level: 90,
          model: 'deepseek-chat',
          timestamp: new Date().toISOString()
        },
        tags: ['未来', '建筑', '环保', '科技'],
        category: '设计灵感',
        is_favorite: true,
        rating: 5
      };
      
      const { data, error } = await supabase
        .from('inspiration_collections