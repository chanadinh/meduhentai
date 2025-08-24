# Direct Upload to Vercel Blob

This feature allows users to upload large files (up to 1GB) directly to Vercel Blob storage, bypassing the 100MB serverless function limit.

## Features

- **Large File Support**: Upload files up to 1GB directly to Vercel Blob
- **Secure Authentication**: Only authenticated admin users can upload
- **File Validation**: Automatic validation of file types and sizes
- **Progress Tracking**: Real-time upload progress and results
- **Separate Upload Types**: Dedicated uploads for manga and chapter files

## Setup

### 1. Install Dependencies

```bash
npm install @vercel/blob
```

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### 3. Vercel Configuration

Make sure your Vercel project has Blob storage enabled and configured.

## Usage

### Access the Direct Upload Page

Navigate to `/admin/upload/direct` in your admin panel.

### Upload Process

1. **Select Files**: Choose manga or chapter image files
2. **Validation**: Files are automatically validated for:
   - File type (JPEG, PNG, WebP)
   - File size (up to 1GB)
3. **Upload**: Files are uploaded directly to Vercel Blob
4. **Results**: Get direct links to uploaded files

### File Requirements

- **Supported Formats**: JPEG, JPG, PNG, WebP
- **Maximum Size**: 1GB per file
- **Authentication**: Admin access required

## API Endpoints

### `/api/upload/direct/manga`

Handles manga file uploads with admin authentication.

### `/api/upload/direct/chapters`

Handles chapter file uploads with admin authentication.

## Security Features

- **Admin-Only Access**: Restricted to users with admin role
- **Token-Based Uploads**: Secure token exchange for uploads
- **File Type Validation**: Only allows image files
- **Size Limits**: Enforced client-side and server-side

## Benefits

1. **Bypass Server Limits**: No more 100MB Vercel function restrictions
2. **Better Performance**: Direct uploads to blob storage
3. **Scalability**: Handle large files efficiently
4. **User Experience**: Support for high-quality manga images

## Limitations

- **Local Development**: `onUploadCompleted` callback won't work on localhost
- **Vercel Blob Dependency**: Requires Vercel Blob storage
- **Admin Access Required**: Only administrators can upload

## Development Notes

For local development with full upload flow:

1. Use ngrok or similar tunneling service
2. Set up proper environment variables
3. Test with smaller files first

## Integration

The uploaded blob URLs can be integrated with your existing manga management system:

```typescript
// Example: Using blob URL in manga creation
const mangaData = {
  title: "Manga Title",
  coverImage: blob.url, // Direct blob URL
  // ... other fields
};
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure user has admin role
2. **File Size Errors**: Check if file exceeds 1GB limit
3. **File Type Errors**: Ensure file is JPEG, PNG, or WebP
4. **Upload Failures**: Check Vercel Blob configuration

### Debug Steps

1. Check browser console for errors
2. Verify environment variables
3. Confirm Vercel Blob setup
4. Test with smaller files first

## Future Enhancements

- [ ] Progress bars for large uploads
- [ ] Batch upload processing
- [ ] File compression options
- [ ] Upload history tracking
- [ ] Integration with existing upload workflows
