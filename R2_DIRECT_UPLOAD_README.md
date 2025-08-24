# Direct Upload to Cloudflare R2

This feature allows users to upload large files (up to 1GB) directly to Cloudflare R2 storage using presigned URLs, completely bypassing server processing limits.

## How It Works

### 1. **Presigned URL Flow**
1. **Client Request**: User selects files and requests upload
2. **Server Validation**: Server validates user permissions and file details
3. **URL Generation**: Server generates a presigned URL for R2
4. **Direct Upload**: Client uploads directly to R2 using the presigned URL
5. **Result**: File is stored in R2 with metadata

### 2. **Security Features**
- **Admin-Only Access**: Restricted to users with admin role
- **Token Expiration**: Presigned URLs expire after 1 hour
- **File Validation**: Server-side validation of file types and sizes
- **Metadata Tracking**: All uploads include user and timestamp metadata

## Setup

### 1. **Environment Variables**

Add these to your `.env.local` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_DOMAIN=your_public_domain.com
R2_REGION=auto

# Public R2 Domain (for client-side URL construction)
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=your_public_domain.com
```

### 2. **R2 Bucket Configuration**

1. **Create R2 Bucket**: In Cloudflare dashboard
2. **Set Public Access**: Configure bucket for public read access
3. **CORS Policy**: Add CORS rules for your domain
4. **Custom Domain**: Set up custom domain for public access

### 3. **CORS Configuration**

Add this CORS policy to your R2 bucket:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## Usage

### Access the R2 Upload Page

Navigate to `/admin/upload/direct-r2` in your admin panel.

### Upload Process

1. **Select Files**: Choose manga or chapter image files
2. **Validation**: Files are validated for:
   - File type (JPEG, PNG, WebP)
   - File size (up to 1GB)
3. **Upload**: Files are uploaded directly to R2 using presigned URLs
4. **Progress**: Real-time upload progress tracking
5. **Results**: Get direct links to uploaded files

## API Endpoints

### `POST /api/upload/direct-r2`

Generates presigned URLs for direct R2 uploads.

**Request Body:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "folder": "manga",
  "fileSize": 1048576
}
```

**Response:**
```json
{
  "success": true,
  "presignedUrl": "https://...",
  "key": "manga/1234567890_image.jpg",
  "bucket": "your-bucket",
  "expiresIn": 3600,
  "uploadInfo": {
    "filename": "image.jpg",
    "contentType": "image/jpeg",
    "folder": "manga",
    "key": "manga/1234567890_image.jpg",
    "uploadedBy": "user_id",
    "uploadedAt": 1234567890
  }
}
```

## Benefits

### 1. **No Server Limits**
- Bypass Vercel's 100MB serverless function limit
- Support files up to 1GB (or more based on R2 limits)
- No server processing overhead

### 2. **Better Performance**
- Direct uploads to R2 storage
- Faster upload speeds
- Reduced server load

### 3. **Cost Effective**
- R2 pricing is often cheaper than Vercel Blob
- No serverless function execution costs
- Predictable storage costs

### 4. **Scalability**
- Handle multiple large uploads simultaneously
- No server timeout issues
- Better for high-traffic scenarios

## File Requirements

- **Supported Formats**: JPEG, JPG, PNG, WebP
- **Maximum Size**: 1GB per file (configurable)
- **Authentication**: Admin access required
- **File Naming**: Automatic sanitization and timestamping

## Security Considerations

### 1. **Access Control**
- Only admin users can generate presigned URLs
- URLs expire after 1 hour
- Server validates all file details before URL generation

### 2. **File Validation**
- Content type validation
- File size limits
- File name sanitization

### 3. **Metadata Tracking**
- All uploads include user ID and timestamp
- Audit trail for security monitoring
- File ownership tracking

## Integration Examples

### 1. **Manga Creation**
```typescript
// After successful upload, use the R2 URL
const mangaData = {
  title: "Manga Title",
  coverImage: result.url, // R2 public URL
  // ... other fields
};
```

### 2. **Chapter Upload**
```typescript
// Upload chapter pages to R2
const chapterPages = uploadResults.map(result => ({
  pageNumber: result.pageNumber,
  imageUrl: result.url, // R2 public URL
  // ... other metadata
}));
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check R2 bucket CORS configuration
   - Verify allowed origins include your domain

2. **Authentication Errors**
   - Ensure user has admin role
   - Check session validity

3. **Upload Failures**
   - Verify R2 credentials
   - Check bucket permissions
   - Ensure bucket exists and is accessible

4. **URL Construction Issues**
   - Verify `NEXT_PUBLIC_R2_PUBLIC_DOMAIN` environment variable
   - Check R2 public domain configuration

### Debug Steps

1. **Check Browser Console**: Look for network errors
2. **Verify Environment Variables**: Ensure all R2 variables are set
3. **Test R2 Access**: Verify bucket access with AWS CLI
4. **Check File Permissions**: Ensure R2 bucket allows public read access

## Performance Optimization

### 1. **Batch Uploads**
- Upload multiple files simultaneously
- Progress tracking for each file
- Efficient error handling

### 2. **File Validation**
- Client-side validation before upload
- Server-side validation for security
- Optimized file type checking

### 3. **Progress Tracking**
- Real-time upload progress
- Visual progress indicators
- Upload status feedback

## Future Enhancements

- [ ] Resumable uploads for very large files
- [ ] Chunked upload support
- [ ] Background upload processing
- [ ] Upload queue management
- [ ] Advanced file compression
- [ ] Upload analytics and reporting
- [ ] Integration with CDN for faster delivery

## Comparison: R2 vs Vercel Blob

| Feature | R2 Direct Upload | Vercel Blob |
|---------|------------------|-------------|
| **File Size Limit** | 1GB+ | 100MB (server limit) |
| **Cost** | Lower storage costs | Higher execution costs |
| **Performance** | Direct uploads | Server processing |
| **Scalability** | Unlimited | Serverless limits |
| **Control** | Full control | Vercel managed |
| **Setup** | More complex | Simpler |

## Best Practices

1. **File Organization**: Use consistent folder structures
2. **Naming Conventions**: Implement clear file naming
3. **Error Handling**: Graceful fallbacks for upload failures
4. **User Feedback**: Clear progress and status information
5. **Security**: Regular audit of access controls
6. **Monitoring**: Track upload success rates and errors
