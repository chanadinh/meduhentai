# Environment Variables Setup for R2 Direct Uploads

## Required Environment Variables

To fix the "your-r2-domain.com" error and enable proper R2 direct uploads, you need to set these environment variables:

### 1. **Server-Side Environment Variables** (`.env.local`)

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=86a9e43542ceb9d9b531800759299f28
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=project-image
CLOUDFLARE_R2_ENDPOINT=https://86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_DOMAIN=project-image.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com
R2_REGION=auto
```

### 2. **Client-Side Environment Variables** (`.env.local`)

```env
# Public R2 Domain (for client-side URL construction)
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=project-image.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com
```

## How to Set Environment Variables

### **Option 1: Local Development (.env.local)**

1. **Create or edit** `.env.local` in your project root
2. **Add the variables** above
3. **Restart your development server**

### **Option 2: Vercel Deployment**

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add each variable** with the correct values
3. **Redeploy** your application

### **Option 3: Using Vercel CLI**

```bash
vercel env add CLOUDFLARE_R2_ACCOUNT_ID
vercel env add CLOUDFLARE_R2_ACCESS_KEY_ID
vercel env add CLOUDFLARE_R2_SECRET_ACCESS_KEY
vercel env add CLOUDFLARE_R2_BUCKET_NAME
vercel env add CLOUDFLARE_R2_ENDPOINT
vercel env add CLOUDFLARE_R2_PUBLIC_DOMAIN
vercel env add R2_REGION
vercel env add NEXT_PUBLIC_R2_PUBLIC_DOMAIN
```

## Current Values from Your Setup

Based on the error logs, your current R2 configuration is:

- **Account ID**: `86a9e43542ceb9d9b531800759299f28`
- **Bucket Name**: `project-image`
- **Public Domain**: `project-image.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com`

## Verification Steps

### 1. **Check Current Environment Variables**

```bash
# In your project directory
cat .env.local
```

### 2. **Verify R2 Access**

Test if your R2 credentials work:

```bash
# Using AWS CLI (if configured)
aws s3 ls s3://project-image \
  --endpoint-url https://86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com
```

### 3. **Test Public Access**

Try accessing a file directly:
```
https://project-image.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com/chapters/1756019849265_002.jpg
```

## Troubleshooting

### **Still Getting "your-r2-domain.com" Error?**

1. **Check environment variables** are properly set
2. **Restart development server** after changing `.env.local`
3. **Verify variable names** match exactly (case-sensitive)
4. **Check for typos** in the domain values

### **Environment Variables Not Loading?**

1. **File location**: Ensure `.env.local` is in project root
2. **File format**: No spaces around `=` sign
3. **Quotes**: Don't wrap values in quotes unless needed
4. **Restart**: Always restart server after changes

### **Vercel Deployment Issues?**

1. **Environment variables** must be set in Vercel dashboard
2. **Redeploy** after adding variables
3. **Check logs** for any environment-related errors

## Quick Fix

If you want to test immediately without setting environment variables, the code now has a fallback that uses your actual R2 domain:

```typescript
const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || 
                 process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 
                 `${bucket}.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com`;
```

This means it should work even without environment variables, but setting them properly is recommended for production.

## Next Steps

1. **Set the environment variables** using one of the methods above
2. **Restart your development server**
3. **Try uploading again** - the URLs should now be correct
4. **Verify images load** in the chapter viewer

## Security Note

- **Never commit** `.env.local` to version control
- **Use Vercel dashboard** for production environment variables
- **Rotate R2 credentials** regularly
- **Limit R2 permissions** to only what's needed
