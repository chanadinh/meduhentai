# Fixing R2 CORS Error for Direct Uploads

## The Problem

You're encountering this CORS error:
```
Access to fetch at 'https://project-image.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com/...' 
from origin 'https://meduhentai.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This happens because your R2 bucket doesn't have the proper CORS configuration to allow uploads from your Vercel domain.

## Solution: Configure R2 CORS Policy

### Method 1: Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
   - Sign in to your account

2. **Navigate to R2**
   - Click on **R2 Object Storage** in the left sidebar
   - Select your bucket (e.g., `project-image`)

3. **Access CORS Settings**
   - Click on **Settings** tab
   - Look for **CORS** section
   - Click **Configure CORS**

4. **Add CORS Policy**
   - Click **Add CORS policy**
   - Use this configuration:

```json
[
  {
    "AllowedOrigins": [
      "https://meduhentai.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. **Save Changes**
   - Click **Save** to apply the CORS policy

### Method 2: Using AWS CLI

If you have AWS CLI configured for R2:

1. **Create CORS configuration file** (`cors.json`):
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://meduhentai.vercel.app",
        "http://localhost:3000"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

2. **Apply CORS policy**:
```bash
aws s3api put-bucket-cors \
  --bucket your-bucket-name \
  --cors-configuration file://cors.json \
  --endpoint-url https://your-account-id.r2.cloudflarestorage.com
```

### Method 3: Using R2 API

You can also use the R2 API directly:

```bash
curl -X PUT "https://your-account-id.r2.cloudflarestorage.com/your-bucket-name?cors" \
  -H "Authorization: AWS4-HMAC-SHA256 Credential=your-access-key/20240101/auto/s3/aws4_request" \
  -H "Content-Type: application/xml" \
  -d @cors.xml
```

Where `cors.xml` contains:
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://meduhentai.vercel.app</AllowedOrigin>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

## What Each CORS Setting Does

- **AllowedOrigins**: Domains that can access your R2 bucket
- **AllowedMethods**: HTTP methods allowed (PUT for uploads, GET for downloads)
- **AllowedHeaders**: Headers that can be sent with requests
- **ExposeHeaders**: Headers that will be returned in responses
- **MaxAgeSeconds**: How long browsers can cache the CORS policy

## Testing the Fix

After applying the CORS policy:

1. **Wait a few minutes** for changes to propagate
2. **Try uploading again** using the R2 method
3. **Check browser console** for CORS errors
4. **Verify uploads work** without errors

## Fallback System

If you still encounter CORS issues, the system will automatically:

1. **Detect the CORS error**
2. **Show a warning message**
3. **Fallback to server upload** for that specific page
4. **Continue with the chapter creation**

This ensures your uploads always work, even if R2 isn't properly configured.

## Troubleshooting

### Still Getting CORS Errors?

1. **Verify CORS policy is applied**:
   - Check Cloudflare dashboard
   - Wait for propagation (can take 5-10 minutes)

2. **Check bucket permissions**:
   - Ensure bucket allows public read access
   - Verify API tokens have proper permissions

3. **Test with different browser**:
   - Clear browser cache
   - Try incognito/private mode

4. **Check environment variables**:
   - Verify R2 credentials are correct
   - Ensure `NEXT_PUBLIC_R2_PUBLIC_DOMAIN` is set

### Common Issues

1. **Wrong bucket name**: Double-check your bucket name in CORS policy
2. **Missing methods**: Ensure PUT method is included for uploads
3. **Wrong origin**: Verify your domain is exactly correct
4. **Cache issues**: CORS policies can take time to propagate

## Alternative Solutions

If CORS continues to be problematic:

1. **Use Server Upload**: Switch to server upload method (limited to 25MB per file)
2. **Proxy through your server**: Modify the upload flow to go through your API
3. **Use different storage**: Consider Vercel Blob or other S3-compatible services

## Best Practices

1. **Limit allowed origins** to only your domains
2. **Use specific methods** instead of wildcards when possible
3. **Set appropriate MaxAge** for caching
4. **Test thoroughly** in development before production
5. **Monitor upload logs** for any issues

## Need Help?

If you continue to have issues:

1. **Check Cloudflare support documentation**
2. **Verify your R2 setup** is correct
3. **Test with a simple file** first
4. **Use the fallback system** while troubleshooting

The fallback system ensures your manga uploads continue to work while you resolve any R2 configuration issues.
