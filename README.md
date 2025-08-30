# 🎌 Meduhentai - Modern Manga Reading Platform

A sophisticated manga reading platform built with Next.js 15, featuring modern UI/UX design, real-time interactions, and comprehensive content management.

## 🌟 Features

### 🎨 **Modern UI/UX Design**
- **Dark Theme**: Stunning glassmorphism design with gradient backgrounds
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: Full ARIA support and keyboard navigation
- **Vietnamese Localization**: Complete Vietnamese interface

### 📚 **Manga Management**
- **Dynamic Homepage**: Featured manga carousel with auto-rotation
- **Advanced Browse**: Filtering by genre, status, and sorting options
- **Detailed Manga Pages**: Comprehensive manga information display
- **Chapter Reader**: Immersive reading experience with navigation
- **User Reactions**: Like/dislike system for manga and chapters

### 👤 **User System**
- **Authentication**: Secure sign-in/sign-up with NextAuth.js
- **User Profiles**: MIMI-style profile pages with stats
- **Role Management**: Admin, Uploader, and Member roles
- **Password Reset**: Email-based password recovery system
- **Favorites System**: Personal manga collections

### 📊 **Analytics & Tracking**
- **Visitor Analytics**: Comprehensive visitor tracking and statistics
- **Real-time Stats**: Live view counts and engagement metrics
- **Admin Dashboard**: Detailed analytics for content management
- **Notification System**: Real-time notifications for interactions

### ☁️ **Cloud Storage Integration**
- **Cloudflare R2**: Direct upload support for large files
- **Image Optimization**: Automatic compression and optimization
- **CDN Integration**: Fast global content delivery
- **CORS Configuration**: Secure cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudflare R2 bucket (optional)
- Email service (for password reset)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/meduhentai-web.git
   cd meduhentai-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # With Turbopack (faster)
   npm run dev --turbopack
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/meduhentai

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_DOMAIN=your_public_domain.r2.dev
R2_REGION=auto

# Email Configuration (Choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Option 2: Gmail SMTP
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Option 3: Custom SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: HeroUI (NextUI), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5
- **Storage**: Cloudflare R2, Vercel Blob
- **Email**: SendGrid, Gmail SMTP, or Custom SMTP

### Project Structure
```
meduhentai-web/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── manga/             # Manga-related pages
│   └── profile/           # User profile pages
├── components/            # Reusable components
├── lib/                   # Utility libraries
├── models/                # MongoDB models
├── public/                # Static assets
└── types/                 # TypeScript definitions
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradients (#6366f1 to #8b5cf6)
- **Secondary**: Pink accents (#ec4899 to #f43f5e)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Dark Theme**: Slate/Gray gradients

### Typography
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable fonts
- **Code**: Monospace for technical content

### Components
- **Glass-morphism**: Transparent backgrounds with blur
- **Gradient Buttons**: Interactive hover effects
- **Animated Elements**: Smooth transitions and animations
- **Responsive Design**: Mobile-first approach

## 🔧 Development

### Scripts
```bash
# Development
npm run dev              # Start development server
npm run dev --turbopack  # Start with Turbopack (faster)

# Production
npm run build           # Build for production
npm run start           # Start production server

# Utilities
npm run lint            # Run ESLint
```

### Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Run migration scripts** (if any)
3. **Seed initial data** using provided scripts

### Testing

```bash
# Test database connection
node scripts/test-mongo.js

# Test email functionality
node scripts/test-email.js

# Test R2 storage
node scripts/test-r2.js

