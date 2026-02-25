/**
 * 数据库类型定义
 */

// 用户设置类型
export interface UserSettings {
  id?: string;
  userId: string;
  
  // 写作偏好设置
  writingStyle: string;
  emotionIntensity: number;
  creativityLevel: number;
  defaultLength: string;
  
  // 界面偏好
  theme: string;
  fontSize: string;
  autoSave: boolean;
  autoSaveInterval: number; // 秒
  
  // 时间戳
  createdAt?: Date;
  updatedAt?: Date;
}

// 写作历史类型
export interface WritingHistory {
  id?: string;
  userId: string;
  
  // 写作请求信息
  topic: string;
  style?: string;
  emotionIntensity?: number;
  creativityLevel?: number;
  length?: string;
  additionalInstructions?: string;
  mode?: 'writing' | 'inspiration';
  
  // 生成结果
  content: string;
  tokensUsed?: number;
  modelUsed?: string;
  estimatedCost?: number;
  
  // 元数据
  wordCount?: number;
  characterCount?: number;
  
  // 时间戳
  createdAt?: Date;
}

// 草稿类型
export interface Draft {
  id?: string;
  userId: string;
  
  // 草稿基本信息
  title?: string;
  content: string;
  
  // 写作参数（用于恢复时预填充表单）
  topic?: string;
  style?: string;
  emotionIntensity?: number;
  creativityLevel?: number;
  length?: string;
  additionalInstructions?: string;
  mode?: 'writing' | 'inspiration';
  
  // 草稿状态
  isAutoSave: boolean;
  wordCount: number;
  characterCount: number;
  
  // 时间戳
  lastSavedAt?: Date;
  createdAt?: Date;
}

// 灵感收藏类型
export interface InspirationCollection {
  id?: string;
  userId: string;
  
  // 灵感信息
  title: string;
  content: string;
  sourceType: 'ai_generated' | 'manual' | 'imported';
  sourceData?: Record<string, any>;
  
  // 标签和分类
  tags: string[];
  category?: string;
  
  // 收藏信息
  isFavorite: boolean;
  rating?: number;
  
  // 时间戳
  createdAt?: Date;
  updatedAt?: Date;
}

// 用户写作统计
export interface UserWritingStats {
  userId: string;
  totalWritings: number;
  totalTokensUsed: number;
  totalCost: number;
  avgWordCount: number;
  firstWritingDate: Date;
  lastWritingDate: Date;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 写作历史查询参数
export interface WritingHistoryQuery extends PaginationParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  topic?: string;
  mode?: 'writing' | 'inspiration';
}

// 草稿查询参数
export interface DraftsQuery extends PaginationParams {
  userId: string;
  isAutoSave?: boolean;
  search?: string;
}

// 灵感收藏查询参数
export interface InspirationsQuery extends PaginationParams {
  userId: string;
  tags?: string[];
  category?: string;
  isFavorite?: boolean;
  search?: string;
}

// 数据库操作结果
export interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// 分页结果
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}