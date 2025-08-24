# Vercel Environment Variables Setup

## Problem
The upload API works locally but fails on Vercel with a 500 error. This is because the R2 environment variables are not configured in Vercel.

## Solution
You need to add the same environment variables from your `.env.local` file to your Vercel project.

## Steps to Fix

### 1. Go to Vercel Dashboard
- Visit [vercel.com](https://vercel.com)
- Sign in to your account
- Select your `meduhentai` project

### 2. Navigate to Environment Variables
- Click on your project
- Go to **Settings** tab
- Click on **Environment Variables** in the left sidebar

### 3. Add the Following Environment Variables

Add each of these variables exactly as they appear in your `.env.local` file:

```
CLOUDFLARE_R2_ACCESS_KEY_ID=025bbb7453cd3fff16128de0d1d918dd
CLOUDFLARE_R2_SECRET_ACCESS_KEY=72c0ec1cdf1c55a9aa527b590f16961a34acf4eaf54700afc7a1bff2ce597264
CLOUDFLARE_R2_ENDPOINT=https://86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=project-image
CLOUDFLARE_R2_ACCOUNT_ID=86a9e43542ceb9d9b531800759299f28
CLOUDFLARE_R2_PUBLIC_DOMAIN=pub-82d1a72b4d7f43a5b4a34f4664d53892.r2.dev
R2_REGION=auto
```

### 4. Set Environment
- For each variable, set **Environment** to **Production** (and optionally **Preview** if you want to test on preview deployments)
- Make sure **Override** is checked if you want to override any existing values

### 5. Redeploy
- After adding all variables, go to **Deployments** tab
- Click **Redeploy** on your latest deployment
- Or push a new commit to trigger a new deployment

## Test the Fix

### 1. Test R2 Configuration
Visit: `https://meduhentai.vercel.app/api/test-r2`

This will show you if all environment variables are properly set.

### 2. Test Upload
Try uploading a manga cover image again. The error should be resolved.

## Troubleshooting

### If Still Getting 500 Errors:
1. **Check Vercel logs**: Go to your deployment → **Functions** → Click on the failed function → Check the logs
2. **Verify environment variables**: Use the `/api/test-r2` endpoint to confirm all variables are set
3. **Check R2 permissions**: Ensure your R2 API keys have the correct permissions for the bucket

### Common Issues:
- **Missing variables**: Make sure all 7 R2 variables are added
- **Wrong values**: Double-check the values match your `.env.local` file
- **Environment scope**: Ensure variables are set for Production environment
- **Case sensitivity**: Variable names must match exactly

## Security Notes
- These environment variables contain sensitive API keys
- They are encrypted in Vercel and only accessible to your deployment
- Never commit them to your Git repository
- Consider rotating your R2 keys periodically

## Support
If you continue to have issues after following these steps, check the Vercel function logs for specific error messages.
