# Deployment Configuration

## Environment Variables Setup

### Production Environment Variables (.env.production)

```bash
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# Google Gemini AI Configuration
GEMINI_API_KEY=your_production_gemini_api_key

# NextAuth Configuration (if using)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv

# Rate Limiting Configuration
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Subscription Tier Limits
FREE_TIER_UPLOAD_LIMIT=3
PRO_TIER_UPLOAD_LIMIT=-1
ENTERPRISE_TIER_UPLOAD_LIMIT=-1
```

## Deployment Platforms

### 1. Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**:
   - Set all production environment variables in Vercel dashboard
   - Go to Project Settings > Environment Variables

4. **Custom Domain**:
   - Add custom domain in Vercel dashboard
   - Update NEXT_PUBLIC_APP_URL and NEXTAUTH_URL

### 2. Netlify Deployment

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Set in Netlify dashboard

### 3. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 4. AWS Deployment

1. **Using AWS Amplify**:
   - Connect GitHub repository
   - Set build settings and environment variables
   - Deploy automatically on push

2. **Using AWS ECS with Docker**:
   - Build and push Docker image to ECR
   - Create ECS service with environment variables

## Database Setup (Supabase)

### 1. Create Production Database

1. Create new Supabase project for production
2. Run the SQL schema from `src/lib/database-schema.sql`
3. Set up storage buckets:
   - `uploaded-files` bucket with private access
   - `exported-reports` bucket with private access

### 2. Database Migrations

```sql
-- Run this in Supabase SQL editor for production
-- This ensures all tables, policies, and functions are created

-- Copy and paste content from src/lib/database-schema.sql
```

### 3. Storage Configuration

```sql
-- Storage bucket policies (run in Supabase SQL editor)

-- Uploaded files bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('uploaded-files', 'uploaded-files', false);

-- Exported reports bucket  
INSERT INTO storage.buckets (id, name, public) VALUES ('exported-reports', 'exported-reports', false);
```

## Performance Optimization

### 1. Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Compress images
  compress: true,
  // Optimize bundle
  swcMinify: true,
}

module.exports = nextConfig
```

### 2. Performance Monitoring

Add monitoring and analytics:

```bash
# Install monitoring packages
npm install @vercel/analytics @sentry/nextjs
```

## Security Configuration

### 1. CORS Configuration

```typescript
// In API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 2. Rate Limiting

Implement rate limiting in production:

```typescript
// Enhanced rate limiting for production
const rateLimits = {
  api: 100, // requests per minute
  upload: 10, // uploads per minute
  chat: 20, // chat queries per minute
};
```

### 3. Input Validation

Ensure all API endpoints validate input:

```typescript
// Example validation middleware
const validateRequest = (schema: any) => {
  return (req: NextRequest) => {
    // Validate request body against schema
    // Return validation errors if any
  };
};
```

## Monitoring and Logging

### 1. Error Tracking

```typescript
// Add to layout.tsx or _app.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Analytics

```typescript
// Add analytics tracking
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed to production
- [ ] Storage buckets created and configured
- [ ] API endpoints tested in production
- [ ] File upload limits configured
- [ ] Rate limiting implemented
- [ ] Error monitoring set up
- [ ] SSL certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled

## Post-Deployment Steps

1. **Test all features**:
   - User registration and login
   - File upload and analysis
   - Dashboard functionality
   - Chat features
   - Export capabilities

2. **Monitor performance**:
   - Check response times
   - Monitor error rates
   - Track user engagement

3. **Set up alerts**:
   - Error rate alerts
   - Performance degradation alerts
   - Quota limit alerts

## Troubleshooting

### Common Issues

1. **Environment variables not loading**:
   - Verify variable names (NEXT_PUBLIC_ prefix for client-side)
   - Check deployment platform configuration

2. **Database connection issues**:
   - Verify Supabase URL and keys
   - Check database policies and RLS

3. **File upload failures**:
   - Check storage bucket permissions
   - Verify file size limits
   - Test storage bucket policies

4. **AI API errors**:
   - Verify Gemini API key
   - Check API quota limits
   - Test API connectivity

### Performance Issues

1. **Slow API responses**:
   - Check database query performance
   - Implement caching where appropriate
   - Optimize image sizes

2. **High memory usage**:
   - Optimize file processing
   - Implement streaming for large files
   - Add memory limits

## Scaling Considerations

1. **Database scaling**:
   - Monitor connection pool usage
   - Implement read replicas if needed
   - Optimize query performance

2. **Storage scaling**:
   - Monitor storage usage
   - Implement cleanup policies
   - Consider CDN for file delivery

3. **API scaling**:
   - Implement caching strategies
   - Use edge functions where appropriate
   - Monitor API rate limits