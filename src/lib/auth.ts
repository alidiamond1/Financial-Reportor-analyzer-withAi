import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types';

/**
 * Extract and validate JWT token from request headers
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
}

/**
 * Verify JWT token and get user information
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return null;
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Middleware function to authenticate requests
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
}> {
  const token = extractToken(request);
  
  if (!token) {
    return {
      success: false,
      error: 'No authorization token provided'
    };
  }

  const user = await verifyToken(token);
  
  if (!user) {
    return {
      success: false,
      error: 'Invalid or expired token'
    };
  }

  return {
    success: true,
    user
  };
}

/**
 * Check if user has admin role
 */
export function requireAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * Check if user has required subscription tier
 */
export async function checkSubscriptionTier(
  userId: string, 
  requiredTier: 'free' | 'pro' | 'enterprise'
): Promise<boolean> {
  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      return false;
    }

    const tierLevels = { free: 0, pro: 1, enterprise: 2 };
    const userLevel = tierLevels[userProfile.subscription_tier as keyof typeof tierLevels];
    const requiredLevel = tierLevels[requiredTier];

    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Subscription tier check error:', error);
    return false;
  }
}

/**
 * Check upload limits for user
 */
export async function checkUploadLimit(userId: string): Promise<{
  canUpload: boolean;
  currentCount: number;
  limit: number;
}> {
  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('subscription_tier, upload_count')
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      return { canUpload: false, currentCount: 0, limit: 0 };
    }

    const limits = {
      free: 3,
      pro: -1, // unlimited
      enterprise: -1 // unlimited
    };

    const limit = limits[userProfile.subscription_tier as keyof typeof limits];
    const canUpload = limit === -1 || userProfile.upload_count < limit;

    return {
      canUpload,
      currentCount: userProfile.upload_count,
      limit: limit === -1 ? Infinity : limit
    };
  } catch (error) {
    console.error('Upload limit check error:', error);
    return { canUpload: false, currentCount: 0, limit: 0 };
  }
}

/**
 * Rate limiting utilities
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetTime: record.resetTime 
  };
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Clean up expired records every hour
setInterval(cleanupRateLimitRecords, 60 * 60 * 1000);