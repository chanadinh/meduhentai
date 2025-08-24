import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email content interface
interface EmailContent {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter based on environment
function createTransporter() {
  console.log('🔧 Creating email transporter...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
  console.log('SMTP_HOST exists:', !!process.env.SMTP_HOST);
  console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);
  
  // SendGrid (if configured) - prioritize this even in development
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid configuration');
    // Try port 587 first, fallback to 2525 if needed
    const sendGridConfig = {
      host: 'smtp.sendgrid.net',
      port: parseInt(process.env.SENDGRID_PORT || '587'),
      secure: false, // Use STARTTLS
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    };

    console.log('SendGrid config:', {
      host: sendGridConfig.host,
      port: sendGridConfig.port,
      secure: sendGridConfig.secure,
      requireTLS: sendGridConfig.requireTLS
    });

    // If port 587 fails, you can set SENDGRID_PORT=2525 in your .env
    return nodemailer.createTransport(sendGridConfig);
  }

  // For development/testing, you can use services like Mailtrap or Ethereal
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Using Ethereal email for development (SendGrid not configured)');
    // Ethereal email for testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'testpass'
      }
    });
  }

  // For production, use your email service
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Using custom SMTP configuration');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    } as EmailConfig);
  }

  // Gmail SMTP (if configured)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('📧 Using Gmail SMTP configuration');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  console.error('❌ No email service configured');
  throw new Error('No email service configured');
}

// Send email function
export async function sendEmail(content: EmailContent): Promise<boolean> {
  console.log('📧 sendEmail function called with:', {
    to: content.to,
    subject: content.subject,
    hasHtml: !!content.html,
    hasText: !!content.text
  });
  
  try {
    console.log('🔧 Creating transporter...');
    const transporter = createTransporter();
    console.log('✅ Transporter created successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@meduhentai.com',
      to: content.to,
      subject: content.subject,
      html: content.html,
      text: content.text || content.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!', {
      messageId: result.messageId,
      response: result.response
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Enhanced error logging for SendGrid issues
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      console.error('SendGrid Authentication/Connection Error Details:');
      console.error('- Check if SENDGRID_API_KEY is set correctly');
      console.error('- Verify API key has full permissions');
      console.error('- Try different ports (587, 2525, 25)');
      console.error('- Ensure TLS 1.2+ is supported');
      console.error('- Check firewall/network restrictions');
    }
    
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string, username: string): Promise<boolean> {
  const subject = 'Yêu cầu đặt lại mật khẩu - Meduhentai';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #8b5cf6; }
        .button { display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Meduhentai</div>
        </div>
        
        <h2>Xin chào ${username},</h2>
        
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Meduhentai của mình.</p>
        
        <p>Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
        </div>
        
        <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
        <p style="word-break: break-all; color: #8b5cf6;">${resetUrl}</p>
        
        <div class="warning">
          <strong>Quan trọng:</strong> Liên kết này sẽ hết hạn sau 1 giờ vì lý do bảo mật.
        </div>
        
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
        
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với nhóm hỗ trợ của chúng tôi tại support@meduhentai.com</p>
        
        <div class="footer">
          <p>Trân trọng,<br>Đội ngũ Meduhentai</p>
          <p>Đây là email tự động. Vui lòng không trả lời tin nhắn này.</p>
          <p>Truy cập chúng tôi tại: <a href="https://meduhentai.com">meduhentai.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html
  });
}

// Send welcome email (optional)
export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const subject = 'Chào mừng bạn đến với Meduhentai!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng đến với Meduhentai</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #8b5cf6; }
        .button { display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Meduhentai</div>
        </div>
        
        <h2>Chào mừng bạn đến với Meduhentai, ${username}!</h2>
        
        <p>Cảm ơn bạn đã tạo tài khoản với chúng tôi. Chúng tôi rất vui mừng khi có bạn tham gia cộng đồng của chúng tôi!</p>
        
        <p>Bây giờ bạn có thể:</p>
        <ul>
          <li>Duyệt và đọc manga</li>
          <li>Thêm manga vào danh sách yêu thích</li>
          <li>Để lại bình luận và phản ứng</li>
          <li>Tùy chỉnh tùy chọn đọc của bạn</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL || 'https://meduhentai.com'}" class="button">Bắt đầu đọc</a>
        </div>
        
        <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần giúp đỡ, đừng ngần ngại liên hệ với nhóm hỗ trợ của chúng tôi tại support@meduhentai.com</p>
        
        <div class="footer">
          <p>Chúc bạn đọc truyện vui vẻ!<br>Đội ngũ Meduhentai</p>
          <p>Truy cập chúng tôi tại: <a href="https://meduhentai.com">meduhentai.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html
  });
}
