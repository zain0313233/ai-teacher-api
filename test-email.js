const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

async function testEmail() {
  try {
    console.log('🔄 Testing SMTP connection...');
    
    const fromEmail = process.env.SMTP_USER || 'your-email@gmail.com';
    const toEmail = process.env.TEST_EMAIL || fromEmail;
    
    const info = await transporter.sendMail({
      from: `AI Teacher <${fromEmail}>`,
      to: toEmail,
      subject: 'Test Email - AI Teacher',
      html: '<h1>Test Email</h1><p>If you receive this, SMTP is working!</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log(`📬 Check your inbox at: ${toEmail}`);
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);
  }
}

testEmail();
