/**
 * 简化版数据库功能测试
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://czggviorchhfzvseqilq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eJd-THvuxBXGZB4BC1dJGQ_lZWNz4Lj';
const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER_ID = '11111111-2222-3333-4444-555555555555';

async function runTests() {
  console.log('🧪 数据持久化功能测试\n');
  
  let passed = 0;
  let failed = 0;
  
  // 测试1: 用户设置
  console.log('1. 测试用户设置功能...');
  try {
    // 清理旧数据
    await supabase.from('user_settings').delete().eq('user_id', TEST_USER_ID);
    
    // 创建设置
    const { data: settings, error: createError } = await supabase
      .from('user_settings')
      .insert({
        user_id: TEST_USER_ID,
        writing_style: 'creative',
        emotion_intensity: 80,
        creativity_level: 90,
        default_length: 'medium',
        auto_save: true,
        auto_save_interval: 30
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    console.log('   ✅ 创建用户设置成功');
    console.log(`      写作风格: ${settings.writing_style}`);
    console.log(`      情绪强度: ${settings.emotion_intensity}`);
    passed++;
    
    // 读取设置
    const { data: readSettings, error: readError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .single();
    
    if (readError) throw readError;
    
    console.log('   ✅ 读取用户设置成功');
    console.log(`      自动保存: ${readSettings.auto_save ? '开启' : '关闭'}`);
    passed++;
    
  } catch (error) {
    console.log(`   ❌ 用户设置测试失败: ${error.message}`);
    failed++;
  }
  
  // 测试2: 写作历史
  console.log('\n2. 测试写作历史功能...');
  try {
    const { data: history, error } = await supabase
      .from('writing_history')
      .insert({
        user_id: TEST_USER_ID,
        topic: '测试写作主题',
        style: 'creative',
        emotion_intensity: 85,
        creativity_level: 95,
        length: 'medium',
        mode: 'writing',
        content: '这是一个测试写作内容，用于验证数据持久化功能。',
        word_count: 20,
        character_count: 40
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('   ✅ 创建写作历史成功');
    console.log(`      主题: ${history.topic}`);
    console.log(`      字数: ${history.word_count}`);
    passed++;
    
    // 查询历史列表
    const { data: histories, error: queryError } = await supabase
      .from('writing_history')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (queryError) throw queryError;
    
    console.log(`   ✅ 查询写作历史成功，找到 ${histories.length} 条记录`);
    passed++;
    
  } catch (error) {
    console.log(`   ❌ 写作历史测试失败: ${error.message}`);
    failed++;
  }
  
  // 测试3: 草稿功能
  console.log('\n3. 测试草稿功能...');
  try {
    // 手动草稿
    const { data: manualDraft, error: manualError } = await supabase
      .from('drafts')
      .insert({
        user_id: TEST_USER_ID,
        title: '测试手动草稿',
        content: '这是手动保存的草稿内容。',
        topic: '测试主题',
        style: 'balanced',
        is_auto_save: false,
        word_count: 15,
        character_count: 30
      })
      .select()
      .single();
    
    if (manualError) throw manualError;
    
    console.log('   ✅ 创建手动草稿成功');
    console.log(`      标题: ${manualDraft.title}`);
    passed++;
    
    // 自动草稿
    const { data: autoDraft, error: autoError } = await supabase
      .from('drafts')
      .insert({
        user_id: TEST_USER_ID,
        title: '自动保存草稿',
        content: '这是系统自动保存的草稿内容。',
        is_auto_save: true,
        word_count: 10,
        character_count: 20
      })
      .select()
      .single();
    
    if (autoError) throw autoError;
    
    console.log('   ✅ 创建自动草稿成功');
    console.log(`      自动保存: ${autoDraft.is_auto_save}`);
    passed++;
    
    // 查询所有草稿
    const { data: allDrafts, error: draftsError } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (draftsError) throw draftsError;
    
    const manualCount = allDrafts.filter(d => !d.is_auto_save).length;
    const autoCount = allDrafts.filter(d => d.is_auto_save).length;
    
    console.log(`   ✅ 查询草稿成功，共 ${allDrafts.length} 条（手动: ${manualCount}, 自动: ${autoCount}）`);
    passed++;
    
  } catch (error) {
    console.log(`   ❌ 草稿测试失败: ${error.message}`);
    failed++;
  }
  
  // 测试4: 灵感收藏
  console.log('\n4. 测试灵感收藏功能...');
  try {
    const { data: inspiration, error } = await supabase
      .from('inspiration_collections')
      .insert({
        user_id: TEST_USER_ID,
        title: '测试灵感收藏',
        content: '这是一个测试灵感内容，创意无限。',
        source_type: 'ai_generated',
        tags: ['测试', '创意', '灵感'],
        category: '测试分类',
        is_favorite: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('   ✅ 创建灵感收藏成功');
    console.log(`      标题: ${inspiration.title}`);
    console.log(`      标签: ${inspiration.tags.join(', ')}`);
    console.log(`      是否收藏: ${inspiration.is_favorite ? '是' : '否'}`);
    passed++;
    
    // 查询灵感
    const { data: inspirations, error: queryError } = await supabase
      .from('inspiration_collections')
      .select('*')
      .eq('user_id', TEST_USER_ID);
    
    if (queryError) throw queryError;
    
    console.log(`   ✅ 查询灵感成功，找到 ${inspirations.length} 条记录`);
    passed++;
    
  } catch (error) {
    console.log(`   ❌ 灵感收藏测试失败: ${error.message}`);
    failed++;
  }
  
  // 测试5: 数据关系验证
  console.log('\n5. 测试数据关系验证...');
  try {
    // 验证所有表的数据完整性
    const tables = ['user_settings', 'writing_history', 'drafts', 'inspiration_collections'];
    let totalRecords = 0;
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .eq('user_id', TEST_USER_ID);
      
      if (error) throw error;
      
      const count = data[0]?.count || 0;
      totalRecords += count;
      console.log(`      ${table}: ${count} 条记录`);
    }
    
    console.log(`   ✅ 数据关系验证成功，总记录数: ${totalRecords}`);
    passed++;
    
  } catch (error) {
    console.log(`   ❌ 数据关系验证失败: ${error.message}`);
    failed++;
  }
  
  // 总结
  console.log('\n📊 测试结果总结:');
  console.log(`   总测试数: ${passed + failed}`);
  console.log(`   通过: ${passed}`);
  console.log(`   失败: ${failed}`);
  console.log(`   通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 所有测试通过！数据持久化功能正常工作。');
  } else {
    console.log('\n⚠️  部分测试失败，需要检查数据库配置或代码实现。');
  }
  
  // 清理测试数据
  console.log('\n🧹 清理测试数据...');
  try {
    await supabase.from('inspiration_collections').delete().eq('user_id', TEST_USER_ID);
    await supabase.from('drafts').delete().eq('user_id', TEST_USER_ID);
    await supabase.from('writing_history').delete().eq('user_id', TEST_USER_ID);
    await supabase.from('user_settings').delete().eq('user_id', TEST_USER_ID);
    console.log('   测试数据清理完成');
  } catch (error) {
    console.log(`   清理数据时出错: ${error.message}`);
  }
}

runTests().catch(console.error);