# Test notifications
node scripts/test-notifications.js
```

## 📱 Features Deep Dive

### Authentication System
- **NextAuth.js v5**: Modern authentication with credentials provider
- **Password Reset**: Email-based reset with secure tokens
- **Role-Based Access**: Admin, Uploader, and Member roles
- **Session Management**: Secure session handling

### File Upload System
- **Direct R2 Uploads**: Bypass server limits with presigned URLs
- **Image Compression**: Client-side compression to reduce payload
- **Progress Tracking**: Real-time upload progress
- **File Validation**: Type and size validation

### Notification System
- **Real-time Notifications**: Instant notifications for interactions
- **Comment Notifications**: Notify manga uploaders of new comments
- **Reaction Notifications**: Like/dislike notifications
- **Email Integration**: Optional email notifications

### Visitor Analytics
- **Traffic Tracking**: Monitor visitor behavior and statistics
- **Device Detection**: Mobile, desktop, and tablet analytics
- **Bot Filtering**: Exclude search engine bots
- **Privacy-Focused**: Minimal data collection

## 🛡️ Security

### Authentication
- **Secure Sessions**: NextAuth.js session management
- **Password Hashing**: bcryptjs for secure password storage
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: API rate limiting for security

### File Security
- **Type Validation**: Strict file type checking
- **Size Limits**: Configurable file size limits
- **Secure URLs**: Presigned URLs with expiration
- **Access Control**: Role-based file access

### Privacy
- **GDPR Compliance**: Minimal data collection
- **IP Anonymization**: Visitor tracking without personal data
- **Bot Detection**: Automatic bot filtering
- **Data Retention**: Configurable data retention policies

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure automatic deployments

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Set for Production and Preview environments

3. **Domain Configuration**
   - Configure custom domain if needed
   - Set up SSL certificates

### Database Setup
- **MongoDB Atlas**: Recommended for production
- **Connection String**: Configure in environment variables
- **Indexes**: Ensure proper database indexes

### R2 Storage Setup

1. **Create R2 Bucket**
   ```bash
   # Using Cloudflare dashboard or CLI
   wrangler r2 bucket create your-bucket-name
   ```

2. **Configure CORS**
   ```json
   {
     "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
     "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
     "AllowedHeaders": ["*"],
     "ExposeHeaders": ["ETag", "x-amz-meta-*"],
     "MaxAgeSeconds": 3600
   }
   ```

3. **Set Public Domain**
   - Configure custom domain for R2 bucket
   - Update environment variables

## 🔍 Troubleshooting

### Common Issues

#### Image Loading Problems
- **Symptoms**: Manga covers not displaying
- **Solution**: Check Next.js config remote patterns
- **Fix**: Update `next.config.js` with correct R2 domain

#### Upload Failures
- **Symptoms**: 413 Payload Too Large errors
- **Solution**: Enable image compression
- **Fix**: Reduce file sizes before upload

#### Authentication Issues
- **Symptoms**: Login/logout not working
- **Solution**: Check NextAuth configuration
- **Fix**: Verify NEXTAUTH_SECRET and NEXTAUTH_URL

#### Database Connection
- **Symptoms**: MongoDB connection errors
- **Solution**: Check connection string and network
- **Fix**: Verify MONGODB_URI and database access

### Debug Mode
Enable debug logging:
```bash
DEBUG=true npm run dev
```

### Performance Monitoring
- Use Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Track API response times

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for formatting
- **TypeScript**: Maintain type safety
- **Comments**: Document complex logic

### Testing
- Test on multiple devices and browsers
- Verify mobile responsiveness
- Check accessibility compliance
- Test with different user roles

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- **Issues**: Open GitHub issues for bugs
- **Features**: Request features via GitHub discussions
- **Documentation**: Check this README and inline comments

### Community
- **Discord**: Join our community server
- **GitHub**: Star the repository and contribute
- **Feedback**: Share your experience and suggestions

---

## 📋 API Reference

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Manga Endpoints
- `GET /api/manga` - List manga with filtering and sorting
- `GET /api/manga/[id]` - Get manga details
- `POST /api/manga` - Create new manga (admin only)
- `PUT /api/manga/[id]` - Update manga (admin only)
- `DELETE /api/manga/[id]` - Delete manga (admin only)

### Chapter Endpoints
- `GET /api/chapters/[id]` - Get chapter details
- `POST /api/chapters/[id]/view` - Track chapter view
- `POST /api/chapters/[id]/reactions` - Like/dislike chapter

### User Endpoints
- `GET /api/profile/[userId]` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/avatar` - Upload avatar
- `DELETE /api/profile/avatar` - Remove avatar

### Upload Endpoints
- `POST /api/upload/direct-r2` - Generate R2 presigned URLs
- `POST /api/upload/direct/manga` - Upload manga files
- `POST /api/upload/direct/chapters` - Upload chapter files

### Analytics Endpoints
- `POST /api/analytics/track` - Track visitor activity
- `GET /api/analytics/track` - Get analytics data

## 🎯 Performance Optimizations

### Image Optimization
- **Next.js Image**: Optimized image loading
- **Client Compression**: Reduce file sizes before upload
- **WebP Support**: Modern image format support
- **Lazy Loading**: Efficient image loading

### Code Optimization
- **Turbopack**: Faster development builds
- **Code Splitting**: Automatic code splitting
- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Monitor bundle sizes

### Database Optimization
- **Indexes**: Proper database indexing
- **Aggregation**: Efficient data queries
- **Connection Pooling**: Optimized database connections
- **Caching**: Strategic data caching

---

**Built with ❤️ for the manga community**
