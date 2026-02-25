-- 数据持久化功能 - Supabase数据库表创建脚本
-- 运行此脚本在Supabase SQL编辑器中创建所需表

-- 1. 用户设置表 - 存储用户的写作偏好设置
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 写作偏好设置
  writing_style TEXT DEFAULT 'balanced',
  emotion_intensity INTEGER DEFAULT 50,
  creativity_level INTEGER DEFAULT 70,
  default_length TEXT DEFAULT 'medium',
  
  -- 界面偏好
  theme TEXT DEFAULT 'light',
  font_size TEXT DEFAULT 'medium',
  auto_save BOOLEAN DEFAULT true,
  auto_save_interval INTEGER DEFAULT 30, -- 秒
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：每个用户只能有一条设置记录
  UNIQUE(user_id)
);

-- 为user_settings表创建索引
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 2. 写作历史表 - 存储用户的AI写作历史记录
CREATE TABLE IF NOT EXISTS writing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 写作请求信息
  topic TEXT NOT NULL,
  style TEXT,
  emotion_intensity INTEGER,
  creativity_level INTEGER,
  length TEXT,
  additional_instructions TEXT,
  mode TEXT, -- 'writing' 或 'inspiration'
  
  -- 生成结果
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model_used TEXT,
  estimated_cost DECIMAL(10, 6),
  
  -- 元数据
  word_count INTEGER,
  character_count INTEGER,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 为writing_history表创建索引
CREATE INDEX IF NOT EXISTS idx_writing_history_user_id ON writing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_history_created_at ON writing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_writing_history_topic ON writing_history(topic);

-- 3. 草稿表 - 存储用户的写作草稿
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 草稿基本信息
  title TEXT,
  content TEXT,
  
  -- 写作参数（用于恢复时预填充表单）
  topic TEXT,
  style TEXT DEFAULT 'balanced',
  emotion_intensity INTEGER DEFAULT 50,
  creativity_level INTEGER DEFAULT 70,
  length TEXT DEFAULT 'medium',
  additional_instructions TEXT,
  mode TEXT DEFAULT 'writing',
  
  -- 草稿状态
  is_auto_save BOOLEAN DEFAULT false, -- 是否为自动保存的草稿
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  
  -- 时间戳
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user_drafts FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 为drafts表创建索引
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_last_saved_at ON drafts(last_saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_is_auto_save ON drafts(is_auto_save);

-- 4. 灵感收藏表 - 存储用户收藏的创意灵感
CREATE TABLE IF NOT EXISTS inspiration_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 灵感信息
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT DEFAULT 'ai_generated', -- 'ai_generated', 'manual', 'imported'
  source_data JSONB, -- 原始数据，如AI请求参数等
  
  -- 标签和分类
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  
  -- 收藏信息
  is_favorite BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user_inspirations FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 为inspiration_collections表创建索引
CREATE INDEX IF NOT EXISTS idx_inspirations_user_id ON inspiration_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspirations_tags ON inspiration_collections USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_inspirations_created_at ON inspiration_collections(created_at DESC);

-- 5. 创建更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要updated_at的表创建触发器
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspirations_updated_at 
  BEFORE UPDATE ON inspiration_collections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建行级安全策略（RLS）
-- 启用RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_collections ENABLE ROW LEVEL SECURITY;

-- 用户设置表策略：用户只能访问自己的设置
CREATE POLICY "用户只能访问自己的设置" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- 写作历史表策略：用户只能访问自己的历史
CREATE POLICY "用户只能访问自己的写作历史" ON writing_history
  FOR ALL USING (auth.uid() = user_id);

-- 草稿表策略：用户只能访问自己的草稿
CREATE POLICY "用户只能访问自己的草稿" ON drafts
  FOR ALL USING (auth.uid() = user_id);

-- 灵感收藏表策略：用户只能访问自己的收藏
CREATE POLICY "用户只能访问自己的灵感收藏" ON inspiration_collections
  FOR ALL USING (auth.uid() = user_id);

-- 7. 创建一些有用的视图
-- 用户写作统计视图
CREATE OR REPLACE VIEW user_writing_stats AS
SELECT 
  user_id,
  COUNT(*) as total_writings,
  SUM(tokens_used) as total_tokens_used,
  SUM(estimated_cost) as total_cost,
  AVG(word_count) as avg_word_count,
  MIN(created_at) as first_writing_date,
  MAX(created_at) as last_writing_date
FROM writing_history
GROUP BY user_id;

-- 用户活跃度视图
CREATE OR REPLACE VIEW user_activity AS
SELECT 
  user_id,
  DATE(created_at) as activity_date,
  COUNT(*) as daily_writings,
  SUM(tokens_used) as daily_tokens
FROM writing_history
GROUP BY user_id, DATE(created_at);

-- 8. 插入默认设置函数
CREATE OR REPLACE FUNCTION create_default_user_settings(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_settings (user_id) 
  VALUES (user_uuid)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ language 'plpgsql';

-- 9. 创建用户注册后自动创建设置的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_user_settings(NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 10. 数据清理函数（可选，用于清理旧数据）
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 清理超过指定天数的自动保存草稿
  WITH deleted AS (
    DELETE FROM drafts 
    WHERE is_auto_save = true 
      AND last_saved_at < NOW() - (days_to_keep || ' days')::INTERVAL
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ language 'plpgsql';

-- 输出创建完成信息
SELECT '✅ 数据库表创建完成！' as message;