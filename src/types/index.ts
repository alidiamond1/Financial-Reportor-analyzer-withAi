// Core entity types based on the design document

export interface User {
  id: string; // Supabase auth ID
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  uploadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'excel' | 'csv';
  fileSize: number;
  uploadDate: Date;
  analysisStatus: 'pending' | 'completed' | 'failed';
  supabaseStoragePath?: string;
}

export interface KPIs {
  revenue: string;
  expenses: string;
  netProfit: string;
  growthRate: string;
  totalAssets?: string;
  totalLiabilities?: string;
  cashFlow?: string;
  debtToEquityRatio?: string;
  returnOnInvestment?: string;
  profitMargin?: string;
}

export interface Analysis {
  id: string;
  fileId: string;
  summary: string;
  kpis: KPIs;
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  id: string;
  analysisId: string;
  chartData: ChartData[];
  insights: Insight[];
  createdAt: Date;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxisKey?: string;
  yAxisKey?: string;
  dataKey?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  importance: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  userId: string;
  analysisId?: string;
  message: string;
  response: string;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

// File upload types
export interface FileUploadRequest {
  file: File;
  userId: string;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  uploadUrl?: string;
  message: string;
}

// Analysis request types
export interface AnalysisRequest {
  fileId: string;
  analysisType?: 'full' | 'quick' | 'custom';
  customPrompt?: string;
}

export interface AnalysisResponse {
  analysisId: string;
  status: 'pending' | 'completed' | 'failed';
  estimatedTime?: number;
  message: string;
}

// Dashboard export types
export interface ExportRequest {
  analysisId: string;
  format: 'pdf' | 'word' | 'notion';
  sections?: string[];
}

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: Date;
  format: string;
  message: string;
}

// Subscription and tier types
export interface SubscriptionTier {
  name: 'free' | 'pro' | 'enterprise';
  uploadLimit: number; // -1 for unlimited
  features: string[];
  price: number;
  currency: string;
}

export interface UsageStats {
  uploadsThisMonth: number;
  analysesGenerated: number;
  storageUsed: number; // in bytes
  apiCallsUsed: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  fileType?: 'pdf' | 'excel' | 'csv';
  dateRange?: {
    from: Date;
    to: Date;
  };
  analysisStatus?: 'pending' | 'completed' | 'failed';
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  totalAnalyses: number;
  revenueThisMonth: number;
  activeUsers: number;
  storageUsed: number;
}

export interface UserManagement {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    role?: 'user' | 'admin';
    subscriptionTier?: 'free' | 'pro' | 'enterprise';
    lastLoginAfter?: Date;
  };
}

// Real-time types
export interface RealtimeEvent {
  type: 'analysis_completed' | 'file_uploaded' | 'export_ready';
  payload: any;
  userId: string;
  timestamp: Date;
}

// Configuration types
export interface AppConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  rateLimits: {
    uploads: number;
    analyses: number;
    exports: number;
  };
  features: {
    chatEnabled: boolean;
    exportEnabled: boolean;
    adminDashboard: boolean;
  };
}