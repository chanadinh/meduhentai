# Password Reset Functionality

This document explains how to set up and use the password reset functionality in the Meduhentai web application.

## Overview

The password reset system allows users to:
1. Request a password reset by entering their email address
2. Receive a secure reset link via email
3. Set a new password using the reset link
4. The reset link expires after 1 hour for security

## Features

- **Secure Token Generation**: Uses cryptographically secure random tokens
- **Time-Limited Links**: Reset links expire after 1 hour
- **Email Integration**: Supports multiple email services
- **User-Friendly UI**: Clean, responsive design matching the app's theme
- **Security Best Practices**: Tokens are cleared after use

## Setup

### 1. Environment Variables

Add the following email configuration to your `.env` file:

```bash
# Choose one email service:

# Option 1: SMTP (Generic)
SMTP_HOST=smtp.meduhentai.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@meduhentai.com

# Option 2: Gmail SMTP
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Option 3: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Option 4: Ethereal (for testing/development)
ETHEREAL_USER=your_ethereal_username
ETHEREAL_PASS=your_ethereal_password
```

### 2. Email Service Setup

#### Gmail SMTP
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the generated password in `GMAIL_APP_PASSWORD`

#### SendGrid
1. Create a SendGrid account
2. Generate an API key
3. Add the API key to `SENDGRID_API_KEY`

#### Custom SMTP
1. Configure your SMTP server settings
2. Use the appropriate host, port, and credentials

### 3. Database Schema Update

The User model has been updated to include reset token fields:
- `resetToken`: Stores the password reset token
- `resetTokenExpiry`: Stores when the token expires

## API Endpoints

### 1. Request Password Reset
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### 2. Validate Reset Token
```
POST /api/auth/validate-reset-token
Body: { "token": "reset_token_here" }
```

### 3. Reset Password
```
POST /api/auth/reset-password
Body: { "token": "reset_token_here", "password": "new_password" }
```

## User Flow

1. **User clicks "Forgot Password?"** on the signin page
2. **User enters email** on the forgot password page
3. **System generates reset token** and sends email
4. **User clicks email link** to go to reset password page
5. **User enters new password** and confirms it
6. **System updates password** and clears reset token
7. **User is redirected** to signin page

## Pages

- `/auth/forgot-password` - Request password reset
- `/auth/reset-password?token=...` - Set new password

## Security Features

- **Token Expiration**: Reset links expire after 1 hour
- **Secure Tokens**: Uses crypto.randomBytes(32) for token generation
- **Token Cleanup**: Tokens are cleared after successful password reset
- **Rate Limiting**: Consider implementing rate limiting for production
- **Email Validation**: Tokens are validated before allowing password reset

## Testing

### Development Testing
For development, you can use Ethereal Email:
1. Set `NODE_ENV=development`
2. Configure `ETHEREAL_USER` and `ETHEREAL_PASS`
3. Check the console for reset URLs (for testing purposes)

### Production Testing
1. Set up a real email service (Gmail, SendGrid, etc.)
2. Test the complete flow with a real email address
3. Verify email delivery and link functionality

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check email service configuration
   - Verify environment variables
   - Check console for error messages

2. **Reset links not working**
   - Verify token expiration (1 hour)
   - Check if token was cleared after previous use
   - Ensure proper URL formatting

3. **Database errors**
   - Verify MongoDB connection
   - Check if User model is properly updated
   - Ensure indexes are created

### Debug Mode

Enable debug logging by checking the console for:
- Password reset URLs (development only)
- Email sending status
- Token validation results

## Production Considerations

1. **Email Service**: Use a reliable email service (SendGrid, AWS SES, etc.)
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Monitoring**: Monitor email delivery rates and failures
4. **Backup**: Consider backup email service for reliability
5. **Security**: Regularly review and update security measures

## Customization

### Email Templates
Modify email templates in `lib/email.ts`:
- HTML styling and layout
- Email content and messaging
- Branding and colors

### Token Expiration
Change token expiration time in `app/api/auth/forgot-password/route.ts`:
```typescript
const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
```

### UI Styling
Customize the UI by modifying:
- `app/auth/forgot-password/page.tsx`
- `app/auth/reset-password/page.tsx`
- CSS classes and Tailwind utilities

## Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variable configuration
3. Test with a simple email service first
4. Review the API endpoint responses
